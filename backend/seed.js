// Compatibility entry point: adds demo records without deleting existing users.
const db = require("./db");
require("./scripts/demoSeed")(db)
  .then(() => console.log("Demo data ready"))
  .catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  })
  .finally(() => db.end());
