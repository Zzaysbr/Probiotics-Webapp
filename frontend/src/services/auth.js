import { reactive } from "vue";

const STORAGE_KEY = "probiotics-session";

function readSession() {
  try {
    // 1. อ่านจาก คีย์หลัก probiotics-session ก่อน
    const sessionData = localStorage.getItem(STORAGE_KEY);
    if (sessionData) {
      return JSON.parse(sessionData);
    }

    // 2. Fallback: ถ้าไม่มี ให้ลองอ่านจาก คีย์แยก (token, user)
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      return {
        token,
        user: JSON.parse(userData),
      };
    }
  } catch (error) {
    console.error("Error reading auth session:", error);
  }
  return null;
}

export const authState = reactive({
  session: readSession(),
  get user() {
    return this.session?.user || null;
  },
  get token() {
    return this.session?.token || null;
  },
});

export function saveSession(session) {
  authState.session = session;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));

  // บันทึกคีย์แยกไว้ด้วย เพื่อความ compatibility กับส่วนอื่น
  if (session?.token) localStorage.setItem("token", session.token);
  if (session?.user) localStorage.setItem("user", JSON.stringify(session.user));
}

export function clearSession() {
  authState.session = null;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

// 🟢 เช็คสิทธิ์ Admin ให้ยืดหยุ่นขึ้น (รองรับ role, is_admin, isAdmin)
export function isAdmin() {
  const user = authState.user;
  if (!user) return false;

  const role = String(user.role || "").toLowerCase();
  const isAdminFlag = user.is_admin === true || user.isAdmin === true || user.is_admin === 1;

  return role === "admin" || role === "administrator" || isAdminFlag;
}

// 🟢 เพิ่ม Helper Function สำหรับสร้าง Header ส่งไป Backend ชัวร์ๆ
export function getAuthHeaders() {
  const token = authState.token || localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}