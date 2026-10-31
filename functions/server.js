/**
 * Local development server — runs the Express app directly on port 4001.
 * Use this instead of the Firebase emulator for faster iteration.
 *
 * Usage: node server.js
 *
 * The frontend .env.local should point to:
 * NEXT_PUBLIC_API_BASE_URL=http://localhost:4001
 */

require("dotenv").config();
const app = require("./src/app");

const PORT = process.env.PORT || 4001;

app.listen(PORT, () => {
  console.log(`\n✅  UtensilKart API running at http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health\n`);
});
