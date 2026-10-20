<script setup>
import { ref, onMounted, computed } from "vue";
import api, { money, errorMessage } from "../services/api";
import { exportDashboard } from "../services/dashboardExport";
const exportFormat = ref("csv"),
  exportNotice = ref("");
function saveReport() {
  if (!data.value || busy.value) return;
  try {
    exportDashboard(data.value, exportFormat.value);
    exportNotice.value =
      "เริ่มดาวน์โหลดรายงานแล้ว ตรวจสอบไฟล์ได้ในโฟลเดอร์ดาวน์โหลดของคุณ";
  } catch {
    error.value = "ดาวน์โหลดรายงานไม่สำเร็จ กรุณาลองใหม่";
  }
}
const data = ref(null),
  start = ref(""),
  end = ref(""),
  error = ref(""),
  busy = ref(false);
async function load() {
  busy.value = true;
  error.value = "";
  exportNotice.value = "";
  try {
    data.value = (
      await api.get("/admin/dashboard", {
        params: {
          start: start.value || undefined,
          end: end.value || undefined,
        },
      })
    ).data;
    start.value = data.value.start;
    end.value = data.value.end;
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    busy.value = false;
  }
}
const peak = computed(() =>
  Math.max(1, ...(data.value?.daily || []).map((d) => Number(d.revenue))),
);
onMounted(load);
</script>
<template>
  <main class="shop-page container">
    <p class="eyebrow">ADMIN / ANALYTICS</p>
    <h1>Dashboard ยอดขาย</h1>
    <p class="text-secondary">
      ยอดที่ผู้ดูแลยืนยันรับเงินแล้ว แบ่งวันตามเวลาไทย (UTC+7)
    </p>
    <form class="row g-3 shop-panel mb-4" @submit.prevent="load">
      <div class="col-md-5">
        <label for="start" class="form-label">ตั้งแต่วันที่</label
        ><input
          id="start"
          v-model="start"
          type="date"
          class="form-control"
          required
        />
      </div>
      <div class="col-md-5">
        <label for="end" class="form-label">ถึงวันที่</label
        ><input
          id="end"
          v-model="end"
          type="date"
          class="form-control"
          :min="start"
          required
        />
      </div>
      <div class="col-md-2 d-flex align-items-end">
        <button class="btn btn-success w-100" :disabled="busy">แสดงผล</button>
      </div>
    </form>
    <p v-if="error" class="alert alert-danger" role="alert">{{ error }}</p>
    <p v-if="busy" role="status">กำลังโหลด…</p>
    <section
      v-if="data"
      class="shop-panel export-panel my-4"
      aria-label="ส่งออกข้อมูล Dashboard"
    >
      <div>
        <h2 class="h4">ดาวน์โหลดข้อมูลรายงาน</h2>
        <p class="mb-1">
          ข้อมูลที่แสดงช่วง {{ data.start }} ถึง {{ data.end }} รวมยอดขายรายวัน
          สรุปยอด สินค้าขายดี และสต็อกปัจจุบัน
        </p>
        <p class="text-secondary mb-0">
          เมื่อเปลี่ยนช่วงวันที่ ให้กด “แสดงผล” ก่อนดาวน์โหลด • CSV เปิดด้วย
          Excel ได้ • JSON สำหรับนำข้อมูลไปใช้ต่อ
        </p>
      </div>
      <div class="export-actions">
        <label for="export-format" class="form-label">รูปแบบไฟล์</label>
        <select
          id="export-format"
          v-model="exportFormat"
          class="form-select"
          :disabled="busy"
        >
          <option value="csv">CSV (เปิดใน Excel)</option>
          <option value="json">JSON (ข้อมูลทั้งหมด)</option>
        </select>
        <button
          type="button"
          class="btn btn-success"
          :disabled="busy"
          @click="saveReport"
        >
          ดาวน์โหลดข้อมูล
        </button>
      </div>
      <p v-if="exportNotice" class="alert alert-success mb-0" role="status">
        {{ exportNotice }}
      </p>
    </section>
    <template v-if="data"
      ><div class="row g-4 mb-4">
        <div class="col-md-4">
          <section class="shop-panel">
            <p>ยอดขายรวม</p>
            <strong class="h2 text-success">{{
              money(data.summary.revenue)
            }}</strong>
          </section>
        </div>
        <div class="col-md-4">
          <section class="shop-panel">
            <p>คำสั่งซื้อที่ชำระแล้ว</p>
            <strong class="h2">{{ data.summary.paid_orders }}</strong>
          </section>
        </div>
        <div class="col-md-4">
          <section class="shop-panel">
            <p>หลักฐานรอตรวจทั้งหมด</p>
            <strong class="h2">{{ data.summary.pending_payments }}</strong>
          </section>
        </div>
      </div>
      <section class="shop-panel mb-4">
        <h2 class="h4">ยอดขายต่อวัน</h2>
        <p v-if="!data.daily.length" class="text-secondary py-4">
          ไม่มีรายการรับชำระในช่วงวันที่นี้
        </p>
        <div v-for="d in data.daily" :key="d.day" class="sales-bar-row">
          <span>{{ d.day }}</span>
          <div class="sales-track">
            <div
              class="sales-bar"
              :style="{
                width: Math.max(1, (Number(d.revenue) / peak) * 100) + '%',
              }"
            ></div>
          </div>
          <strong>{{ money(d.revenue) }}</strong>
        </div>
        <div class="table-responsive mt-4" v-if="data.daily.length">
          <table class="table">
            <thead>
              <tr>
                <th>วันที่</th>
                <th>คำสั่งซื้อ</th>
                <th>ยอดขาย</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="d in data.daily" :key="d.day">
                <td>{{ d.day }}</td>
                <td>{{ d.orders }}</td>
                <td>{{ money(d.revenue) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <div class="row g-4">
        <div class="col-md-7">
          <section class="shop-panel">
            <h2 class="h4">สินค้าขายดี 5 อันดับ</h2>
            <p v-if="!data.top.length">ยังไม่มีข้อมูล</p>
            <div v-for="p in data.top" :key="p.name" class="cart-row">
              <span
                >{{ p.name }}<br /><small>{{ p.quantity }} ชิ้น</small></span
              ><strong>{{ money(p.revenue) }}</strong>
            </div>
          </section>
        </div>
        <div class="col-md-5">
          <section class="shop-panel">
            <h2 class="h4">สินค้าใกล้หมด (≤ 5 ชิ้น)</h2>
            <p v-if="!data.low_stock.length">สต็อกสินค้ายังเพียงพอ</p>
            <p v-for="p in data.low_stock" :key="p.product_name">
              {{ p.product_name }} — {{ p.stock_qty }} ชิ้น
            </p>
          </section>
        </div>
      </div></template
    >
  </main>
</template>
