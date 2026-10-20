import axios from "axios";
import { authState, clearSession } from "./auth";
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
  timeout: 20000,
});
api.interceptors.request.use((config) => {
  if (authState.token)
    config.headers.Authorization = `Bearer ${authState.token}`;
  return config;
});
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && authState.token) {
      clearSession();
      if (!["/login", "/register"].includes(window.location.pathname))
        window.location.assign("/login");
    }
    return Promise.reject(error);
  },
);
export const errorMessage = (e) =>
  e.response?.data?.message || "เชื่อมต่อระบบไม่สำเร็จ กรุณาลองใหม่";
export const money = (n) =>
  Number(n || 0).toLocaleString("th-TH", {
    style: "currency",
    currency: "THB",
  });
export const statusName = (s) =>
  ({
    awaiting_payment: "รอชำระเงิน",
    pending_review: "รอตรวจหลักฐาน",
    paid: "ชำระเงินแล้ว",
    cancelled: "ยกเลิก",
    expired: "หมดเวลาชำระ",
    shipped: "จัดส่งแล้ว",
    completed: "คำสั่งซื้อสำเร็จ",
    pending: "รอตรวจสอบ",
    approved: "อนุมัติ",
    rejected: "ไม่อนุมัติ",
  })[s] || s;
export async function download(url, name) {
  const { data } = await api.get(url, { responseType: "blob" });
  const object = URL.createObjectURL(data);
  const a = document.createElement("a");
  a.href = object;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(object), 60000);
}
export default api;
