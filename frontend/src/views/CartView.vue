<template>
  <div>
    <div class="cart-section">
      <div class="container py-4">
        <h2 class="fw-bold text-dark-green mb-4">🛒 ตะกร้าสินค้าของคุณ</h2>

        <div class="row g-4" v-if="cartItems.length > 0">
          <!-- รายการสินค้า -->
          <div class="col-lg-8">
            <div class="cart-card p-4 mb-3" v-for="item in cartItems" :key="item.id">
              <div class="d-flex align-items-center justify-content-between">
                <div class="d-flex align-items-center">
                  <div class="product-icon-box me-3">🌿</div>
                  <div>
                    <h5 class="fw-bold mb-1">{{ item.name }}</h5>
                    <p class="text-green fw-bold mb-0">฿{{ item.price }}</p>
                  </div>
                </div>
                <div class="d-flex align-items-center gap-3">
                  <span class="badge bg-light text-dark fs-6 px-3 py-2 border">จำนวน: {{ item.qty }}</span>
                  <button class="btn btn-outline-danger btn-sm rounded-circle" @click="removeItem(item.id)">✕</button>
                </div>
              </div>
            </div>
          </div>

          <!-- สรุปยอดเงิน -->
          <div class="col-lg-4">
            <div class="summary-card p-4">
              <h4 class="fw-bold mb-3">สรุปคำสั่งซื้อ</h4>
              <div class="d-flex justify-content-between mb-2">
                <span class="text-muted">ราคารวม</span>
                <span class="fw-bold">฿{{ totalPrice }}</span>
              </div>
              <div class="d-flex justify-content-between mb-3">
                <span class="text-muted">ค่าจัดส่ง</span>
                <span class="text-success fw-bold">ฟรี</span>
              </div>
              <hr />
              <div class="d-flex justify-content-between mb-4 fs-5 fw-bold">
                <span>ยอดชำระสุทธิ</span>
                <span class="text-green">฿{{ totalPrice }}</span>
              </div>
              <button class="btn btn-shop w-100 py-3 fw-bold" @click="checkout">
                ดำเนินการชำระเงิน
              </button>
            </div>
          </div>
        </div>

        <!-- ถ้าตะกร้าว่าง -->
        <div class="text-center py-5" v-else>
          <div class="empty-icon mb-3">🛍️</div>
          <h4>ยังไม่มีสินค้าในตะกร้า</h4>
          <RouterLink to="/products" class="btn btn-shop mt-3 px-4">เลือกซื้อสินค้าเลย</RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
// import Navbar from '../components/Navbar.vue';

// ตัวอย่าง Mock Data สำหรับเปิดโชว์ UI สวยๆ
const cartItems = ref([
  { id: 1, name: 'Probiotics Daily Balance (30 แคปซูล)', price: 890, qty: 1 },
  { id: 2, name: 'Probiotics Powder Drink (15 ซอง)', price: 650, qty: 2 }
]);

const totalPrice = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + (item.price * item.qty), 0);
});

const removeItem = (id) => {
  cartItems.value = cartItems.value.filter(item => item.id !== id);
};

const checkout = () => {
  alert('กดยืนยันสั่งซื้อสินค้าเรียบร้อยแล้ว!');
};
</script>

<style scoped>
.cart-section {
  min-height: calc(100vh - 80px);
  background: #f7faf8;
  padding: 40px 0;
}
.text-dark-green { color: #202a24; }
.text-green { color: #4c956c; }
.cart-card, .summary-card {
  background: white;
  border-radius: 20px;
  border: 1px solid #e6ece8;
  box-shadow: 0 10px 30px rgba(0,0,0,0.03);
}
.product-icon-box {
  width: 50px;
  height: 50px;
  background: #edf8f1;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}
.btn-shop {
  background: #4c956c;
  color: white;
  border-radius: 12px;
  font-weight: 600;
  border: none;
}
.btn-shop:hover { background: #397452; }
.empty-icon { font-size: 60px; }
</style>