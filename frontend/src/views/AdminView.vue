<template>
  <div>
    <Navbar />
    <div class="admin-section py-4">
      <div class="container">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 class="fw-bold text-dark-green mb-1">⚙️ ระบบจัดการหลังบ้าน (Admin)</h2>
            <p class="text-muted small mb-0">จัดการรายการสินค้า Probiotics ทั้งหมดในระบบ</p>
          </div>
          <button class="btn btn-shop px-4">+ เพิ่มสินค้าใหม่</button>
        </div>

        <!-- ตารางสินค้า -->
        <div class="table-card p-4">
          <div class="table-responsive">
            <table class="table table-hover align-middle">
              <thead class="table-light">
                <tr>
                  <th>ID</th>
                  <th>ชื่อสินค้า</th>
                  <th>ประเภท</th>
                  <th>ราคา</th>
                  <th>สถานะ</th>
                  <th class="text-end">การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>#01</td>
                  <td class="fw-bold">Probiotics Daily Balance</td>
                  <td><span class="badge bg-soft-green">แคปซูล</span></td>
                  <td>฿890</td>
                  <td><span class="badge bg-success">พร้อมจำหน่าย</span></td>
                  <td class="text-end">
                    <button class="btn btn-outline-primary btn-sm me-2">แก้ไข</button>
                    <button class="btn btn-outline-danger btn-sm">ลบ</button>
                  </td>
                </tr>
                <tr>
                  <td>#02</td>
                  <td class="fw-bold">Probiotics Powder Drink</td>
                  <td><span class="badge bg-soft-green">แบบผง</span></td>
                  <td>฿650</td>
                  <td><span class="badge bg-success">พร้อมจำหน่าย</span></td>
                  <td class="text-end">
                    <button class="btn btn-outline-primary btn-sm me-2">แก้ไข</button>
                    <button class="btn btn-outline-danger btn-sm">ลบ</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Navbar from '../components/Navbar.vue';
</script>

<style scoped>
.admin-section {
  min-height: calc(100vh - 80px);
  background: #f7faf8;
}
.text-dark-green { color: #202a24; }
.table-card {
  background: white;
  border-radius: 20px;
  border: 1px solid #e6ece8;
  box-shadow: 0 10px 30px rgba(0,0,0,0.03);
}
.btn-shop {
  background: #4c956c;
  color: white;
  border-radius: 10px;
  font-weight: 600;
  border: none;
}
.btn-shop:hover { background: #397452; }
.bg-soft-green {
  background: #e4f3e9;
  color: #397452;
}
</style>