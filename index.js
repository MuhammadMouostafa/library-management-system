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
app.use('/books', bookRoutes);
app.use('/borrowers', borrowerRoutes);
app.use('/', borrowRoutes);

// ---- Global Error Handler ---- //
app.use((err, req, res, next) => {
  console.error("❌ Unhandled Error:", err);
  res.status(500).json({ error: "Something went wrong" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
