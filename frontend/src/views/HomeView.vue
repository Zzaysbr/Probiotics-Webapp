<template>
  <div>
    <Navbar />

    <!-- HERO -->
    <section class="hero-section">
      <div class="container">
        <div class="row align-items-center min-vh-75">

          <div class="col-lg-6">
            <span class="hero-badge">
              🌿 ดูแลสุขภาพจากภายใน
            </span>

            <h1 class="hero-title mt-4">
              เติมสมดุลให้ทุกวัน
              <span>ด้วยโปรไบโอติก</span>
            </h1>

            <p class="hero-text mt-4">
              เลือกผลิตภัณฑ์โปรไบโอติกที่เหมาะกับคุณ
              พร้อมข้อมูลสินค้า หมวดหมู่ และแบรนด์
              ที่เลือกดูได้อย่างสะดวก
            </p>

            <div class="mt-4">
              <RouterLink
                to="/products"
                class="btn btn-shop me-3"
              >
                เลือกซื้อสินค้า
              </RouterLink>

              <RouterLink
                to="/contact"
                class="btn btn-outline-shop"
              >
                ติดต่อเรา
              </RouterLink>
            </div>

            <div class="hero-features mt-5">
              <div>
                <strong>✓</strong>
                สินค้าหลากหลาย
              </div>

              <div>
                <strong>✓</strong>
                ค้นหาง่าย
              </div>

              <div>
                <strong>✓</strong>
                สั่งซื้อสะดวก
              </div>
            </div>
          </div>

          <div class="col-lg-6 mt-5 mt-lg-0">
            <div class="hero-card">
              <div class="hero-circle circle-one"></div>
              <div class="hero-circle circle-two"></div>

              <div class="product-visual">
                <div class="bottle">
                  <div class="bottle-cap"></div>

                  <div class="bottle-body">
                    <div class="product-label">
                      <div class="leaf">🌿</div>

                      <strong>PROBIOTIC</strong>

                      <span>Daily Balance</span>

                      <small>
                        Healthy Gut • Daily Care
                      </small>
                    </div>
                  </div>
                </div>

                <div class="capsule capsule-1">
                  <span></span>
                </div>

                <div class="capsule capsule-2">
                  <span></span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- WHY US -->
    <section class="features-section">
      <div class="container">

        <div class="text-center mb-5">
          <p class="section-label">WHY PROBIOTIC SHOP</p>

          <h2 class="section-title">
            ดูแลสุขภาพให้เป็นเรื่องง่าย
          </h2>

          <p class="section-description">
            ระบบร้านค้าออนไลน์ที่ช่วยให้คุณค้นหา
            และเลือกผลิตภัณฑ์ได้อย่างสะดวก
          </p>
        </div>

        <div class="row g-4">

          <div class="col-md-4">
            <div class="feature-card">
              <div class="feature-icon">
                🔎
              </div>

              <h4>ค้นหาสินค้าง่าย</h4>

              <p>
                ค้นหาผลิตภัณฑ์ตามชื่อ
                หมวดหมู่ หรือแบรนด์
                ได้อย่างสะดวก
              </p>
            </div>
          </div>

          <div class="col-md-4">
            <div class="feature-card">
              <div class="feature-icon">
                🌱
              </div>

              <h4>หลากหลายรูปแบบ</h4>

              <p>
                มีผลิตภัณฑ์ทั้งแบบแคปซูล
                แบบผงหรือซอง
                และแบบเม็ดเคี้ยว
              </p>
            </div>
          </div>

          <div class="col-md-4">
            <div class="feature-card">
              <div class="feature-icon">
                🛒
              </div>

              <h4>สั่งซื้อสะดวก</h4>

              <p>
                สมัครสมาชิก
                เลือกสินค้า
                และตรวจสอบรายการสั่งซื้อได้ง่าย
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- CATEGORY -->
    <section class="category-section">
      <div class="container">

        <div class="row align-items-end mb-4">
          <div class="col">
            <p class="section-label">
              PRODUCT CATEGORY
            </p>

            <h2 class="section-title">
              เลือกตามประเภทที่คุณชอบ
            </h2>
          </div>
        </div>

        <div class="row g-4">

          <div class="col-md-4">
            <div class="category-card">
              <div class="category-icon">
                💊
              </div>

              <h4>แบบแคปซูล</h4>

              <p>
                รับประทานง่าย
                เหมาะสำหรับการดูแลสุขภาพประจำวัน
              </p>
            </div>
          </div>

          <div class="col-md-4">
            <div class="category-card">
              <div class="category-icon">
                🥛
              </div>

              <h4>แบบผงหรือซอง</h4>

              <p>
                สะดวกต่อการชงดื่ม
                พกพาและรับประทานได้ง่าย
              </p>
            </div>
          </div>

          <div class="col-md-4">
            <div class="category-card">
              <div class="category-icon">
                🍬
              </div>

              <h4>แบบเม็ดเคี้ยว</h4>

              <p>
                รูปแบบรับประทานง่าย
                เหมาะสำหรับผู้ที่ไม่ชอบกลืนแคปซูล
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta-section">
      <div class="container">
        <div class="cta-box text-center">

          <h2>
            พร้อมเลือกโปรไบโอติก
            ที่เหมาะกับคุณหรือยัง?
          </h2>

          <p>
            สมัครสมาชิกเพื่อเริ่มดูสินค้า
            และเลือกซื้อผลิตภัณฑ์
          </p>

          <RouterLink
            to="/login"
            class="btn btn-light btn-lg"
          >
            เริ่มต้นใช้งาน
          </RouterLink>

        </div>
      </div>
    </section>

    <footer class="footer">
      <div class="container text-center">
        <strong>PROBIOTIC SHOP</strong>

        <p class="mb-0 mt-2">
          เว็บไซต์จำหน่ายผลิตภัณฑ์โปรไบโอติกออนไลน์
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import Navbar from "../components/Navbar.vue";
</script>

<style scoped>
.hero-section {
  background:
    linear-gradient(
      135deg,
      #f4fbf7 0%,
      #ffffff 55%,
      #edf8f1 100%
    );

  padding: 40px 0 70px;
}

.min-vh-75 {
  min-height: 72vh;
}

.hero-badge {
  display: inline-block;
  background: #e4f3e9;
  color: #397452;
  padding: 9px 18px;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 600;
}

.hero-title {
  font-size: clamp(42px, 5vw, 72px);
  font-weight: 800;
  line-height: 1.1;
  color: #202a24;
}

.hero-title span {
  display: block;
  color: #4c956c;
}

.hero-text {
  font-size: 18px;
  line-height: 1.8;
  color: #66736a;
  max-width: 570px;
}

.btn-shop {
  background: #4c956c;
  color: white;
  border-radius: 10px;
  padding: 12px 28px;
  font-weight: 600;
}

.btn-shop:hover {
  background: #397452;
  color: white;
}

.btn-outline-shop {
  border: 1px solid #4c956c;
  color: #397452;
  border-radius: 10px;
  padding: 12px 28px;
  font-weight: 600;
}

.btn-outline-shop:hover {
  background: #4c956c;
  color: white;
}

.hero-features {
  display: flex;
  flex-wrap: wrap;
  gap: 25px;
  color: #56645b;
}

.hero-features strong {
  color: #4c956c;
  margin-right: 5px;
}

.hero-card {
  height: 470px;
  border-radius: 35px;
  background:
    linear-gradient(
      145deg,
      #dff2e5,
      #c9ead5
    );

  position: relative;
  overflow: hidden;
  box-shadow:
    0 25px 60px rgba(63, 115, 82, 0.18);
}

.hero-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.35);
}

.circle-one {
  width: 260px;
  height: 260px;
  right: -70px;
  top: -60px;
}

.circle-two {
  width: 180px;
  height: 180px;
  left: -40px;
  bottom: -50px;
}

.product-visual {
  position: relative;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.bottle {
  position: relative;
  z-index: 3;
}

.bottle-cap {
  width: 110px;
  height: 55px;
  margin: auto;
  background: #ffffff;
  border-radius: 14px 14px 8px 8px;
  box-shadow:
    0 5px 10px rgba(0, 0, 0, 0.08);
}

.bottle-body {
  width: 230px;
  height: 280px;
  border-radius: 40px;
  background: #ffffff;
  box-shadow:
    0 20px 45px rgba(0, 0, 0, 0.15);

  display: flex;
  justify-content: center;
  align-items: center;
}

.product-label {
  width: 185px;
  height: 175px;
  border-radius: 20px;
  background:
    linear-gradient(
      145deg,
      #eff9f2,
      #d8efdf
    );

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #397452;
}

.product-label .leaf {
  font-size: 36px;
  margin-bottom: 8px;
}

.product-label strong {
  font-size: 23px;
  letter-spacing: 1px;
}

.product-label span {
  font-size: 16px;
  margin-top: 5px;
}

.product-label small {
  margin-top: 10px;
  color: #758278;
}

.capsule {
  position: absolute;
  width: 80px;
  height: 34px;
  border-radius: 30px;
  background: white;
  overflow: hidden;
  box-shadow:
    0 12px 25px rgba(0, 0, 0, 0.12);
}

.capsule span {
  display: block;
  width: 50%;
  height: 100%;
  background: #6aaa80;
}

.capsule-1 {
  right: 55px;
  bottom: 80px;
  transform: rotate(-25deg);
}

.capsule-2 {
  left: 65px;
  top: 90px;
  transform: rotate(25deg);
}

.features-section {
  padding: 90px 0;
}

.section-label {
  color: #4c956c;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 2px;
  margin-bottom: 8px;
}

.section-title {
  font-weight: 800;
  color: #202a24;
}

.section-description {
  color: #7a847e;
}

.feature-card,
.category-card {
  height: 100%;
  padding: 35px;
  border-radius: 22px;
  background: white;
  border: 1px solid #e6ece8;
  transition: all 0.25s ease;
}

.feature-card:hover,
.category-card:hover {
  transform: translateY(-7px);
  box-shadow:
    0 18px 45px rgba(59, 94, 70, 0.12);
}

.feature-icon,
.category-icon {
  width: 65px;
  height: 65px;
  background: #edf8f1;
  border-radius: 18px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 30px;
  margin-bottom: 22px;
}

.feature-card h4,
.category-card h4 {
  font-weight: 700;
  margin-bottom: 12px;
}

.feature-card p,
.category-card p {
  color: #738078;
  line-height: 1.7;
}

.category-section {
  background: #f7faf8;
  padding: 90px 0;
}

.cta-section {
  padding: 90px 0;
}

.cta-box {
  background:
    linear-gradient(
      135deg,
      #397452,
      #5ca579
    );

  color: white;
  border-radius: 28px;
  padding: 60px 20px;
}

.cta-box h2 {
  font-weight: 800;
}

.cta-box p {
  opacity: 0.9;
  margin: 15px 0 25px;
}

.footer {
  padding: 35px 0;
  background: #202a24;
  color: #dbe6de;
}
</style>