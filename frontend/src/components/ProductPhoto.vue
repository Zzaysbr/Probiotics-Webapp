<script setup>
import { ref, computed, watch } from "vue";
import ProductVisual from "./ProductVisual.vue";
import { productImageUrl } from "../services/productImages";
const props = defineProps({ product: { type: Object, required: true } });
const failed = ref(false),
  src = computed(() => productImageUrl(props.product.image_path));
watch(src, () => {
  failed.value = false;
});
</script>
<template>
  <img
    v-if="src && !failed"
    :src="src"
    :alt="product.product_name"
    loading="lazy"
    @error="failed = true"
  />
  <ProductVisual
    v-else
    :generic="true"
    :label="product.product_name"
    :package-size="product.package_size || ''"
  />
</template>
