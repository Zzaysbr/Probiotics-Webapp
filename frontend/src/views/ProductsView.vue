<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const products = ref([]);
const search = ref("");
const loading = ref(true);

const fetchProducts = async () => {
  const token = localStorage.getItem("token");

  // ไม่มี Token → ส่งไปหน้า Login
  if (!token) {
    router.push("/login");
    return;
  }

  loading.value = true;

  try {
    const url = search.value
      ? `http://localhost:3000/api/products?search=${encodeURIComponent(search.value)}`
      : "http://localhost:3000/api/products";

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    // Token หมดอายุ / Token ไม่ถูกต้อง
    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      alert("Session หมดอายุ กรุณาเข้าสู่ระบบใหม่");
      router.push("/login");
      return;
    }

    if (!response.ok) {
      throw new Error(`โหลดสินค้าไม่สำเร็จ (Status: ${response.status})`);
    }

    const data = await response.json();

    if (Array.isArray(data)) {
      products.value = data;
    } else if (Array.isArray(data.data)) {
      products.value = data.data;
    } else if (Array.isArray(data.products)) {
      products.value = data.products;
    } else {
      products.value = [];
    }
  } catch (error) {
    console.error("Fetch Products Error:", error);
  } finally {
    loading.value = false;
  }
};

const resetSearch = () => {
  search.value = "";
  fetchProducts();
};

const addToCart = (product) => {
  alert(`เพิ่ม "${product.product_name || product.name}" ลงในตะกร้าแล้ว`);
};

onMounted(() => {
  const token = localStorage.getItem("token");

  if (!token) {
    router.push("/login");
    return;
  }

  fetchProducts();
});
</script>