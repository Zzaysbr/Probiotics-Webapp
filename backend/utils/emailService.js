const nodemailer = require('nodemailer');

function createTransporter() {
  const port = Number(process.env.SMTP_PORT || 587);

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('ยังไม่ได้ตั้งค่า SMTP_HOST, SMTP_USER หรือ SMTP_PASS ในไฟล์ .env');
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendResetPasswordEmail(toEmail, resetToken, ttlMinutes = 15) {
  const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
  const resetUrl = `${clientUrl}/reset-password?token=${encodeURIComponent(resetToken)}&email=${encodeURIComponent(toEmail)}`;
  const transporter = createTransporter();

  const mailOptions = {
    from: `"Probiotic System" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: 'คำขอรีเซ็ตรหัสผ่าน (Reset Your Password)',
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937">
        <h2 style="color:#397452">คำขอรีเซ็ตรหัสผ่าน</h2>
        <p>คุณได้ทำการขอรีเซ็ตรหัสผ่านสำหรับระบบ Probiotic E-Commerce</p>
        <p>กรุณาคลิกปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่ ลิงก์มีอายุ ${ttlMinutes} นาที</p>
        <p>
          <a href="${resetUrl}" style="display:inline-block;padding:10px 16px;background:#397452;color:#fff;text-decoration:none;border-radius:6px">
            รีเซ็ตรหัสผ่าน
          </a>
        </p>
        <p>หากปุ่มใช้งานไม่ได้ สามารถคัดลอกลิงก์นี้ไปเปิดในเบราว์เซอร์:</p>
        <p style="word-break:break-all">${resetUrl}</p>
        <p>หากคุณไม่ได้เป็นผู้ส่งคำขอนี้ สามารถละเว้นอีเมลฉบับนี้ได้</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { sendResetPasswordEmail };
