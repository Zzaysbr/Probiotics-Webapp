<script setup>
import ProductVisual from "../components/ProductVisual.vue";
import { authState } from "../services/auth";
const categories = [
  {
    name: "แบบแคปซูล",
    detail: "เลือกดูผลิตภัณฑ์โปรไบโอติกแบบแคปซูล",
    variant: 1,
    tag: "CAPSULES",
  },
  {
    name: "แบบผงหรือซอง",
    detail: "ค้นพบโปรไบโอติกชนิดผงและซองพร้อมชง",
    variant: 2,
    tag: "POWDER & SACHETS",
  },
  {
    name: "แบบเม็ดเคี้ยว",
    detail: "อีกหนึ่งรูปแบบที่เลือกได้ตามความชอบ",
    variant: 3,
    tag: "CHEWABLES",
  },
];
</script>
<template>
  <main class="home-page">
    <section class="home-hero container">
      <div class="hero-copy">
        <span class="home-kicker"><span>✦</span> A LITTLE CARE, EVERY DAY</span>
        <h1>ดูแลตัวเอง<br />ในแบบที่<span>คุณชอบ.</span></h1>
        <p>
          เติมความใส่ใจให้ทุกวัน ด้วยผลิตภัณฑ์โปรไบโอติก<br
            class="d-none d-md-block"
          />ที่เลือกดูได้ง่าย ในที่เดียว
        </p>
        <div class="hero-actions">
          <RouterLink class="btn btn-success" to="/products"
            >เลือกชมสินค้า <span aria-hidden="true">↗</span></RouterLink
          ><RouterLink class="hero-secondary" to="/contact"
            >รู้จักเราให้มากขึ้น <span aria-hidden="true">→</span></RouterLink
          >
        </div>
        <div class="hero-assurance">
          <span><i>✓</i> เลือกง่าย</span><span><i>✓</i> ข้อมูลชัดเจน</span
          ><span><i>✓</i> ติดตามคำสั่งซื้อได้</span>
        </div>
      </div>
      <div class="hero-showcase">
        <div class="showcase-heading">
          <span>YOUR DAILY ROUTINE</span><span>✦</span>
        </div>
        <div class="showcase-art"><ProductVisual /></div>
        <span class="showcase-pill">A little balance, a little happiness.</span>
        <div class="showcase-caption">
          <div>
            <small>MEET YOUR EVERYDAY ESSENTIAL</small
            ><strong>Probiotic Daily Balance</strong>
          </div>
          <span class="showcase-arrow" aria-hidden="true">↗</span>
        </div>
      </div>
    </section>
    <section class="shopping-strip container" aria-label="วิธีสั่งซื้อ">
      <div>
        <span>01</span>
        <p>
          <strong>เลือกสินค้าที่ชอบ</strong
          ><small>ค้นหาหรือเลือกตามหมวดหมู่</small>
        </p>
      </div>
      <span class="strip-divider"></span>
      <div>
        <span>02</span>
        <p>
          <strong>สั่งซื้อได้สะดวก</strong
          ><small>ใส่ตะกร้าและระบุข้อมูลจัดส่ง</small>
        </p>
      </div>
      <span class="strip-divider"></span>
      <div>
        <span>03</span>
        <p>
          <strong>ติดตามได้ทุกขั้นตอน</strong
          ><small>ตรวจสถานะและดาวน์โหลดใบเสร็จ</small>
        </p>
      </div>
    </section>
    <section class="home-collection container">
      <div class="collection-heading">
        <div>
          <p class="eyebrow">FIND YOUR FAVORITE</p>
          <h2>เลือกแบบที่ใช่สำหรับคุณ</h2>
          <p>สามรูปแบบ ให้คุณเลือกได้ตามความชอบ</p>
        </div>
        <RouterLink to="/products"
          >ดูสินค้าทั้งหมด <span aria-hidden="true">→</span></RouterLink
        >
      </div>
      <div class="collection-grid">
        <RouterLink
          v-for="c in categories"
          :key="c.name"
          :to="{ path: '/products', query: { category: c.name } }"
          class="collection-card"
          ><div class="collection-art" :class="'collection-art-' + c.variant">
            <ProductVisual :variant="c.variant" />
          </div>
          <div class="collection-info">
            <small>{{ c.tag }}</small>
            <h3>{{ c.name }} <span aria-hidden="true">↗</span></h3>
            <p>{{ c.detail }}</p>
          </div></RouterLink
        >
      </div>
    </section>
    <section class="home-invitation container">
      <div>
        <p class="eyebrow">MAKE YOURSELF AT HOME</p>
        <h2>
          {{
            authState.user
              ? "สิ่งดี ๆ ในทุกวัน เริ่มต้นได้ที่นี่"
              : "เริ่มต้นประสบการณ์ดี ๆ ไปด้วยกัน"
          }}
        </h2>
        <p>
          {{
            authState.user
              ? "เลือกชมสินค้าและจัดการคำสั่งซื้อของคุณได้ในที่เดียว"
              : "สร้างบัญชีเพื่อเลือกซื้อสินค้า และติดตามคำสั่งซื้อได้สะดวกยิ่งขึ้น"
          }}
        </p>
      </div>
      <RouterLink
        :to="authState.user ? '/products' : '/register'"
        class="btn btn-success"
        >{{ authState.user ? "เลือกซื้อสินค้า" : "สมัครสมาชิก" }}
        <span aria-hidden="true">→</span></RouterLink
      >
    </section>
    <footer class="home-footer container">
      <RouterLink class="footer-brand" to="/"
        >PROBIOTIC SHOP<span>✦</span></RouterLink
      >
      <p>A little care makes every day better.</p>
      <RouterLink to="/contact">ติดต่อเรา ↗</RouterLink>
    </footer>
  </main>
</template>
<style scoped>
.home-page {
  background: #fcf9fe;
}
.home-hero {
  display: grid;
  grid-template-columns: 1.05fr 1fr;
  gap: 64px;
  align-items: center;
  padding-top: 54px;
  padding-bottom: 48px;
}
.home-kicker {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  color: #9e75b0;
  font-size: 9px;
  letter-spacing: 2px;
  font-weight: 600;
}
.home-kicker > span {
  font-size: 15px;
  color: #d29abd;
}
.hero-copy h1 {
  font-size: clamp(42px, 5vw, 66px);
  line-height: 1.32;
  letter-spacing: -2px;
  color: #473155;
  margin: 22px 0 24px;
  font-weight: 650;
}
.hero-copy h1 span {
  color: #9b65bd;
}
.hero-copy > p {
  color: #80698d;
  font-size: 14px;
  line-height: 2;
  margin-bottom: 30px;
}
.hero-actions {
  display: flex;
  align-items: center;
  gap: 26px;
}
.hero-actions .btn {
  padding: 13px 24px;
}
.hero-actions .btn span {
  margin-left: 20px;
  font-size: 18px;
}
.hero-secondary {
  color: #7e5d95;
  text-decoration: none;
  font-size: 12px;
}
.hero-secondary span {
  margin-left: 8px;
}
.hero-secondary:hover {
  color: #7343a2;
}
.hero-assurance {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 34px;
  color: #87718f;
  font-size: 10px;
}
.hero-assurance i {
  display: inline-grid;
  place-items: center;
  width: 16px;
  height: 16px;
  font-style: normal;
  background: #eee5f6;
  border-radius: 50%;
  color: #a97cc7;
  margin-right: 5px;
  font-size: 9px;
}
.hero-showcase {
  position: relative;
  background:
    radial-gradient(ellipse at 80% 15%, #f4cbe2 0, transparent 60%),
    linear-gradient(135deg, #ede2f8, #e2d0f2 65%, #edd6ed);
  border-radius: 120px 28px 28px 28px;
  padding: 28px 30px 24px;
  min-height: 450px;
  overflow: hidden;
}
.showcase-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 40px;
  color: #a886b7;
  font-size: 8px;
  letter-spacing: 1.8px;
}
.showcase-heading > span:last-child {
  font-size: 28px;
  color: #fffafc;
}
.showcase-art {
  height: 295px;
}
.showcase-art :deep(.product-visual-scene) {
  transform: scale(1.65);
}
.showcase-art :deep(.visual-package) {
  transform: rotate(-15deg);
}
.showcase-art :deep(.orbit-one) {
  width: 190px;
  height: 190px;
}
.showcase-art :deep(.orbit-two) {
  width: 240px;
  height: 240px;
}
.showcase-art :deep(.capsule-left) {
  left: 22%;
  top: 30%;
}
.showcase-art :deep(.capsule-right) {
  right: 22%;
  bottom: 25%;
}
.showcase-pill {
  display: table;
  margin: 0 auto 21px;
  background: #ffffff70;
  border: 1px solid #ffffff80;
  border-radius: 25px;
  padding: 7px 15px;
  color: #ae7fa4;
  font-size: 9px;
}
.showcase-caption {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  border-top: 1px solid #ffffff66;
  padding-top: 20px;
}
.showcase-caption small {
  display: block;
  color: #aa85b7;
  font-size: 7px;
  letter-spacing: 1.6px;
  margin-bottom: 6px;
}
.showcase-caption strong {
  font-weight: 500;
  color: #735283;
  font-size: 15px;
}
.showcase-arrow {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #ffffff6b;
  color: #9a6eae;
  font-size: 22px;
}
.shopping-strip {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28px 35px;
  background: #fff;
  border: 1px solid #f0e7f5;
  border-radius: 18px;
}
.shopping-strip > div {
  display: flex;
  align-items: center;
  gap: 16px;
}
.shopping-strip > div > span {
  font:
    italic 24px Georgia,
    serif;
  color: #c4a4d9;
}
.shopping-strip p {
  margin: 0;
}
.shopping-strip strong {
  display: block;
  color: #71557f;
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 5px;
}
.shopping-strip small {
  color: #80698d;
  font-size: 10px;
}
.strip-divider {
  width: 1px;
  height: 30px;
  background: #eee5f4;
}
.home-collection {
  padding-top: 65px;
  padding-bottom: 60px;
}
.collection-heading {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: center;
  margin-bottom: 30px;
}
.collection-heading h2 {
  color: #51365e;
  font-size: 28px;
  margin-bottom: 10px;
}
.collection-heading p:last-child {
  color: #80698d;
  font-size: 12px;
  margin: 0;
}
.collection-heading > a {
  font-size: 11px;
  color: #8050a1;
  text-decoration: none;
}
.collection-heading > a span {
  margin-left: 12px;
}
.collection-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
}
.collection-card {
  border-radius: 22px;
  overflow: hidden;
  border: 1px solid #eee4f5;
  background: white;
  text-decoration: none;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}
.collection-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 30px #8050b611;
}
.collection-art {
  height: 220px;
  background: #f0e8f8;
}
.collection-art-2 {
  background: #f9e9f1;
}
.collection-art-3 {
  background: #eeeafa;
}
.collection-info {
  padding: 23px;
}
.collection-info > small {
  font-size: 8px;
  letter-spacing: 1.5px;
  color: #b08bc0;
}
.collection-info h3 {
  display: flex;
  justify-content: space-between;
  color: #70507e;
  font-size: 18px;
  margin: 10px 0;
}
.collection-info h3 span {
  color: #c3a6d0;
}
.collection-info p {
  color: #80698d;
  font-size: 11px;
  margin: 0;
}
.home-invitation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 30px;
  padding: 38px;
  border: 1px solid #eedff0;
  background: linear-gradient(110deg, #f0e6f8, #fcebf3);
  border-radius: 22px;
}
.home-invitation h2 {
  font-size: 25px;
  color: #725080;
}
.home-invitation p:last-child {
  margin: 10px 0 0;
  font-size: 12px;
  color: #80698d;
}
.home-invitation .btn {
  flex-shrink: 0;
}
.home-invitation .btn span {
  margin-left: 18px;
}
.home-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  padding-top: 40px;
  padding-bottom: 32px;
}
.footer-brand {
  font-size: 11px;
  font-weight: 700;
  color: #8c6c9f;
  letter-spacing: 1px;
  text-decoration: none;
}
.footer-brand span {
  margin-left: 10px;
  color: #c69dbd;
}
.home-footer > p {
  margin: 0;
  font-size: 10px;
  color: #8b7297;
}
.home-footer > a:last-child {
  font-size: 10px;
  color: #9b7ba8;
  text-decoration: none;
}
@media (max-width: 991px) {
  .home-hero {
    gap: 30px;
  }
  .hero-copy h1 {
    font-size: 45px;
  }
  .hero-showcase {
    padding: 25px 22px;
    min-height: 420px;
  }
  .hero-actions {
    gap: 15px;
  }
  .hero-assurance {
    gap: 10px;
  }
  .shopping-strip {
    padding: 24px;
  }
  .shopping-strip > div {
    gap: 10px;
  }
  .shopping-strip small {
    font-size: 9px;
  }
}
@media (max-width: 767px) {
  .home-hero {
    grid-template-columns: 1fr;
    padding-top: 32px;
    gap: 30px;
  }
  .hero-copy h1 {
    font-size: 46px;
  }
  .hero-copy > p {
    font-size: 13px;
  }
  .hero-showcase {
    border-top-left-radius: 80px;
  }
  .shopping-strip {
    margin: 0 12px;
    width: calc(100% - 24px);
    align-items: flex-start;
    padding: 22px;
    flex-direction: column;
    gap: 20px;
  }
  .strip-divider {
    display: none;
  }
  .shopping-strip small {
    font-size: 11px;
  }
  .home-collection {
    padding-top: 42px;
    padding-bottom: 36px;
  }
  .collection-heading {
    align-items: flex-start;
  }
  .collection-heading h2 {
    font-size: 23px;
  }
  .collection-heading > a {
    max-width: 65px;
    line-height: 1.8;
  }
  .collection-grid {
    grid-template-columns: 1fr;
    gap: 18px;
  }
  .collection-card {
    display: grid;
    grid-template-columns: 135px minmax(0, 1fr);
    align-items: center;
  }
  .collection-art {
    height: 185px;
  }
  .collection-art :deep(.product-visual-scene) {
    transform: scale(0.8);
  }
  .collection-info {
    padding: 16px;
  }
  .collection-info h3 {
    font-size: 16px;
  }
  .home-invitation {
    margin: 0 12px;
    width: calc(100% - 24px);
    padding: 26px;
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }
  .home-invitation h2 {
    font-size: 22px;
  }
  .home-footer {
    flex-wrap: wrap;
    padding-top: 28px;
  }
  .home-footer > p {
    order: 3;
    width: 100%;
  }
}
@media (prefers-reduced-motion: reduce) {
  .collection-card {
    transition: none;
  }
  .collection-card:hover {
    transform: none;
  }
}
</style>
