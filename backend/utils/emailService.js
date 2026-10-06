const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendResetPasswordEmail(toEmail, resetToken) {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(toEmail)}`;

  const mailOptions = {
    from: `"Probiotic System" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: 'คำขอรีเซ็ตรหัสผ่าน (Reset Your Password)',
    html: `
      <h3>คำขอรีเซ็ตรหัสผ่าน</h3>
      <p>คุณได้ทำการขอรีเซ็ตรหัสผ่านสำหรับระบบ Probiotic E-Commerce</p>
      <p>กรุณาคลิกลิงก์ด้านล่างเพื่อทำการตั้งรหัสผ่านใหม่ (ลิงก์มีอายุ 15 นาที):</p>
      <a href="${resetUrl}" style="padding: 10px 15px; background-color: #0d6efd; color: white; text-decoration: none; border-radius: 5px;">รีเซ็ตรหัสผ่าน</a>
      <p>หากคุณไม่ได้เป็นผู้ส่งคำขอนี้ กรุณาข้ามอีเมลนี้ไป</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { sendResetPasswordEmail };