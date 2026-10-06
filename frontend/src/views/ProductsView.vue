<script setup>
import { ref, onMounted } from "vue";

const products = ref([]);
const search = ref("");
const loading = ref(true);

const fetchProducts = async () => {
    loading.value = true;

    try {
        const url = search.value
            ? `http://localhost:3000/api/products?search=${encodeURIComponent(search.value)}`
            : "http://localhost:3000/api/products";

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("โหลดสินค้าไม่สำเร็จ");
        }

        products.value = await response.json();
    } catch (error) {
        console.error(error);
    } finally {
        loading.value = false;
    }
};

onMounted(fetchProducts);
</script>

<template>
    <div class="products-page">

        <h1>สินค้าโปรไบโอติก</h1>

        <div class="search-box">
            <input
                v-model="search"
                type="text"
                placeholder="ค้นหาสินค้า..."
                @keyup.enter="fetchProducts"
            />

            <button @click="fetchProducts">
                ค้นหา
            </button>
        </div>

        <p v-if="loading">
            กำลังโหลดสินค้า...
        </p>

        <p v-else-if="products.length === 0">
            ไม่พบสินค้า
        </p>

        <div v-else class="product-grid">

            <div
                v-for="product in products"
                :key="product.product_id"
                class="product-card"
            >

                <img
                    v-if="product.image_path"
                    :src="`http://localhost:3000/${product.image_path}`"
                    :alt="product.product_name"
                />

                <div class="product-info">

                    <p class="brand">
                        {{ product.brand_name }}
                    </p>

                    <h2>
                        {{ product.product_name }}
                    </h2>

                    <p>
                        {{ product.category_name }}
                    </p>

                    <p class="description">
                        {{ product.description }}
                    </p>

                    <h3>
                        ฿{{ Number(product.price).toLocaleString() }}
                    </h3>

                    <p>
                        เหลือ {{ product.stock_qty }} ชิ้น
                    </p>

                    <button
                        :disabled="product.stock_qty <= 0"
                    >
                        เลือกสินค้า
                    </button>

                </div>
            </div>

        </div>
    </div>
</template>

<style scoped>

.products-page {
    padding: 30px;
}

.search-box {
    display: flex;
    gap: 10px;
    margin-bottom: 30px;
}

.search-box input {
    width: 300px;
    padding: 10px;
}

.search-box button,
.product-card button {
    padding: 10px 18px;
    cursor: pointer;
}

.product-grid {
    display: grid;
    grid-template-columns: repeat(
        auto-fit,
        minmax(250px, 1fr)
    );
    gap: 25px;
}

.product-card {
    border: 1px solid #ddd;
    border-radius: 12px;
    overflow: hidden;
    background: white;
}

.product-card img {
    width: 100%;
    height: 200px;
    object-fit: cover;
}

.product-info {
    padding: 20px;
}

.brand {
    color: #777;
}

.description {
    min-height: 60px;
}

</style>
