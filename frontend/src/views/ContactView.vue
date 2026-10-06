<template>
  <div>
    <Navbar />

    <section class="contact-hero">
      <div class="container">
        <div class="text-center">
          <span class="contact-badge">
            CONTACT
          </span>

          <h1 class="contact-title mt-3">
            ติดต่อเรา
          </h1>

          <p class="contact-subtitle">
            ข้อมูลการติดต่อร้านค้าและสมาชิกในกลุ่ม
          </p>
        </div>
      </div>
    </section>

    <section class="contact-section">
      <div class="container">

        <div class="row g-4 justify-content-center">

          <!-- ข้อมูลร้าน -->
          <div class="col-lg-6">
            <div class="contact-card h-100">

              <div class="card-icon">
                🌿
              </div>

              <h3 class="card-title">
                Probiotic Shop
              </h3>

              <p class="card-description">
                ร้านค้าสมมติสำหรับโครงงานรายวิชา
                ระบบจำหน่ายผลิตภัณฑ์โปรไบโอติกออนไลน์
              </p>

              <div class="info-list">

                <div class="info-item">
                  <div class="info-icon">📍</div>

                  <div>
                    <span class="info-label">
                      ที่อยู่
                    </span>

                    <p>
                      ร้านค้าสมมติสำหรับโครงงานรายวิชา
                    </p>
                  </div>
                </div>

                <div class="info-item">
                  <div class="info-icon">✉️</div>

                  <div>
                    <span class="info-label">
                      อีเมล
                    </span>

                    <p>
                      probioticshop@example.com
                    </p>
                  </div>
                </div>

                <div class="info-item">
                  <div class="info-icon">📞</div>

                  <div>
                    <span class="info-label">
                      โทรศัพท์
                    </span>

                    <p>
                      08X-XXX-XXXX
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>

          <!-- สมาชิกในกลุ่ม -->
          <div class="col-lg-6">
            <div class="contact-card h-100">

              <div class="card-icon">
                👥
              </div>

              <h3 class="card-title">
                สมาชิกในกลุ่ม
              </h3>

              <p class="card-description">
                รายชื่อผู้จัดทำระบบ Probiotic Shop
              </p>

              <div class="member-list">

                <div class="member-card">
                  <div class="member-number">
                    1
                  </div>

                  <div>
                    <h5>
                      กฤตพร ธัญญเจริญ
                    </h5>

                    <p>
                      รหัสนักศึกษา 1167109060083
                    </p>
                  </div>
                </div>

                <div class="member-card">
                  <div class="member-number">
                    2
                  </div>

                  <div>
                    <h5>
                      ธีทัต แจ่มแจ้ง
                    </h5>

                    <p>
                      รหัสนักศึกษา 1167109060513
                    </p>
                  </div>
                </div>

                <div class="member-card">
                  <div class="member-number">
                    3
                  </div>

                  <div>
                    <h5>
                      อนันตสิน เสาร์แก้ว
                    </h5>

                    <p>
                      รหัสนักศึกษา 1167109060547
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>

        <!-- กล่องด้านล่าง -->
        <div class="contact-bottom mt-5 text-center">
          <h3>
            ต้องการสอบถามข้อมูลเพิ่มเติม?
          </h3>

          <p>
            สามารถติดต่อเราได้ผ่านอีเมลหรือหมายเลขโทรศัพท์ด้านบน
          </p>

          <RouterLink
            to="/"
            class="btn back-home-btn"
          >
            กลับหน้าแรก
          </RouterLink>
        </div>

      </div>
    </section>

    <footer class="contact-footer">
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
.contact-hero {
  background:
    linear-gradient(
      135deg,
      #f2faf5 0%,
      #ffffff 50%,
      #e8f5ed 100%
    );

  padding: 70px 0 55px;
}

.contact-badge {
  display: inline-block;
  padding: 8px 18px;
  background: #e2f2e7;
  color: #3f7c58;
  border-radius: 30px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 2px;
}

.contact-title {
  font-size: 46px;
  font-weight: 800;
  color: #202a24;
}

.contact-subtitle {
  color: #748078;
  font-size: 17px;
  margin-top: 10px;
}

.contact-section {
  padding: 70px 0 90px;
  background: #ffffff;
}

.contact-card {
  padding: 38px;
  border-radius: 24px;
  border: 1px solid #e5ece7;
  background: #ffffff;

  box-shadow:
    0 16px 45px rgba(61, 93, 70, 0.08);

  transition: all 0.25s ease;
}

.contact-card:hover {
  transform: translateY(-5px);

  box-shadow:
    0 22px 55px rgba(61, 93, 70, 0.13);
}

.card-icon {
  width: 66px;
  height: 66px;
  border-radius: 18px;
  background: #edf8f1;

  display: flex;
  justify-content: center;
  align-items: center;

  font-size: 30px;
  margin-bottom: 22px;
}

.card-title {
  font-weight: 800;
  color: #26352b;
  margin-bottom: 10px;
}

.card-description {
  color: #748078;
  line-height: 1.7;
  margin-bottom: 28px;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.info-item {
  display: flex;
  gap: 16px;
  align-items: flex-start;

  padding: 18px;
  border-radius: 16px;
  background: #f8fbf9;
}

.info-icon {
  width: 42px;
  height: 42px;

  display: flex;
  justify-content: center;
  align-items: center;

  background: #e6f4eb;
  border-radius: 12px;

  flex-shrink: 0;
}

.info-label {
  display: block;
  font-size: 13px;
  color: #4c956c;
  font-weight: 700;
  margin-bottom: 4px;
}

.info-item p {
  margin: 0;
  color: #35443a;
}

.member-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.member-card {
  display: flex;
  align-items: center;
  gap: 16px;

  padding: 17px 18px;

  border-radius: 16px;
  background: #f8fbf9;

  border: 1px solid #edf2ee;
}

.member-number {
  width: 46px;
  height: 46px;
  border-radius: 50%;

  background: #4c956c;
  color: white;

  display: flex;
  align-items: center;
  justify-content: center;

  font-weight: 700;
  flex-shrink: 0;
}

.member-card h5 {
  margin: 0 0 5px;
  font-weight: 700;
  color: #26352b;
}

.member-card p {
  margin: 0;
  color: #768179;
  font-size: 14px;
}

.contact-bottom {
  padding: 45px 20px;

  background:
    linear-gradient(
      135deg,
      #edf8f1,
      #f7fbf8
    );

  border-radius: 24px;
}

.contact-bottom h3 {
  font-weight: 800;
  color: #26352b;
}

.contact-bottom p {
  color: #738078;
  margin: 12px 0 24px;
}

.back-home-btn {
  background: #4c956c;
  color: white;
  border-radius: 10px;
  padding: 11px 26px;
  font-weight: 600;
}

.back-home-btn:hover {
  background: #397452;
  color: white;
}

.contact-footer {
  background: #202a24;
  color: #dce7df;
  padding: 35px 0;
}
</style>