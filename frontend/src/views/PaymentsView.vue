<script setup>
import { ref, onMounted } from "vue";
import PaginationControls from "../components/PaginationControls.vue";
const paymentPage = ref(1),
  orderPage = ref(1),
  paymentTotal = ref(0),
  orderTotal = ref(0);
function paymentNext(next) {
  paymentPage.value = next;
  load();
}
function orderNext(next) {
  orderPage.value = next;
  load();
}
import api, {
  money,
  statusName,
  errorMessage,
  download,
} from "../services/api";
const payments = ref([]),
  orders = ref([]),
  error = ref(""),
  notice = ref(""),
  busy = ref(false),
  reasons = ref({});
async function load() {
  busy.value = true;
  try {
    const p = await api.get("/admin/payments", {
      params: { page: paymentPage.value },
    });
    payments.value = p.data.data;
    paymentTotal.value = p.data.total;
    const o = await api.get("/admin/orders", {
      params: { page: orderPage.value },
    });
    orders.value = o.data.data;
    orderTotal.value = o.data.total;
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    busy.value = false;
  }
}
async function review(p, status) {
  busy.value = true;
  error.value = "";
  try {
    const { data } = await api.post(
      "/admin/payments/" + p.payment_id + "/review",
      { status, reason: reasons.value[p.payment_id] },
    );
    notice.value = data.message;
    await load();
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    busy.value = false;
  }
}
async function slip(p) {
  try {
    await download(
      "/payments/" + p.payment_id + "/slip",
      "slip-" + p.payment_id + "." + p.slip_path.split(".").pop(),
    );
  } catch (e) {
    error.value = "ดาวน์โหลดหลักฐานไม่สำเร็จ";
  }
}
onMounted(load);
</script>
<template>
  <main class="shop-page container">
    <div class="page-heading">
      <div>
        <p class="eyebrow">ADMIN / PAYMENTS</p>
        <h1>คำสั่งซื้อและการชำระเงิน</h1>
      </div>
      <button class="btn btn-outline-success" :disabled="busy" @click="load">
        อัปเดตข้อมูล
      </button>
    </div>
    <div v-if="error" class="alert alert-danger" role="alert">{{ error }}</div>
    <div v-if="notice" class="alert alert-success" role="status">
      {{ notice }}
    </div>
    <p v-if="busy" role="status">กำลังดำเนินการ…</p>
    <h2 class="h4">ตรวจหลักฐานการชำระเงิน</h2>
    <p v-if="!payments.length && !busy" class="shop-panel">
      ยังไม่มีรายการแจ้งชำระเงิน
    </p>
    <article v-for="p in payments" :key="p.payment_id" class="shop-panel mb-3">
      <div class="d-flex flex-wrap justify-content-between gap-3">
        <div>
          <strong>{{ p.order_no }}</strong>
          <p class="mb-1">
            ผู้รับ {{ p.recipient_name }} · {{ money(p.amount) }}
          </p>
          <p class="small text-secondary">
            เวลาโอน {{ p.transferred_at }} · {{ statusName(p.status) }}
          </p>
        </div>
        <div class="d-flex gap-2 align-items-start">
          <RouterLink
            :to="'/orders/' + p.order_id"
            class="btn btn-outline-success"
            >ดูคำสั่งซื้อ</RouterLink
          ><button class="btn btn-outline-secondary" @click="slip(p)">
            ดาวน์โหลดหลักฐาน
          </button>
        </div>
      </div>
      <div v-if="p.status === 'pending'" class="border-top pt-3">
        <p class="small">ตรวจยอด วันเวลา และหลักฐานก่อนยืนยัน</p>
        <label :for="'reason-' + p.payment_id" class="form-label"
          >เหตุผล (จำเป็นเมื่อไม่อนุมัติ)</label
        ><input
          :id="'reason-' + p.payment_id"
          v-model="reasons[p.payment_id]"
          maxlength="1000"
          class="form-control mb-3"
        /><button
          class="btn btn-success me-2"
          :disabled="busy"
          @click="review(p, 'approved')"
        >
          ยืนยันรับชำระ</button
        ><button
          class="btn btn-outline-danger"
          :disabled="busy || !reasons[p.payment_id]?.trim()"
          @click="review(p, 'rejected')"
        >
          ไม่อนุมัติ / แจ้งใหม่
        </button>
      </div>
      <p v-if="p.rejection_reason" class="text-danger">
        {{ p.rejection_reason }}
      </p>
    </article>
    <PaginationControls
      label="หน้ารายการชำระเงิน"
      :page="paymentPage"
      :total="paymentTotal"
      :busy="busy"
      @change="paymentNext"
    />
    <h2 class="h4 mt-5">คำสั่งซื้อทั้งหมด</h2>
    <div class="shop-panel table-responsive">
      <table class="table align-middle">
        <thead>
          <tr>
            <th>คำสั่งซื้อ</th>
            <th>สมาชิก</th>
            <th>ยอดรวม</th>
            <th>สถานะ</th>
            <th>รายละเอียด</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="o in orders" :key="o.order_id">
            <td>
              {{ o.order_no }}<br /><small>{{ o.created_at }}</small>
            </td>
            <td>{{ o.username }}</td>
            <td>{{ money(o.total_amount) }}</td>
            <td>{{ statusName(o.order_status) }}</td>
            <td>
              <RouterLink :to="'/orders/' + o.order_id">เปิดรายการ</RouterLink>
            </td>
          </tr>
          <tr v-if="!orders.length">
            <td colspan="5">ยังไม่มีคำสั่งซื้อ</td>
          </tr>
        </tbody>
      </table>
    </div>
    <PaginationControls
      label="หน้าคำสั่งซื้อทั้งหมด"
      :page="orderPage"
      :total="orderTotal"
      :busy="busy"
      @change="orderNext"
    />
  </main>
</template>
