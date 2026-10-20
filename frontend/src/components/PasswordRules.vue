<script setup>
import { computed } from "vue";
const props = defineProps({
  id: { type: String, required: true },
  password: { type: String, default: "" },
});
const rules = computed(() => [
  { label: "มีความยาวอย่างน้อย 8 ตัวอักษร", met: props.password.length >= 8 },
  {
    label: "มีตัวอักษรภาษาอังกฤษตัวใหญ่ A–Z อย่างน้อย 1 ตัว",
    met: /[A-Z]/.test(props.password),
  },
  {
    label: "มีตัวอักษรภาษาอังกฤษตัวเล็ก a–z อย่างน้อย 1 ตัว",
    met: /[a-z]/.test(props.password),
  },
  { label: "มีตัวเลข 0–9 อย่างน้อย 1 ตัว", met: /[0-9]/.test(props.password) },
  {
    label: "มีอักขระพิเศษจากรายการด้านล่างอย่างน้อย 1 ตัว",
    met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(props.password),
  },
  {
    label:
      "ความยาวรวมไม่เกิน 72 ไบต์ (หากใช้เฉพาะภาษาอังกฤษ ตัวเลข และสัญลักษณ์ จะได้ไม่เกิน 72 ตัว)",
    met:
      new TextEncoder().encode(props.password).length <= 72 &&
      props.password.length > 0,
  },
]);
const special = `! @ # $ % ^ & * ( ) _ + - = [ ] { } ; ' : " \\ | , . < > / ?`;
</script>
<template>
  <section :id="id" class="password-rules" aria-label="เงื่อนไขรหัสผ่าน">
    <p class="fw-semibold mb-2">รหัสผ่านต้องผ่านเงื่อนไขทุกข้อ</p>
    <ul>
      <li
        v-for="rule in rules"
        :key="rule.label"
        :class="{ 'rule-met': rule.met }"
      >
        <span aria-hidden="true">{{ rule.met ? "✓" : "○" }}</span>
        {{ rule.label
        }}<span class="visually-hidden">{{
          rule.met ? " ผ่านแล้ว" : " ยังไม่ผ่าน"
        }}</span>
      </li>
    </ul>
    <p class="mb-1">อักขระพิเศษที่ใช้ผ่านเงื่อนไขได้:</p>
    <p class="password-symbols">{{ special }}</p>
    <p class="mb-0">
      เว้นวรรคอย่างเดียวไม่นับเป็นอักขระพิเศษ และตัวอักษรไทยใช้แทน A–Z หรือ a–z
      ไม่ได้
    </p>
  </section>
</template>
