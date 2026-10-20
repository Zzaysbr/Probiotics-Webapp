const fs = require("fs");
const path = require("path");
// Test files are kept separate from the shop's private documents.
const root =
  process.env.NODE_ENV === "test"
    ? path.resolve(__dirname, "../tmp/media-test-" + process.pid)
    : path.resolve(__dirname, "../image");
const slips = path.join(root, "slip");
const receipts = path.join(root, "receipt");
const products = path.join(root, "pdimages");
const legacySlips = path.resolve(__dirname, "../storage/slips");
for (const directory of [slips, receipts, products])
  fs.mkdirSync(directory, { recursive: true });
function slipFile(filename) {
  const safe = path.basename(filename);
  const current = path.join(slips, safe);
  if (fs.existsSync(current)) return current;
  return path.join(legacySlips, safe);
}
module.exports = { root, slips, receipts, products, legacySlips, slipFile };
