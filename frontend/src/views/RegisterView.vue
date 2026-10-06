<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const form = ref({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    full_name: "",
    phone: ""
});

const message = ref("");
const error = ref("");

const register = async () => {
    message.value = "";
    error.value = "";

    if (form.value.password !== form.value.confirmPassword) {
        error.value = "รหัสผ่านไม่ตรงกัน";
        return;
    }

    try {
        const response = await fetch(
            "http://localhost:3000/api/auth/register",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: form.value.username,
                    email: form.value.email,
                    password: form.value.password,
                    full_name: form.value.full_name,
                    phone: form.value.phone
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            error.value = data.message;
            return;
        }

        message.value = "สมัครสมาชิกสำเร็จ";

        setTimeout(() => {
            router.push("/");
        }, 1000);

    } catch (err) {
        console.error(err);
        error.value = "ไม่สามารถเชื่อมต่อ Server ได้";
    }
};
</script>

<template>
    <div class="register-page">

        <h1>สมัครสมาชิก</h1>

        <form @submit.prevent="register">

            <input
                v-model="form.username"
                placeholder="Username"
                required
            />

            <input
                v-model="form.email"
                type="email"
                placeholder="Email"
                required
            />

            <input
                v-model="form.full_name"
                placeholder="ชื่อ-นามสกุล"
                required
            />

            <input
                v-model="form.phone"
                placeholder="เบอร์โทรศัพท์"
            />

            <input
                v-model="form.password"
                type="password"
                placeholder="Password"
                required
            />

            <input
                v-model="form.confirmPassword"
                type="password"
                placeholder="ยืนยัน Password"
                required
            />

            <button type="submit">
                สมัครสมาชิก
            </button>

        </form>

        <p v-if="message" class="success">
            {{ message }}
        </p>

        <p v-if="error" class="error">
            {{ error }}
        </p>

    </div>
</template>

<style scoped>

.register-page {
    width: 400px;
    margin: 50px auto;
}

form {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

input {
    padding: 12px;
    font-size: 16px;
}

button {
    padding: 12px;
    font-size: 16px;
    cursor: pointer;
}

.success {
    color: green;
}

.error {
    color: red;
}

</style>