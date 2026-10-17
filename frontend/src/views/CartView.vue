<script setup>
import { computed, reactive, ref } from "vue";
import CheckoutSteps from "../components/CheckoutSteps.vue";
import { useRouter } from "vue-router";
import api, { money, errorMessage } from "../services/api";
import { cartItems, removeItem, clearCart } from "../services/cart";
import { authState } from "../services/auth";
const router = useRouter(),
  busy = ref(false),
  error = ref("");
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
    const body = {
        ...form,
        items: cartItems.value.map((p) => ({
          product_id: p.product_id,
          quantity: p.quantity,
        })),
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
          <button class="btn btn-success w-100" :disabled="busy">
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
