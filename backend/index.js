const app = require("./app");
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)
  throw new Error("กรุณาตั้ง JWT_SECRET ให้ยาวอย่างน้อย 32 ตัวอักษร");
const server = app.listen(Number(process.env.PORT || 3000), (error) => {
  if (error) throw error;
  console.log(
    `Probiotic Shop API: http://localhost:${process.env.PORT || 3000}`,
  );
});
process.on("SIGTERM", () => server.close(() => process.exit(0)));
