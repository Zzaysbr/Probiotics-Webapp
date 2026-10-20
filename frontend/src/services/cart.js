import { ref, watch } from "vue";
import { authState } from "./auth";
export const cartItems = ref([]);
const key = () => `probiotic-cart-${authState.user?.id || "guest"}`;
function load() {
  try {
    const data = JSON.parse(localStorage.getItem(key()) || "[]");
    cartItems.value = Array.isArray(data)
      ? data.filter(
          (x) =>
            Number.isSafeInteger(x.product_id) &&
            Number.isInteger(x.quantity) &&
            x.quantity > 0 &&
            x.quantity <= 999,
        )
      : [];
  } catch {
    cartItems.value = [];
  }
}
watch(() => authState.user?.id, load, { immediate: true, flush: "sync" });
watch(
  cartItems,
  (items) => {
    try {
      localStorage.setItem(key(), JSON.stringify(items));
    } catch {
      /* Cart remains usable for this session. */
    }
  },
  { deep: true, flush: "sync" },
);
export function addToCart(product, quantity = 1) {
  const item = cartItems.value.find((x) => x.product_id === product.product_id);
  if ((item?.quantity || 0) + quantity > Math.min(product.stock_qty, 999))
    throw new Error("จำนวนเกินสต็อกที่มี");
  if (item) item.quantity += quantity;
  else
    cartItems.value.push({
      product_id: product.product_id,
      product_name: product.product_name,
      price: product.price,
      quantity,
      stock_qty: product.stock_qty,
    });
}
export function removeItem(id) {
  cartItems.value = cartItems.value.filter((x) => x.product_id !== id);
}
export function clearCart() {
  cartItems.value = [];
}
