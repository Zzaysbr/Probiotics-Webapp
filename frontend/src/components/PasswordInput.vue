<script setup>
import { ref, watch } from "vue";
defineOptions({ inheritAttrs: false });
const props = defineProps({
  id: { type: String, required: true },
  modelValue: { type: String, default: "" },
  label: { type: String, default: "รหัสผ่าน" },
});
const emit = defineEmits(["update:modelValue"]);
const visible = ref(false);
watch(
  () => props.id,
  () => {
    visible.value = false;
  },
);
</script>

<template>
  <div class="password-field">
    <input
      v-bind="$attrs"
      :id="id"
      :value="modelValue"
      :type="visible ? 'text' : 'password'"
      class="form-control"
      @input="emit('update:modelValue', $event.target.value)"
    />
    <button
      type="button"
      class="password-toggle"
      :aria-label="(visible ? 'ซ่อน' : 'แสดง') + label"
      :aria-controls="id"
      :aria-pressed="visible"
      :title="(visible ? 'ซ่อน' : 'แสดง') + label"
      :disabled="$attrs.disabled"
      @click="visible = !visible"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
        <path v-if="visible" d="m3 3 18 18" class="eye-slash" />
      </svg>
      <span>{{ visible ? "ซ่อน" : "แสดง" }}</span>
    </button>
  </div>
</template>

<style scoped>
.password-field {
  position: relative;
  width: 100%;
}
.password-field input {
  padding-right: 104px;
}
.password-field input::-ms-reveal,
.password-field input::-ms-clear {
  display: none;
}
.password-toggle {
  position: absolute;
  right: 5px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  place-items: center;
  width: 92px;
  height: 44px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--shop-muted);
  cursor: pointer;
  font-size: 0.85rem;
}
.password-toggle:hover {
  background: #f2eafa;
  color: var(--shop-muted);
}
.password-toggle:focus-visible {
  outline: 2px solid #b68ad3;
  outline-offset: 1px;
}
.password-toggle:disabled {
  opacity: 0.45;
  cursor: default;
}
.password-toggle svg {
  width: 21px;
  height: 21px;
}
.eye-slash {
  paint-order: stroke;
  stroke-width: 2;
}
</style>
