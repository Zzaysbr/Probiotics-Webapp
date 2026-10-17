class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
const text = (value, label, max = 200, required = true) => {
  if (
    typeof value !== "string" ||
    (required && !value.trim()) ||
    value.trim().length > max
  )
    throw new HttpError(
      400,
      `กรุณาระบุ${label}ให้ถูกต้อง (ไม่เกิน ${max} ตัวอักษร)`,
    );
  return value.trim();
};
const id = (value) => {
  const n = Number(value);
  if (!Number.isSafeInteger(n) || n <= 0)
    throw new HttpError(400, "รหัสรายการไม่ถูกต้อง");
  return n;
};
const cents = (value) => {
  if (!/^(0|[1-9]\d{0,7})(\.\d{1,2})?$/.test(String(value)))
    throw new HttpError(
      400,
      "จำนวนเงินต้องไม่ติดลบและมีทศนิยมไม่เกิน 2 ตำแหน่ง",
    );
  return Math.round(Number(value) * 100);
};
module.exports = { HttpError, text, id, cents };
