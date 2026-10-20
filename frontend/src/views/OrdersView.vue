<script setup>
import { ref, onMounted } from "vue";
import api, { money, statusName, errorMessage } from "../services/api";
import PaginationControls from "../components/PaginationControls.vue";
const orders = ref([]),
  error = ref(""),
  loading = ref(true),
  page = ref(1),
  total = ref(0);
async function load() {
  loading.value = true;
  error.value = "";
  try {
    const { data } = await api.get("/orders", { params: { page: page.value } });
    orders.value = data.data;
    total.value = data.total;
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    loading.value = false;
  }
}
function goPage(next) {
  page.value = next;
  load();
}
onMounted(load);
</script>
<template>
  <main class="shop-page container">
    <p class="eyebrow">ORDER HISTORY</p>
    <h1>คำสั่งซื้อของฉัน</h1>
    <p v-if="loading">กำลังโหลด…</p>
    <p v-if="error" class="alert alert-danger" role="alert">{{ error }}</p>
    <div v-if="!loading && !error && !orders.length" class="shop-panel">
      ยังไม่มีคำสั่งซื้อ <RouterLink to="/products">เลือกซื้อสินค้า</RouterLink>
    </div>
    <div
      v-for="o in orders"
      :key="o.order_id"
      class="shop-panel mb-3 d-flex flex-wrap justify-content-between align-items-center gap-3"
    >
      <div>
        <strong>{{ o.order_no }}</strong>
        <p class="small text-secondary mb-0">
          {{ o.created_at }} · {{ statusName(o.order_status) }}
        </p>
      </div>
      <strong>{{ money(o.total_amount) }}</strong
      ><RouterLink class="btn btn-outline-success" :to="'/orders/' + o.order_id"
        >รายละเอียด / ชำระเงิน</RouterLink
      >
    </div>
    <PaginationControls
      :page="page"
      :total="total"
      :busy="loading"
      @change="goPage"
    />
  </main>
</template>
