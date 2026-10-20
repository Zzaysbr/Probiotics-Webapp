const app = require("./app");
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)
  throw new Error("กรุณาตั้ง JWT_SECRET ให้ยาวอย่างน้อย 32 ตัวอักษร");
const db = require("./db");
(async () => {
  await require("./scripts/migrate")(db);
  const lifecycle = require("./utils/orderLifecycle");
  await lifecycle.expireOrders();
  const timer = setInterval(
    () =>
      lifecycle
        .expireOrders()
        .catch((error) =>
          console.error("Order expiry failed:", error.code || error.message),
        ),
    60000,
  );
  timer.unref();
  const server = app.listen(Number(process.env.PORT || 3000), () =>
    console.log(
      `Probiotic Shop API: http://localhost:${process.env.PORT || 3000}`,
    ),
  );
  process.on("SIGTERM", () => {
    clearInterval(timer);
    server.close(() => db.end().then(() => process.exit(0)));
  });
})().catch((error) => {
  console.error("Startup failed:", error.message);
  process.exitCode = 1;
  db.end();
});
