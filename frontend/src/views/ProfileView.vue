<script setup>
import { computed, onMounted, ref } from "vue";
import api, { errorMessage } from "../services/api";

const profile = ref(null);
const loading = ref(true);
const error = ref("");
const initial = computed(() =>
  Array.from(profile.value?.username || "P")[0].toUpperCase(),
);
const roleName = computed(() =>
  profile.value?.role === "admin" ? "ผู้ดูแลระบบ" : "สมาชิก",
);
const joined = computed(() => {
  if (!profile.value?.created_at) return "—";
  const date = new Date(profile.value.created_at.replace(" ", "T") + "+07:00");
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("th-TH", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Bangkok",
      });
});
async function loadProfile() {
  loading.value = true;
  error.value = "";
  try {
    profile.value = (await api.get("/me")).data.user;
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    loading.value = false;
  }
}
onMounted(loadProfile);
</script>

<template>
  <main class="profile-page container">
    <header class="profile-heading">
      <p class="eyebrow">MY ACCOUNT</p>
      <h1>โปรไฟล์ของฉัน</h1>
      <p>ข้อมูลบัญชีและรายละเอียดส่วนตัวของคุณ</p>
    </header>
    <section
      v-if="loading"
      class="profile-loading"
      role="status"
      aria-live="polite"
    >
      <span
        class="spinner-border spinner-border-sm me-2"
        aria-hidden="true"
      ></span
      >กำลังโหลดข้อมูลโปรไฟล์…
    </section>
    <div v-else-if="error" class="alert alert-danger" role="alert">
      {{ error }}
      <button
        type="button"
        class="btn btn-sm btn-outline-danger ms-2"
        @click="loadProfile"
      >
        ลองใหม่
      </button>
    </div>
    <div v-else-if="profile" class="profile-grid">
      <aside class="profile-identity" aria-label="บัญชีของคุณ">
        <div class="identity-decoration" aria-hidden="true"></div>
        <div class="profile-avatar" aria-hidden="true">
          {{ initial }}<span>✦</span>
        </div>
        <p class="identity-label">YOUR PROFILE</p>
        <h2>{{ profile.username }}</h2>
        <span class="profile-role">{{ roleName }}</span>
        <div class="joined-date">
          <span>สมาชิกตั้งแต่</span><strong>{{ joined }}</strong>
        </div>
        <RouterLink class="profile-orders" to="/orders"
          >ดูคำสั่งซื้อของฉัน <span aria-hidden="true">↗</span></RouterLink
        >
      </aside>
      <div class="profile-content">
        <section class="profile-information" aria-labelledby="personal-heading">
          <div class="information-heading">
            <div>
              <p class="eyebrow">PERSONAL INFORMATION</p>
              <h2 id="personal-heading">ข้อมูลส่วนตัว</h2>
            </div>
            <span class="information-mark" aria-hidden="true">✦</span>
          </div>
          <dl class="profile-fields">
            <div>
              <dt>ชื่อผู้ใช้ (Username)</dt>
              <dd>{{ profile.username }}</dd>
            </div>
            <div>
              <dt>ชื่อ–นามสกุล</dt>
              <dd>{{ profile.full_name || "ยังไม่ได้ระบุ" }}</dd>
            </div>
            <div>
              <dt>อีเมล</dt>
              <dd>{{ profile.email || "ยังไม่ได้ระบุ" }}</dd>
            </div>
            <div>
              <dt>เบอร์โทรศัพท์</dt>
              <dd>{{ profile.phone || "ยังไม่ได้ระบุ" }}</dd>
            </div>
            <div>
              <dt>ประเภทบัญชี</dt>
              <dd>{{ roleName }}</dd>
            </div>
            <div>
              <dt>วันที่สมัครสมาชิก</dt>
              <dd>{{ joined }}</dd>
            </div>
          </dl>
        </section>
        <section class="profile-security" aria-labelledby="security-heading">
          <span class="security-icon" aria-hidden="true"
            ><svg
              width="23"
              height="23"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.4"
            >
              <rect x="5" y="10" width="14" height="11" rx="3" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              <path d="M12 14v3" /></svg
          ></span>
          <div>
            <h2 id="security-heading">ความปลอดภัยของบัญชี</h2>
            <p>ตั้งรหัสผ่านใหม่ผ่านลิงก์ที่ส่งไปยังอีเมลของคุณ</p>
          </div>
          <RouterLink
            :to="{ path: '/forgot-password', query: { email: profile.email } }"
            >รีเซ็ตรหัสผ่าน <span aria-hidden="true">→</span></RouterLink
          >
        </section>
      </div>
    </div>
  </main>
</template>

<style scoped>
.profile-page {
  max-width: 1120px;
  padding-top: 54px;
  padding-bottom: 60px;
  min-height: calc(100vh - 68px);
}
.profile-heading {
  margin-bottom: 32px;
}
.profile-heading h1 {
  color: #3f294c;
  font-size: clamp(30px, 4vw, 42px);
  margin-bottom: 12px;
}
.profile-heading > p:last-child {
  color: #8d709f;
  font-size: 14px;
}
.profile-grid {
  display: grid;
  grid-template-columns: minmax(0, 0.72fr) minmax(0, 1.5fr);
  gap: 26px;
  align-items: start;
}
.profile-identity {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  border-radius: 22px;
  background: #3f294c;
  color: #fff;
  padding: 38px 28px 24px;
  text-align: center;
}
.identity-decoration {
  position: absolute;
  width: 230px;
  height: 230px;
  border: 1px solid #b195c233;
  border-radius: 50%;
  right: -95px;
  top: -95px;
  z-index: -1;
}
.identity-decoration::after {
  content: "";
  position: absolute;
  inset: 18px;
  border: 1px solid #b195c222;
  border-radius: 50%;
}
.profile-avatar {
  position: relative;
  display: grid;
  place-items: center;
  width: 88px;
  height: 88px;
  border-radius: 26px;
  background: #eedce9;
  color: #5c456a;
  font:
    44px Georgia,
    serif;
  margin: 0 auto 26px;
}
.profile-avatar span {
  position: absolute;
  right: 9px;
  top: 8px;
  font-size: 15px;
  color: #9377a4;
}
.identity-label {
  font-size: 9px;
  letter-spacing: 2px;
  color: #bdacc7;
  margin: 0 0 12px;
}
.profile-identity h2 {
  color: #fff;
  font-size: 24px;
  font-weight: 500;
  overflow-wrap: anywhere;
  margin-bottom: 16px;
}
.profile-role {
  display: inline-block;
  padding: 6px 15px;
  background: #ffffff0c;
  border: 1px solid #bdacc744;
  border-radius: 30px;
  color: #ddcee6;
  font-size: 11px;
}
.joined-date {
  display: grid;
  gap: 8px;
  border-top: 1px solid #ffffff1a;
  margin-top: 30px;
  padding-top: 25px;
}
.joined-date span {
  font-size: 10px;
  color: #bdacc7;
}
.joined-date strong {
  font-size: 13px;
  font-weight: 400;
}
.profile-orders {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #e2d6e9;
  font-size: 12px;
  text-decoration: none;
  border-top: 1px solid #ffffff1a;
  margin-top: 25px;
  padding-top: 21px;
}
.profile-orders:hover {
  color: #fff;
  text-decoration: underline;
}
.profile-content {
  display: grid;
  gap: 20px;
}
.profile-information {
  background: #fff;
  border: 1px solid #e4dbea;
  border-radius: 22px;
  padding: 30px;
}
.information-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 26px;
}
.information-heading .eyebrow {
  font-size: 9px;
  margin-bottom: 10px;
}
.information-heading h2 {
  font-size: 24px;
  color: #3f294c;
  margin: 0;
}
.information-mark {
  font-size: 34px;
  color: #b793ad;
}
.profile-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 28px;
  margin: 0;
}
.profile-fields > div {
  border-top: 1px solid #eee8f1;
  padding: 20px 0;
}
.profile-fields dt {
  font-size: 11px;
  font-weight: 400;
  color: #9276a3;
  margin-bottom: 9px;
}
.profile-fields dd {
  color: #42324c;
  font-size: 14px;
  margin: 0;
  line-height: 1.7;
  overflow-wrap: anywhere;
}
.profile-security {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 22px;
  background: #eee7f2;
  border: 1px solid #e2d8e8;
  border-radius: 18px;
}
.security-icon {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  background: #e1d5e8;
  border-radius: 13px;
  color: #725584;
}
.profile-security h2 {
  font-size: 13px;
  color: #543e62;
  margin-bottom: 6px;
}
.profile-security p {
  font-size: 10px;
  color: #8a6b9d;
  margin: 0;
  line-height: 1.7;
}
.profile-security a {
  margin-left: auto;
  flex-shrink: 0;
  font-size: 11px;
  color: #543e62;
  text-decoration: none;
}
.profile-security a:hover {
  text-decoration: underline;
}
.profile-security a span {
  margin-left: 7px;
}
.profile-loading {
  border: 1px solid #e4dbea;
  border-radius: 18px;
  padding: 35px;
  background: white;
  color: #6c527c;
}
@media (max-width: 767px) {
  .profile-page {
    padding-top: 32px;
  }
  .profile-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  .profile-identity {
    padding-top: 30px;
  }
  .profile-information {
    padding: 24px;
  }
  .profile-security {
    flex-wrap: wrap;
  }
  .profile-security a {
    margin-left: 59px;
  }
}
@media (max-width: 399px) {
  .profile-fields {
    grid-template-columns: 1fr;
  }
  .profile-information {
    padding: 22px;
  }
  .profile-security > div {
    flex: 1;
    min-width: 0;
  }
  .profile-security a {
    margin-left: 0;
    width: 100%;
    border-top: 1px solid #dcd1e3;
    padding-top: 12px;
  }
}
.profile-heading > p:last-child,
.profile-fields dt {
  color: #81708b;
}
.profile-fields dt {
  font-size: 12px;
}
.profile-security p {
  color: #7b6289;
  font-size: 12px;
}
.profile-security a {
  font-size: 12px;
}
</style>
