<script setup>
import { ref, onMounted, reactive, computed } from "vue";
import CheckoutSteps from "../components/CheckoutSteps.vue";
import { useRoute } from "vue-router";
import api, {
  money,
  statusName,
  errorMessage,
  download,
} from "../services/api";
import { isAdmin } from "../services/auth";
const shipping = reactive({ carrier: "", tracking_no: "" });
const paidStatuses = ["paid", "shipped", "completed"];
async function saveShipping() {
  busy.value = true;
  error.value = "";
  try {
    await api.post("/admin/orders/" + route.params.id + "/shipping", shipping);
    notice.value = "บันทึกข้อมูลจัดส่งแล้ว";
    await load();
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    busy.value = false;
  }
}
async function complete() {
  busy.value = true;
  error.value = "";
  try {
    await api.post("/admin/orders/" + route.params.id + "/complete");
    notice.value = "บันทึกคำสั่งซื้อสำเร็จแล้ว";
    await load();
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    busy.value = false;
  }
}
const route = useRoute(),
  details = ref(null),
  shop = ref({}),
  error = ref(""),
  notice = ref(""),
  busy = ref(false),
  file = ref(null),
  confirmCancel = ref(false);
const form = reactive({ amount: "", transferred_at: "" });
const latest = computed(() => details.value?.payments?.[0]);
async function load() {
  try {
    details.value = (await api.get("/orders/" + route.params.id)).data;
    form.amount = details.value.order.total_amount;
    shipping.carrier = details.value.order.carrier || "";
    shipping.tracking_no = details.value.order.tracking_no || "";
    shop.value = (await api.get("/shop")).data;
  } catch (e) {
    error.value = errorMessage(e);
  }
}
async function pay() {
  busy.value = true;
  error.value = "";
  try {
    const body = new FormData();
    body.append("amount", form.amount);
    body.append("transferred_at", form.transferred_at);
    body.append("slip", file.value);
    await api.post("/orders/" + route.params.id + "/payments", body);
    notice.value =
      "ส่งข้อมูลการชำระเงินสำเร็จ สามารถดาวน์โหลดเอกสารด้านล่างได้";
    await load();
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    busy.value = false;
  }
}
async function cancel() {
  busy.value = true;
  error.value = "";
  try {
    await api.post("/orders/" + route.params.id + "/cancel");
    confirmCancel.value = false;
    notice.value = "ยกเลิกคำสั่งซื้อแล้ว";
    await load();
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    busy.value = false;
  }
}
async function receipt() {
  busy.value = true;
  try {
    await download(
      "/orders/" + route.params.id + "/receipt",
      "receipt-" + route.params.id + ".pdf",
    );
  } catch (e) {
    error.value =
      "ไม่สามารถดาวน์โหลด PDF ได้ กรุณาตรวจว่ามีการแจ้งชำระเงินแล้ว";
  } finally {
    busy.value = false;
  }
}
onMounted(load);
</script>
<template>
  <main class="shop-page container">
    <RouterLink to="/orders">← คำสั่งซื้อของฉัน</RouterLink>
    <div v-if="error" class="alert alert-danger mt-3" role="alert">
      {{ error }}
    </div>
    <div v-if="notice" class="alert alert-success mt-3" role="status">
      {{ notice }}
    </div>
    <p v-if="!details && !error" role="status">กำลังโหลด…</p>
    <template v-if="details"
      ><div class="page-heading mt-4">
        <div>
          <p class="eyebrow">ORDER DETAILS</p>
          <h1 class="h2">{{ details.order.order_no }}</h1>
          <p>
            {{ details.order.created_at }} ·
            <strong>{{ statusName(details.order.order_status) }}</strong>
          </p>
        </div>
        <button class="btn btn-outline-success" :disabled="busy" @click="load">
          อัปเดตสถานะ
        </button>
      </div>
      <CheckoutSteps
        :step="
          ['pending_review', ...paidStatuses].includes(
            details.order.order_status,
          )
            ? 4
            : 3
        "
        v-if="details.order.order_status !== 'cancelled'"
      />
      <section v-if="details.order.tracking_no" class="shop-panel mb-4">
        <h2 class="h4">ติดตามการจัดส่ง</h2>
        <p>ขนส่ง: {{ details.order.carrier }}</p>
        <p>
          เลขพัสดุ: <strong>{{ details.order.tracking_no }}</strong>
        </p>
        <p>จัดส่งเมื่อ {{ details.order.shipped_at }} (เวลาไทย)</p>
        <p v-if="details.order.delivered_at">
          ยืนยันสำเร็จเมื่อ {{ details.order.delivered_at }}
        </p>
      </section>
      <section
        v-if="
          isAdmin() && ['paid', 'shipped'].includes(details.order.order_status)
        "
        class="shop-panel mb-4"
      >
        <h2 class="h4">จัดการการจัดส่ง</h2>
        <form class="row g-3" @submit.prevent="saveShipping">
          <div class="col-md-6">
            <label for="carrier" class="form-label">บริษัทขนส่ง</label
            ><input
              id="carrier"
              v-model.trim="shipping.carrier"
              class="form-control"
              maxlength="100"
              required
            />
          </div>
          <div class="col-md-6">
            <label for="tracking" class="form-label">เลขพัสดุ</label
            ><input
              id="tracking"
              v-model.trim="shipping.tracking_no"
              class="form-control"
              maxlength="100"
              required
            />
          </div>
          <div>
            <button class="btn btn-success" :disabled="busy">
              บันทึกข้อมูลจัดส่ง
            </button>
          </div>
        </form>
        <button
          v-if="details.order.order_status === 'shipped'"
          type="button"
          class="btn btn-outline-success mt-3"
          :disabled="busy"
          @click="complete"
        >
          ยืนยันจัดส่งสำเร็จ
        </button>
      </section>
      <div class="row g-4">
        <div class="col-lg-7">
          <section class="shop-panel mb-4">
            <h2 class="h4">รายการสั่งซื้อ</h2>
            <div
              class="cart-row"
              v-for="p in details.items"
              :key="p.order_item_id"
            >
              <div>
                {{ p.product_name_snapshot }}
                <p class="small text-secondary mb-0">
                  {{ p.sku_snapshot }} · {{ p.quantity }} ×
                  {{ money(p.unit_price) }}
                </p>
              </div>
              <strong>{{ money(p.quantity * Number(p.unit_price)) }}</strong>
            </div>
            <p class="text-end">
              ค่าจัดส่ง {{ money(details.order.shipping_fee) }}
            </p>
            <p class="text-end h4">
              ยอดชำระสุทธิ {{ money(details.order.total_amount) }}
            </p>
          </section>
          <section class="shop-panel mb-4">
            <h2 class="h4">ข้อมูลผู้รับ</h2>
            <p>
              {{ details.order.recipient_name }} ·
              {{ details.order.recipient_phone }}
            </p>
            <p class="preserve-lines">{{ details.order.shipping_address }}</p>
          </section>
          <section class="shop-panel" v-if="details.payments.length">
            <h2 class="h4">ประวัติแจ้งชำระเงิน</h2>
            <div
              v-for="p in details.payments"
              :key="p.payment_id"
              class="py-2 border-bottom"
            >
              <strong
                >{{ statusName(p.status) }} · {{ money(p.amount) }}</strong
              >
              <p class="small mb-0">เวลาโอน {{ p.transferred_at }}</p>
              <p v-if="p.rejection_reason" class="text-danger">
                เหตุผล: {{ p.rejection_reason }}
              </p>
            </div>
          </section>
        </div>
        <div class="col-lg-5">
          <section
            v-if="details.order.order_status === 'awaiting_payment'"
            class="shop-panel"
          >
            <p class="eyebrow">PAYMENT</p>
            <h2 class="h4">ชำระเงิน / แจ้งโอน</h2>
            <div class="alert alert-warning" v-if="shop.demo">
              ระบบสาธิต ไม่ต้องโอนเงินจริง ใช้หลักฐานตัวอย่างเพื่อทดสอบเท่านั้น
            </div>
            <p>
              {{ shop.bank_name }}<br />บัญชี {{ shop.bank_account
              }}<br />ชื่อบัญชี {{ shop.bank_owner }}
            </p>
            <p v-if="details.order.expires_at" class="alert alert-warning">
              กรุณาแจ้งชำระก่อน {{ details.order.expires_at }} (เวลาไทย)
              หากไม่แจ้งภายในกำหนด ระบบจะยกเลิกการจองและคืนสต็อก
            </p>
            <form @submit.prevent="pay">
              <label class="form-label" for="amount">จำนวนเงิน (บาท)</label
              ><input
                id="amount"
                v-model="form.amount"
                class="form-control mb-3"
                readonly
              /><label class="form-label" for="transferred"
                >วันเวลาโอน (เวลาไทย)</label
              ><input
                id="transferred"
                v-model="form.transferred_at"
                type="datetime-local"
                class="form-control mb-3"
                required
                :disabled="busy"
              /><label class="form-label" for="slip"
                >หลักฐาน JPG, PNG หรือ PDF ไม่เกิน 5 MB</label
              ><input
                id="slip"
                type="file"
                accept="image/jpeg,image/png,application/pdf"
                class="form-control mb-3"
                required
                :disabled="busy"
                @change="file = $event.target.files[0]"
              /><button class="btn btn-success w-100" :disabled="busy">
                {{ busy ? "กำลังส่ง…" : "ยืนยันข้อมูลการชำระเงิน" }}
              </button>
            </form>
            <button
              v-if="!confirmCancel"
              class="btn btn-link text-danger mt-3"
              :disabled="busy"
              @click="confirmCancel = true"
            >
              ยกเลิกคำสั่งซื้อ
            </button>
            <div v-else class="mt-3">
              <p>ยืนยันยกเลิกและคืนสินค้าเข้าสต็อก?</p>
              <button
                class="btn btn-danger me-2"
                :disabled="busy"
                @click="cancel"
              >
                ยืนยันยกเลิก</button
              ><button class="btn btn-light" @click="confirmCancel = false">
                กลับ
              </button>
            </div>
          </section>
          <section
            v-else-if="
              ['pending_review', ...paidStatuses].includes(
                details.order.order_status,
              )
            "
            class="shop-panel"
          >
            <span class="success-mark" aria-hidden="true">✓</span>
            <h2 class="h4 mt-3">
              {{
                paidStatuses.includes(details.order.order_status)
                  ? "ชำระเงินเรียบร้อยแล้ว"
                  : "แจ้งชำระเงินสำเร็จ"
              }}
            </h2>
            <p>
              {{
                paidStatuses.includes(details.order.order_status)
                  ? "ผู้ดูแลตรวจสอบและยืนยันรับชำระเงินแล้ว"
                  : "กำลังรอผู้ดูแลตรวจหลักฐาน เอกสารขณะนี้เป็นใบรับแจ้งชำระเงิน"
              }}
            </p>
            <button
              class="btn btn-success w-100"
              :disabled="busy"
              @click="receipt"
            >
              {{
                paidStatuses.includes(details.order.order_status)
                  ? "ดาวน์โหลดใบเสร็จ PDF"
                  : "ดาวน์โหลดใบรับแจ้งชำระเงิน PDF"
              }}
            </button>
          </section>
          <section v-else class="shop-panel">
            {{
              details.order.order_status === "expired"
                ? "คำสั่งซื้อนี้หมดเวลาชำระและคืนสต็อกแล้ว กรุณาสร้างรายการใหม่"
                : "คำสั่งซื้อนี้ถูกยกเลิกแล้ว"
            }}
          </section>
        </div>
      </div></template
    >
  </main>
</template>
