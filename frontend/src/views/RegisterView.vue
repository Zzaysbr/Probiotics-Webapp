<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const form = ref({
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  full_name: "",
  phone: ""
});

const message = ref("");
const error = ref("");

const register = async () => {
  message.value = "";
  error.value = "";

  if (form.value.password !== form.value.confirmPassword) {
    error.value = "รหัสผ่านไม่ตรงกัน";
    return;
  }

  try {
    const response = await fetch(
      "http://localhost:3000/api/auth/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: form.value.username,
          email: form.value.email,
          password: form.value.password,
          full_name: form.value.full_name,
          phone: form.value.phone
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      error.value = data.message;
      return;
    }

    message.value = "สมัครสมาชิกสำเร็จ";

    setTimeout(() => {
      router.push("/login");
    }, 1000);
  } catch (err) {
    console.error(err);
    error.value = "ไม่สามารถเชื่อมต่อ Server ได้";
  }
};
</script>

<template>
  <div>
    <Navbar />

    <section class="register-section">
      <div class="container">
        <div class="register-wrapper">

          <div class="register-info">
            <span class="page-badge">
              JOIN US
            </span>

            <h1>
              เริ่มต้นดูแลสุขภาพ
              <span>กับ Probiotic Shop</span>
            </h1>

            <p>
              สมัครสมาชิกเพื่อเลือกดูสินค้า
              สั่งซื้อผลิตภัณฑ์ และติดตามคำสั่งซื้อของคุณ
            </p>

            <div class="benefits">
              <div class="benefit-item">
                <span>✓</span>
                เลือกซื้อสินค้าได้สะดวก
              </div>

              <div class="benefit-item">
                <span>✓</span>
                ดูประวัติคำสั่งซื้อได้
              </div>

              <div class="benefit-item">
                <span>✓</span>
                แจ้งชำระเงินและดูใบเสร็จได้
              </div>
            </div>
          </div>

          <div class="register-card">
            <div class="text-center mb-4">
              <div class="register-icon">
                🌿
              </div>

              <h2>
                สมัครสมาชิก
              </h2>

              <p>
                กรอกข้อมูลเพื่อสร้างบัญชีใหม่
              </p>
            </div>

            <form @submit.prevent="register">

              <div class="form-group">
                <label>
                  Username
                </label>

                <input
                  v-model="form.username"
                  type="text"
                  placeholder="กรอก Username"
                  required
                />
              </div>

              <div class="form-group">
                <label>
                  Email
                </label>

                <input
                  v-model="form.email"
                  type="email"
                  placeholder="กรอก Email"
                  required
                />
              </div>

              <div class="form-group">
                <label>
                  ชื่อ - นามสกุล
                </label>

                <input
                  v-model="form.full_name"
                  type="text"
                  placeholder="กรอกชื่อ - นามสกุล"
                  required
                />
              </div>

              <div class="form-group">
                <label>
                  เบอร์โทรศัพท์
                </label>

                <input
                  v-model="form.phone"
                  type="tel"
                  placeholder="กรอกเบอร์โทรศัพท์"
                />
              </div>

              <div class="form-group">
                <label>
                  Password
                </label>

                <input
                  v-model="form.password"
                  type="password"
                  placeholder="กรอกรหัสผ่าน"
                  required
                />
              </div>

              <div class="form-group">
                <label>
                  ยืนยัน Password
                </label>

                <input
                  v-model="form.confirmPassword"
                  type="password"
                  placeholder="กรอกรหัสผ่านอีกครั้ง"
                  required
                />
              </div>

              <button
                class="register-btn"
                type="submit"
              >
                สมัครสมาชิก
              </button>

            </form>

            <div
              v-if="message"
              class="alert-message success"
            >
              {{ message }}
            </div>

            <div
              v-if="error"
              class="alert-message error"
            >
              {{ error }}
            </div>

            <div class="login-link">
              มีบัญชีอยู่แล้ว?

              <RouterLink to="/login">
                เข้าสู่ระบบ
              </RouterLink>
            </div>
          </div>

        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.register-section {
  min-height: calc(100vh - 72px);
  padding: 70px 0;

  background:
    linear-gradient(
      135deg,
      #f3faf5 0%,
      #ffffff 55%,
      #eaf6ee 100%
    );
}

.register-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 70px;
  align-items: center;
}

.register-info {
  padding: 30px 10px;
}

.page-badge {
  display: inline-block;
  padding: 8px 18px;
  border-radius: 30px;

  background: #e3f2e8;
  color: #3f7c58;

  font-size: 13px;
  font-weight: 700;
  letter-spacing: 2px;
}

.register-info h1 {
  margin-top: 22px;

  font-size: 52px;
  font-weight: 800;
  line-height: 1.15;

  color: #223128;
}

.register-info h1 span {
  display: block;
  color: #4c956c;
}

.register-info > p {
  max-width: 520px;
  margin-top: 22px;

  color: #6f7c73;
  font-size: 17px;
  line-height: 1.8;
}

.benefits {
  margin-top: 35px;

  display: flex;
  flex-direction: column;
  gap: 15px;
}

.benefit-item {
  color: #445249;
  font-weight: 500;
}

.benefit-item span {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  width: 28px;
  height: 28px;

  margin-right: 10px;

  border-radius: 50%;

  background: #e3f2e8;
  color: #397452;

  font-weight: 800;
}

.register-card {
  max-width: 520px;
  width: 100%;

  margin-left: auto;

  padding: 38px;

  border-radius: 26px;
  border: 1px solid #e3ebe5;

  background: rgba(255, 255, 255, 0.96);

  box-shadow:
    0 25px 60px rgba(57, 116, 82, 0.12);
}

.register-icon {
  width: 64px;
  height: 64px;

  margin: 0 auto 15px;

  border-radius: 18px;

  display: flex;
  align-items: center;
  justify-content: center;

  background: #e8f5ed;

  font-size: 30px;
}

.register-card h2 {
  margin-bottom: 5px;

  color: #26352b;
  font-weight: 800;
}

.register-card > div > p {
  color: #7a857e;
}

form {
  display: flex;
  flex-direction: column;
  gap: 17px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.form-group label {
  color: #3f4d44;

  font-size: 14px;
  font-weight: 700;
}

.form-group input {
  width: 100%;

  padding: 13px 15px;

  border: 1px solid #dce6df;
  border-radius: 11px;

  background: #ffffff;

  font-size: 15px;
  color: #28352d;

  outline: none;

  transition: 0.2s;
}

.form-group input:focus {
  border-color: #4c956c;

  box-shadow:
    0 0 0 4px rgba(76, 149, 108, 0.1);
}

.register-btn {
  margin-top: 8px;

  padding: 13px;

  border: none;
  border-radius: 11px;

  background: #4c956c;
  color: white;

  font-size: 16px;
  font-weight: 700;

  cursor: pointer;

  transition: 0.2s;
}

.register-btn:hover {
  background: #397452;
}

.alert-message {
  margin-top: 18px;
  padding: 12px 15px;

  border-radius: 10px;

  text-align: center;

  font-size: 14px;
  font-weight: 600;
}

.alert-message.success {
  background: #e8f6ed;
  color: #34744f;
}

.alert-message.error {
  background: #fdeaea;
  color: #b24b4b;
}

.login-link {
  margin-top: 22px;

  text-align: center;

  color: #7a857e;

  font-size: 14px;
}

.login-link a {
  margin-left: 4px;

  color: #4c956c;

  font-weight: 700;

  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}

@media (max-width: 991px) {
  .register-wrapper {
    grid-template-columns: 1fr;
    gap: 35px;
  }

  .register-info {
    text-align: center;
  }

  .register-info > p {
    margin-left: auto;
    margin-right: auto;
  }

  .benefits {
    align-items: center;
  }

  .register-card {
    margin: auto;
  }
}

@media (max-width: 575px) {
  .register-section {
    padding: 40px 15px;
  }

  .register-info h1 {
    font-size: 38px;
  }

  .register-card {
    padding: 25px 20px;
  }
}
</style>