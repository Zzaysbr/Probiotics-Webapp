const { HttpError } = require("./http");
module.exports = function pagination(query, defaultSize = 12) {
  const page = Number(query.page || 1),
    pageSize = Number(query.page_size || defaultSize);
  if (
    !Number.isSafeInteger(page) ||
    page < 1 ||
    page > 1000000 ||
    !Number.isSafeInteger(pageSize) ||
    pageSize < 1 ||
    pageSize > 100
  )
    throw new HttpError(
      400,
      "เลขหน้าและจำนวนต่อหน้าไม่ถูกต้อง (1–100 รายการต่อหน้า)",
    );
  return { page, pageSize, offset: (page - 1) * pageSize };
};
