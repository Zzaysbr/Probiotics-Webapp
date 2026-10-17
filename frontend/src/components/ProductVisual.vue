<script setup>
defineProps({ variant: { type: Number, default: 1 } });
</script>
<template>
  <div
    class="product-visual-scene"
    :class="'variant-' + variant"
    aria-hidden="true"
  >
    <span class="visual-orbit orbit-one"></span
    ><span class="visual-orbit orbit-two"></span
    ><span class="visual-spark spark-one">✦</span
    ><span class="visual-spark spark-two">✧</span>
    <div class="visual-package">
      <div class="visual-cap"></div>
      <div class="visual-body">
        <div class="visual-label">
          <span class="visual-symbol">✦</span><strong>PROBIOTIC</strong
          ><span class="visual-line"></span
          ><small>{{
            variant === 2
              ? "POWDER PLUS"
              : variant === 3
                ? "CHEWABLE"
                : "DAILY BALANCE"
          }}</small
          ><span class="visual-dose">{{
            variant === 2 ? "15 SACHETS" : "30 CAPSULES"
          }}</span>
        </div>
      </div>
    </div>
    <span class="visual-capsule capsule-left"></span
    ><span class="visual-capsule capsule-right"></span>
  </div>
</template>
<style scoped>
.product-visual-scene {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 180px;
  display: grid;
  place-items: center;
  isolation: isolate;
}
.visual-package {
  position: relative;
  transform: rotate(-10deg);
  filter: drop-shadow(12px 18px 14px #5b2c6e22);
  z-index: 2;
}
.visual-cap {
  width: 78px;
  height: 25px;
  border-radius: 10px 10px 4px 4px;
  margin: auto;
  background: repeating-linear-gradient(90deg, #eee8f2 0 2px, #fff 2px 5px);
  border: 1px solid #fff;
  box-shadow: inset 0 -4px 5px #c7b4d526;
}
.visual-body {
  width: 108px;
  height: 128px;
  border-radius: 19px 19px 23px 23px;
  background: linear-gradient(100deg, #f8f4fb, #fff 40%, #e9e0ee);
  padding: 17px 10px;
  border: 1px solid #fff;
}
.visual-label {
  height: 94px;
  background: linear-gradient(135deg, #c7a1e5, #e6c4eb);
  color: #633d80;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 5px;
}
.visual-symbol {
  font-size: 20px;
  line-height: 1;
}
.visual-label strong {
  font-size: 10px;
  letter-spacing: 1px;
  font-weight: 700;
}
.visual-line {
  width: 28px;
  height: 1px;
  background: #a073b6;
}
.visual-label small {
  font-size: 6px;
  letter-spacing: 0.9px;
}
.visual-dose {
  font-size: 5px;
  margin-top: 4px;
  opacity: 0.65;
  letter-spacing: 1px;
}
.visual-orbit {
  position: absolute;
  width: 155px;
  height: 155px;
  border: 1px solid #ffffff88;
  border-radius: 50%;
  z-index: -1;
}
.orbit-two {
  width: 190px;
  height: 190px;
  border-color: #ffffff44;
}
.visual-capsule {
  position: absolute;
  width: 40px;
  height: 16px;
  border-radius: 30px;
  background: linear-gradient(90deg, #b590d3 50%, #fbf7fe 50%);
  box-shadow: 3px 5px 10px #8050b620;
  z-index: 3;
}
.capsule-left {
  left: 23%;
  top: 24%;
  transform: rotate(35deg);
}
.capsule-right {
  right: 20%;
  bottom: 20%;
  transform: rotate(-30deg);
  background: linear-gradient(90deg, #e4a0c4 50%, #fdf9ff 50%);
}
.visual-spark {
  position: absolute;
  color: #b587cd;
  font-size: 20px;
}
.spark-one {
  right: 23%;
  top: 20%;
}
.spark-two {
  left: 21%;
  bottom: 22%;
  font-size: 28px;
  color: #c992ba;
}
.variant-2 .visual-cap {
  display: none;
}
.variant-2 .visual-body {
  width: 100px;
  height: 143px;
  border-radius: 5px 5px 14px 14px;
  border-top: 8px solid #f6edf8;
  border-bottom: 7px solid #e5d4ec;
  padding: 15px 8px;
  background: linear-gradient(105deg, #fce9f4, #fff7fc, #e6cce0);
}
.variant-2 .visual-label {
  background: linear-gradient(135deg, #edc2da, #f6dbe9);
  color: #a05f87;
}
.variant-2 .visual-line {
  background: #c58daa;
}
.variant-3 .visual-body {
  height: 105px;
  width: 120px;
  border-radius: 12px 12px 25px 25px;
  padding: 10px;
}
.variant-3 .visual-cap {
  width: 104px;
  height: 26px;
  background: repeating-linear-gradient(90deg, #d3b7e6 0 2px, #dec6ed 2px 5px);
}
.variant-3 .visual-label {
  height: 78px;
  background: linear-gradient(140deg, #e0cff3, #eadff7);
}
.variant-3 .visual-dose {
  display: none;
}
</style>
