const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

const productRoutes = require("./routes/products");
const authRoutes = require("./routes/auth");

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Probiotic Shop API");
});

app.use("/api/products", productRoutes);

app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});