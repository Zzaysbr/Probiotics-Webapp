<script setup>
import { computed } from "vue";
const props = defineProps({
  page: { type: Number, default: 1 },
  total: { type: Number, default: 0 },
  pageSize: { type: Number, default: 12 },
  busy: Boolean,
  label: { type: String, default: "เปลี่ยนหน้ารายการ" },
});
const emit = defineEmits(["change"]);
const pages = computed(() =>
  Math.max(1, Math.ceil(props.total / props.pageSize)),
);
</script>
<template>
  <nav
    v-if="total > pageSize || page > 1"
    class="d-flex flex-wrap align-items-center justify-content-center gap-3 my-4"
    :aria-label="label"
  >
    <button
      class="btn btn-outline-success"
      :disabled="busy || page <= 1"
      @click="emit('change', page - 1)"
    >
      ← หน้าก่อนหน้า
    </button>
    <span role="status"
      >หน้า {{ page }} / {{ pages }} · ทั้งหมด {{ total }} รายการ</span
    >
    <button
      class="btn btn-outline-success"
      :disabled="busy || page >= pages"
      @click="emit('change', page + 1)"
    >
      หน้าถัดไป →
    </button>
  </nav>
</template>
