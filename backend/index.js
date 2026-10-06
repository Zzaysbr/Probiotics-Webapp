const express = require("express");
const cors = require("cors");


const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');

const app = express();
const PORT = 3000;

const productRoutes = require("./routes/products");
const authRoutes = require("./routes/auth");

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Probiotic Shop API");
});

<<<<<<< HEAD
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
=======
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
>>>>>>> main

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});