<script setup>
defineProps({ step: { type: Number, default: 1 } });
const steps = ["เลือกสินค้า", "ข้อมูลจัดส่ง", "ชำระเงิน", "ติดตามสถานะ"];
</script>
<template>
  <ol class="checkout-steps" aria-label="ขั้นตอนสั่งซื้อ">
    <li
      v-for="(label, index) in steps"
      :key="label"
      :class="{ current: step === index + 1, complete: step > index + 1 }"
      :aria-current="step === index + 1 ? 'step' : undefined"
    >
      <span class="step-number" aria-hidden="true">{{
        step > index + 1 ? "✓" : index + 1
      }}</span
      ><span>{{ label }}</span>
    </li>
  </ol>
</template>
<style scoped>
.checkout-steps {
  display: flex;
  list-style: none;
  padding: 20px 24px;
  margin: 0 0 28px;
  background: #fff;
  border: 1px solid #eee4f5;
  border-radius: 16px;
}
.checkout-steps li {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 12px;
  color: #b2a0bf;
  flex: 1;
  position: relative;
}
.checkout-steps li:not(:last-child)::after {
  content: "";
  height: 1px;
  flex: 1;
  margin: 0 18px;
  background: #eee5f5;
}
.step-number {
  width: 27px;
  height: 27px;
  border-radius: 50%;
  background: #f6f0fb;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  font-size: 11px;
}
.checkout-steps li.current {
  color: #8050b6;
  font-weight: 600;
}
.current .step-number {
  background: #8050b6;
  color: #fff;
  box-shadow: 0 0 0 4px #f2eafa;
}
.complete .step-number {
  background: #ede1f7;
  color: #9b6ac1;
}
@media (max-width: 575px) {
  .checkout-steps {
    padding: 18px 12px;
  }
  .checkout-steps li {
    flex-direction: column;
    gap: 8px;
    font-size: 9px;
    text-align: center;
  }
  .checkout-steps li:not(:last-child)::after {
    position: absolute;
    top: 14px;
    left: 67%;
    width: 66%;
    margin: 0;
  }
  .step-number {
    z-index: 1;
  }
}
</style>
