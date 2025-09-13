const express = require('express');
const { PrismaClient } = require('./generated/prisma');

const bookRoutes = require('./routes/bookRoutes');
const borrowerRoutes = require('./routes/borrowerRoutes');
const borrowRoutes = require('./routes/borrowRoutes');

const app = express();
const prisma = new PrismaClient();

// ---- Body Parser ---- //
app.use(express.json());

// ---- Routes ---- //
app.use("/api/v1/books", bookRoutes);
app.use("/api/v1/borrowers", borrowerRoutes);
app.use("/api/v1/", borrowRoutes);

// ---- Global Error Handler ---- //
app.use((err, req, res, next) => {
  console.error("❌ Unhandled Error:", err);
  res.status(500).json({ error: "Something went wrong" });
});

// ---- Graceful Shutdown ---- //
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
