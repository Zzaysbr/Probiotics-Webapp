<script setup>
import { computed, reactive, ref, onMounted } from "vue";
import CheckoutSteps from "../components/CheckoutSteps.vue";
import { useRouter } from "vue-router";
import api, { money, errorMessage } from "../services/api";
import { cartItems, removeItem, clearCart } from "../services/cart";
import { authState } from "../services/auth";
const router = useRouter(),
  busy = ref(false),
  error = ref(""),
  notice = ref(""),
  loading = ref(true);
const blocked = computed(() =>
  cartItems.value.some((p) => p.unavailable || p.stock_qty < p.quantity),
);
async function refreshCart() {
  if (!cartItems.value.length) return false;
  const { data } = await api.post("/cart/refresh", {
    product_ids: cartItems.value.map((p) => p.product_id),
  });
  let changed = false;
  cartItems.value = cartItems.value.map((item) => {
    const current = data.data.find((p) => p.product_id === item.product_id);
    const unavailable = !current || !current.is_active;
    if (
      unavailable ||
      Number(item.price) !== Number(current.price) ||
      item.stock_qty !== current.stock_qty
    )
      changed = true;
    return current
      ? { ...item, ...current, quantity: item.quantity, unavailable }
      : { ...item, unavailable: true, stock_qty: 0 };
  });
  return changed;
}
async function refresh() {
  loading.value = true;
  error.value = "";
  try {
    if (await refreshCart())
      notice.value =
        "ราคา/สต็อกได้รับการอัปเดตแล้ว กรุณาตรวจสอบยอดและจำนวนก่อนยืนยัน";
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    loading.value = false;
  }
}
onMounted(refresh);
const form = reactive({
  recipient_name: authState.user?.full_name || "",
  recipient_phone: authState.user?.phone || "",
  shipping_address: "",
});
const total = computed(
  () =>
    cartItems.value.reduce(
      (sum, p) => sum + Math.round(Number(p.price) * 100) * p.quantity,
      0,
    ) / 100,
);
async function checkout() {
  busy.value = true;
  error.value = "";
  try {
    if (await refreshCart()) {
      notice.value =
        "ราคา/สต็อกเปลี่ยนแปลง กรุณาตรวจสอบข้อมูลใหม่ แล้วกดยืนยันอีกครั้ง";
      return;
    }
    if (blocked.value) {
      error.value =
        "มีสินค้าไม่พร้อมขายหรือจำนวนเกินสต็อก กรุณาปรับจำนวนหรือนำสินค้าออก";
      return;
    }
    const body = {
        ...form,
        items: cartItems.value.map((p) => ({
          product_id: p.product_id,
          quantity: p.quantity,
          expected_unit_price: p.price,
        })),
        expected_total: total.value.toFixed(2),
      },
      fingerprint = JSON.stringify(body),
      store = `checkout-${authState.user.id}`;
    let attempt;
    try {
      attempt = JSON.parse(sessionStorage.getItem(store));
    } catch {}
    if (attempt?.fingerprint !== fingerprint)
      attempt = { fingerprint, key: crypto.randomUUID() };
    sessionStorage.setItem(store, JSON.stringify(attempt));
    const { data } = await api.post("/orders", body, {
      headers: { "Idempotency-Key": attempt.key },
    });
    clearCart();
    sessionStorage.removeItem(store);
    await router.push("/orders/" + data.order_id);
  } catch (e) {
    error.value = errorMessage(e);
    if (e.response?.status === 409) await refreshCart().catch(() => {});
  } finally {
    busy.value = false;
  }
}
</script>
<template>
  <main class="shop-page container">
    <p class="eyebrow">YOUR CART</p>
    <h1>ตะกร้าสินค้า</h1>
    <p class="text-secondary mb-4">
      ตรวจสอบรายการและกรอกข้อมูลจัดส่ง ก่อนยืนยันคำสั่งซื้อ
    </p>
    <CheckoutSteps :step="2" />
    <div v-if="error" class="alert alert-danger" role="alert">{{ error }}</div>
    <p v-if="notice" class="alert alert-success" role="status">{{ notice }}</p>
    <button
      v-if="cartItems.length"
      type="button"
      class="btn btn-outline-success mb-3"
      :disabled="busy || loading"
      @click="refresh"
    >
      อัปเดตราคาและสต็อกล่าสุด
    </button>
    <p v-if="loading" role="status">กำลังตรวจราคาและสต็อกล่าสุด…</p>
    <div v-if="!cartItems.length" class="shop-panel text-center py-5">
      <h2 class="h4">ยังไม่มีสินค้าในตะกร้า</h2>
      <RouterLink to="/products" class="btn btn-success mt-3"
        >เลือกซื้อสินค้า</RouterLink
      >
    </div>
    <form v-else class="row g-4" @submit.prevent="checkout">
      <div class="col-lg-7">
        <section class="shop-panel mb-4">
          <h2 class="h4">รายการสินค้า</h2>
          <div v-for="p in cartItems" :key="p.product_id" class="cart-row">
            <div>
              <strong>{{ p.product_name }}</strong>
              <p
                v-if="p.unavailable || p.stock_qty < p.quantity"
                class="text-danger mb-0"
              >
                {{
                  p.unavailable
                    ? "สินค้านี้ไม่พร้อมขาย กรุณานำออกจากตะกร้า"
                    : "จำนวนเกินสต็อก คงเหลือ " + p.stock_qty + " ชิ้น"
                }}
              </p>
              <p class="small text-secondary mb-0">
                {{ money(p.price) }} / ชิ้น
              </p>
            </div>
            <div class="d-flex align-items-center gap-2">
              <label :for="'qty-' + p.product_id" class="visually-hidden"
                >จำนวน {{ p.product_name }}</label
              ><input
                :id="'qty-' + p.product_id"
                v-model.number="p.quantity"
                class="form-control quantity-input"
                type="number"
                min="1"
                :max="Math.min(p.stock_qty, 999)"
                required
                :disabled="busy"
              /><button
                type="button"
                class="btn btn-outline-danger"
                :disabled="busy"
                @click="removeItem(p.product_id)"
              >
                ลบ
              </button>
            </div>
          </div>
        </section>
        <section class="shop-panel">
          <h2 class="h4">ข้อมูลจัดส่ง</h2>
          <label class="form-label" for="recipient">ชื่อผู้รับ</label
          ><input
            id="recipient"
            v-model.trim="form.recipient_name"
            class="form-control mb-3"
            maxlength="150"
            required
            :disabled="busy"
          /><label class="form-label" for="phone">เบอร์โทรผู้รับ</label
          ><input
            id="phone"
            v-model.trim="form.recipient_phone"
            type="tel"
            class="form-control mb-3"
            pattern="[0-9+\(\) \-]{8,20}"
            maxlength="20"
            required
            :disabled="busy"
          /><label class="form-label" for="address">ที่อยู่จัดส่ง</label
          ><textarea
            id="address"
            v-model.trim="form.shipping_address"
            rows="4"
            class="form-control"
            maxlength="2000"
            required
            :disabled="busy"
          ></textarea>
        </section>
      </div>
      <div class="col-lg-5">
        <section class="shop-panel summary-sticky">
          <h2 class="h4">สรุปคำสั่งซื้อ</h2>
          <p class="d-flex justify-content-between">
            <span>ยอดสินค้า</span><strong>{{ money(total) }}</strong>
          </p>
          <p class="d-flex justify-content-between">
            <span>ค่าจัดส่ง</span><span>ฟรี</span>
          </p>
          <hr />
          <p class="d-flex justify-content-between h4">
            <span>ยอดรวม</span><strong>{{ money(total) }}</strong>
          </p>
          <p class="small text-secondary">
            ระบบจะตรวจราคาและสต็อกล่าสุดอีกครั้งเมื่อยืนยัน
          </p>
          <button
            class="btn btn-success w-100"
            :disabled="busy || loading || blocked"
          >
            {{
              busy ? "กำลังบันทึก…" : "ยืนยันคำสั่งซื้อและไปชำระเงิน"
            }}</button
          ><RouterLink class="d-block text-center mt-3" to="/products"
            >เลือกสินค้าเพิ่มเติม</RouterLink
          >
        </section>
      </div>
    </form>
  </main>
</template>
