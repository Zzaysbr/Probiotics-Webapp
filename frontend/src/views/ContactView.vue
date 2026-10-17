<script setup>
import { onMounted, ref } from "vue";
import api, { errorMessage } from "../services/api";

const shop = ref(null);
const error = ref("");
const loading = ref(true);

async function loadShop() {
  loading.value = true;
  error.value = "";
  try {
    shop.value = (await api.get("/shop")).data;
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    loading.value = false;
  }
}

onMounted(loadShop);

const members = [
  { name: "กฤตพร ธัญญเจริญ", id: "1167109060083", initial: "ก" },
  { name: "ธีทัต แจ่มแจ้ง", id: "1167109060513", initial: "ธ" },
  { name: "อนันตสิน เสาร์แก้ว", id: "1167109060547", initial: "อ" },
];
</script>

<template>
  <main class="contact-page">
    <div class="container contact-container">
      <header class="contact-heading">
        <p class="contact-eyebrow"><span></span> GET IN TOUCH</p>
        <h1>ติดต่อเรา<span class="heading-dot">.</span></h1>
        <p class="contact-intro">
          ข้อมูลการติดต่อ และทีมงานเบื้องหลัง Probiotic Shop
        </p>
      </header>

      <div v-if="error" class="alert alert-danger contact-error" role="alert">
        {{ error }}
        <button
          type="button"
          class="btn btn-sm btn-outline-danger ms-2"
          @click="loadShop"
        >
          ลองใหม่
        </button>
      </div>

      <div class="contact-grid">
        <section
          class="contact-details"
          aria-labelledby="shop-heading"
          :aria-busy="loading"
        >
          <svg
            class="contact-leaf"
            viewBox="0 0 260 340"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M120 340C115 230 148 128 218 26M142 238C81 230 47 199 31 149C96 141 134 174 142 238ZM166 167C163 107 188 65 242 44C252 105 225 147 166 167ZM127 297C65 297 25 270 8 221C71 208 114 237 127 297Z"
              stroke="currentColor"
              stroke-width="1.2"
            />
          </svg>
          <div class="shop-identity">
            <span class="contact-brand-mark" aria-hidden="true"
              >P<span>✦</span></span
            >
            <p class="contact-card-eyebrow">LET’S CONNECT</p>
            <h2 id="shop-heading">{{ shop?.name || "Probiotic Shop" }}</h2>
            <p class="contact-card-intro">
              ทุกการติดต่อ คือจุดเริ่มต้นของการดูแลที่ดี
            </p>
          </div>

          <p v-if="loading" class="contact-loading" role="status">
            กำลังโหลดข้อมูลติดต่อ…
          </p>
          <dl v-else-if="shop" class="contact-info-list">
            <div class="contact-info-item">
              <span class="contact-icon" aria-hidden="true"
                ><svg viewBox="0 0 24 24" fill="none">
                  <path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" />
                  <circle cx="12" cy="10" r="2.5" /></svg
              ></span>
              <div>
                <dt>ที่อยู่</dt>
                <dd>{{ shop.address }}</dd>
              </div>
            </div>
            <div class="contact-info-item">
              <span class="contact-icon" aria-hidden="true"
                ><svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="m8 3 3 5-3 3a17 17 0 0 0 5 5l3-3 5 3c-1 4-3 5-5 5C9 20 4 15 3 8c0-2 1-4 5-5Z"
                  /></svg
              ></span>
              <div>
                <dt>โทรศัพท์</dt>
                <dd>{{ shop.phone }}</dd>
                <p class="contact-info-caption">กองประชาสัมพันธ์ มทร.ธัญบุรี</p>
              </div>
            </div>
            <div class="contact-info-item">
              <span class="contact-icon" aria-hidden="true"
                ><svg viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="5" width="18" height="14" rx="3" />
                  <path d="m4 7 8 6 8-6" /></svg
              ></span>
              <div>
                <dt>อีเมล</dt>
                <dd>{{ shop.email }}</dd>
              </div>
            </div>
          </dl>
          <div class="contact-card-signoff">
            <span></span> A LITTLE CARE, EVERY DAY
          </div>
        </section>

        <section class="contact-team" aria-labelledby="team-heading">
          <div class="team-heading">
            <div>
              <p class="contact-eyebrow">THE PEOPLE BEHIND</p>
              <h2 id="team-heading">ทีมผู้จัดทำ</h2>
              <p>ทำความรู้จักกับสมาชิกในกลุ่มของเรา</p>
            </div>
            <span class="team-count" aria-label="สมาชิก 3 คน"
              >03<span>MEMBERS</span></span
            >
          </div>
          <ol class="team-list">
            <li
              v-for="(member, index) in members"
              :key="member.id"
              class="team-member"
            >
              <div
                class="member-avatar"
                :class="'avatar-' + index"
                aria-hidden="true"
              >
                {{ member.initial }}<span class="avatar-spark">✦</span>
              </div>
              <div class="member-details">
                <p class="member-role">สมาชิกในกลุ่ม</p>
                <h3>{{ member.name }}</h3>
                <p class="member-id">
                  รหัสนักศึกษา <span>{{ member.id }}</span>
                </p>
              </div>
              <span class="member-number" aria-hidden="true"
                >0{{ index + 1 }}</span
              >
            </li>
          </ol>
          <div class="team-footer">
            <span class="team-footer-mark" aria-hidden="true">✦</span>
            <p>
              ใส่ใจในรายละเอียด<br /><strong
                >เพื่อประสบการณ์ที่ดีในทุกวัน</strong
              >
            </p>
          </div>
        </section>
      </div>

      <footer class="contact-bottom">
        <p>พร้อมค้นหาสิ่งดี ๆ สำหรับคุณแล้วหรือยัง?</p>
        <RouterLink to="/products"
          >เลือกชมสินค้าของเรา <span aria-hidden="true">↗</span></RouterLink
        >
      </footer>
    </div>
  </main>
</template>

<style scoped>
.contact-page {
  background: #f7f2f6;
  min-height: calc(100vh - 68px);
  padding: 64px 0 36px;
}
.contact-container {
  max-width: 1200px;
}
.contact-heading {
  margin-bottom: 38px;
}
.contact-eyebrow {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #6e547e;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 2px;
  margin: 0 0 16px;
}
.contact-eyebrow > span {
  width: 7px;
  height: 7px;
  background: #9274a5;
  border-radius: 50%;
}
.contact-heading h1 {
  color: #34243e;
  font-size: clamp(38px, 5vw, 58px);
  line-height: 1.2;
  letter-spacing: -1.8px;
  margin: 0 0 16px;
}
.heading-dot {
  color: #ad789e;
}
.contact-intro {
  color: #856698;
  font-size: 15px;
  line-height: 1.8;
  margin: 0;
}
.contact-grid {
  display: grid;
  grid-template-columns: minmax(0, 0.93fr) minmax(0, 1.25fr);
  gap: 28px;
}
.contact-details {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  background: #3f294c;
  color: #fff;
  border-radius: 24px;
  padding: 38px 36px 28px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 14px 32px #3f294c10;
}
.contact-leaf {
  position: absolute;
  color: #b195c2;
  opacity: 0.22;
  width: 220px;
  right: -60px;
  top: -40px;
  z-index: -1;
  transform: rotate(-12deg);
}
.contact-brand-mark {
  position: relative;
  display: grid;
  place-items: center;
  width: 54px;
  height: 54px;
  border: 1px solid #ddcde777;
  border-radius: 50%;
  font:
    32px Georgia,
    serif;
  color: #f1dfec;
  margin-bottom: 25px;
}
.contact-brand-mark > span {
  position: absolute;
  font:
    16px Georgia,
    serif;
  top: -6px;
  right: -6px;
  background: #3f294c;
  padding: 2px;
}
.contact-card-eyebrow {
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 2.4px;
  color: #bba7c7;
  margin-bottom: 10px;
}
.shop-identity h2 {
  font-size: 30px;
  font-weight: 500;
  letter-spacing: -0.8px;
  color: #fff;
  margin-bottom: 12px;
}
.contact-card-intro {
  font-size: 12px;
  line-height: 1.8;
  color: #d2c4db;
  margin: 0;
}
.contact-info-list {
  margin: 30px 0 32px;
  display: grid;
  gap: 22px;
}
.contact-info-item {
  display: flex;
  align-items: flex-start;
  gap: 15px;
}
.contact-info-item > div {
  min-width: 0;
}
.contact-icon {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border: 1px solid #b195c233;
  border-radius: 11px;
  background: #ffffff06;
}
.contact-icon svg {
  width: 18px;
  height: 18px;
  stroke: #dbc9e6;
  stroke-width: 1.4;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.contact-info-item dt {
  font-size: 10px;
  font-weight: 400;
  color: #bba9c6;
  margin: 0 0 5px;
}
.contact-info-item dd {
  font-size: 13px;
  line-height: 1.85;
  margin: 0;
  color: #f6eef4;
  overflow-wrap: anywhere;
}
.contact-info-caption {
  color: #bba9c6;
  font-size: 10px;
  margin: 4px 0 0;
}
.contact-card-signoff {
  display: flex;
  align-items: center;
  gap: 10px;
  border-top: 1px solid #baa6c626;
  padding-top: 20px;
  margin-top: auto;
  color: #bba9c6;
  font-size: 8px;
  letter-spacing: 1.8px;
}
.contact-card-signoff span {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #baa6c6;
}
.contact-loading {
  font-size: 13px;
  padding: 30px 0;
}
.contact-team {
  background: #fff;
  border: 1px solid #e4dbea;
  border-radius: 24px;
  padding: 38px 36px 26px;
}
.team-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  padding-bottom: 26px;
}
.team-heading .contact-eyebrow {
  font-size: 9px;
  margin-bottom: 13px;
}
.team-heading h2 {
  font-size: 28px;
  font-weight: 600;
  color: #36293e;
  margin: 0 0 10px;
}
.team-heading p:last-child {
  font-size: 12px;
  color: #9377a4;
  margin-bottom: 0;
  line-height: 1.8;
}
.team-count {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #ab95b9;
  background: #f7f0f5;
  border: 1px solid #ede2ea;
  border-radius: 14px;
  padding: 12px 14px 10px;
  font:
    30px/1 Georgia,
    serif;
}
.team-count > span {
  font:
    7px/1.2 "Segoe UI",
    sans-serif;
  letter-spacing: 1px;
  margin-top: 7px;
}
.team-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.team-member {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 26px 0;
  border-top: 1px solid #eee8f1;
}
.member-avatar {
  position: relative;
  display: grid;
  place-items: center;
  width: 66px;
  height: 72px;
  flex-shrink: 0;
  border-radius: 19px 19px 26px 19px;
  color: #634c71;
  background: #e9dfef;
  font-size: 32px;
  font-weight: 400;
}
.avatar-1 {
  color: #785c8a;
  background: #eee9f2;
  border-radius: 26px 19px 19px 19px;
}
.avatar-2 {
  color: #8b8162;
  background: #f1eee1;
  border-radius: 19px 26px 19px 19px;
}
.avatar-spark {
  position: absolute;
  right: 8px;
  top: 6px;
  font-size: 10px;
  opacity: 0.6;
}
.member-details {
  min-width: 0;
  flex: 1;
}
.member-role {
  color: #987da9;
  font-size: 9px;
  letter-spacing: 0.3px;
  margin: 0 0 6px;
}
.member-details h3 {
  font-size: 18px;
  font-weight: 500;
  color: #3d2e46;
  line-height: 1.5;
  margin: 0 0 5px;
}
.member-id {
  font-size: 10px;
  color: #987da8;
  margin: 0;
  line-height: 1.8;
}
.member-id > span {
  color: #7d608f;
  font-size: 11px;
  letter-spacing: 0.3px;
}
.member-number {
  align-self: flex-start;
  margin-top: 7px;
  color: #c8b9d1;
  font:
    italic 15px Georgia,
    serif;
}
.team-footer {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 10px;
  padding: 19px 20px;
  background: #f8f3f7;
  border-radius: 12px;
}
.team-footer-mark {
  color: #b18aa6;
  font-size: 28px;
}
.team-footer p {
  color: #9a80ab;
  font-size: 10px;
  line-height: 1.85;
  margin: 0;
}
.team-footer strong {
  color: #6c527c;
  font-size: 11px;
  font-weight: 500;
}
.contact-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-top: 28px;
}
.contact-bottom p {
  color: #9d84ad;
  font-size: 11px;
  margin: 0;
}
.contact-bottom a {
  color: #5e456d;
  font-size: 12px;
  font-weight: 500;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 14px;
}
.contact-bottom a:hover {
  text-decoration: underline;
}
.contact-bottom a span {
  font-size: 20px;
  transition: transform 0.2s;
}
.contact-bottom a:hover span {
  transform: translate(2px, -2px);
}
@media (max-width: 991px) {
  .contact-grid {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr);
    gap: 20px;
  }
  .contact-details,
  .contact-team {
    padding-left: 25px;
    padding-right: 25px;
  }
  .team-member {
    gap: 14px;
  }
  .member-avatar {
    width: 54px;
    height: 62px;
  }
  .member-details h3 {
    font-size: 16px;
  }
  .member-id > span {
    display: block;
  }
}
@media (max-width: 767px) {
  .contact-page {
    padding-top: 36px;
  }
  .contact-heading {
    margin-bottom: 28px;
  }
  .contact-grid {
    grid-template-columns: 1fr;
  }
  .contact-details {
    padding: 30px 26px 25px;
  }
  .contact-brand-mark {
    margin-bottom: 20px;
  }
  .contact-team {
    padding: 30px 26px 24px;
  }
  .member-details h3 {
    font-size: 18px;
  }
  .member-id > span {
    display: inline;
  }
  .contact-info-list {
    margin-top: 28px;
  }
  .contact-bottom {
    align-items: flex-start;
    flex-direction: column;
    gap: 10px;
    padding-top: 22px;
  }
}
@media (max-width: 374px) {
  .contact-details,
  .contact-team {
    padding-left: 20px;
    padding-right: 20px;
  }
  .member-avatar {
    width: 46px;
    height: 54px;
    font-size: 26px;
  }
  .member-id > span {
    display: block;
  }
  .team-count {
    padding: 10px;
  }
  .member-details h3 {
    font-size: 16px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .contact-bottom a span {
    transition: none;
  }
}
.contact-team .member-role,
.contact-team .member-id,
.contact-team .member-id > span,
.team-heading p:last-child {
  color: #82708d;
}
.contact-info-item dd {
  font-size: 14px;
}
.member-id,
.member-id > span {
  font-size: 12px;
}
.member-role {
  font-size: 10px;
}
</style>
