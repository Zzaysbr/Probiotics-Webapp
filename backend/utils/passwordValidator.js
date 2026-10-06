// ฟังก์ชันตรวจสอบความปลอดภัยของรหัสผ่านตาม
function validatePasswordPolicy(password) {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  if (password.length < minLength) {
    return { valid: false, message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร' };
  }
  if (!hasUpperCase) {
    return { valid: false, message: 'รหัสผ่านต้องมีตัวอักษรภาษาอังกฤษตัวใหญ่ (A-Z) อย่างน้อย 1 ตัว' };
  }
  if (!hasLowerCase) {
    return { valid: false, message: 'รหัสผ่านต้องมีตัวอักษรภาษาอังกฤษตัวเล็ก (a-z) อย่างน้อย 1 ตัว' };
  }
  if (!hasNumbers) {
    return { valid: false, message: 'รหัสผ่านต้องมีตัวเลข (0-9) อย่างน้อย 1 ตัว' };
  }
  if (!hasSpecialChar) {
    return { valid: false, message: 'รหัสผ่านต้องมีอักขระพิเศษ (!@#$%^&* ฯลฯ) อย่างน้อย 1 ตัว' };
  }

  return { valid: true };
}

module.exports = validatePasswordPolicy;