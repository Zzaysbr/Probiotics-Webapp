require("dotenv").config({
  path: require("path").join(__dirname, "../.env"),
  quiet: true,
});
const mail = require("nodemailer");
(async () => {
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS
  )
    throw new Error("กรุณาตั้งค่า SMTP_HOST, SMTP_USER, SMTP_PASS");
  const port = Number(process.env.SMTP_PORT || 587);
  await mail
    .createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
    .verify();
  console.log("SMTP verification passed (no email sent).");
})().catch((e) => {
  console.error("SMTP verification failed:", e.code || e.message);
  process.exitCode = 1;
});
