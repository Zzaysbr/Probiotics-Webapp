const fs = require("fs/promises");
const path = require("path");
const { constants } = require("fs");
const media = require("../utils/mediaPaths");
(async () => {
  for (const [source, destination, label] of [
    [media.legacySlips, media.slips, "slip"],
    [
      path.resolve(__dirname, "../uploads/products"),
      media.products,
      "pdimages",
    ],
  ]) {
    let copied = 0;
    const entries = await fs
      .readdir(source, { withFileTypes: true })
      .catch((error) => {
        if (error.code === "ENOENT") return [];
        throw error;
      });
    for (const entry of entries) {
      if (!entry.isFile() || entry.name.startsWith(".")) continue;
      if (label === "pdimages" && !/\.(png|jpe?g)$/i.test(entry.name)) continue;
      try {
        await fs.copyFile(
          path.join(source, entry.name),
          path.join(destination, entry.name),
          constants.COPYFILE_EXCL,
        );
        copied++;
      } catch (error) {
        if (error.code !== "EEXIST") throw error;
      }
    }
    console.log(
      `Copied ${copied} legacy files to image/${label}; originals preserved, existing destinations unchanged.`,
    );
  }
})().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
