const express = require('express');
const { PrismaClient } = require('./generated/prisma');
const bookRoutes = require('./routes/bookRoutes');

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.use('/books', bookRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
