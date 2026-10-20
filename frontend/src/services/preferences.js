import { ref } from "vue";

function stored(key, fallback) {
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}
export const theme = ref(
  stored(
    "shop-theme",
    window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light",
  ) === "dark"
    ? "dark"
    : "light",
);
export const largeText = ref(stored("shop-large-text", "false") === "true");
function apply() {
  document.documentElement.dataset.bsTheme = theme.value;
  document.documentElement.dataset.largeText = String(largeText.value);
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", theme.value === "dark" ? "#211a2b" : "#fff5fa");
  try {
    localStorage.setItem("shop-theme", theme.value);
    localStorage.setItem("shop-large-text", String(largeText.value));
  } catch {
    /* Preferences still work when storage is unavailable. */
  }
}
export function toggleTheme() {
  theme.value = theme.value === "light" ? "dark" : "light";
  apply();
}
export function toggleTextSize() {
  largeText.value = !largeText.value;
  apply();
}
apply();
