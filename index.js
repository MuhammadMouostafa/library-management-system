const express = require('express');
const { PrismaClient } = require('./generated/prisma');
const bookRoutes = require('./routes/bookRoutes');
const borrowerRoutes = require('./routes/borrowerRoutes');
const borrowRoutes = require('./routes/borrowRoutes');

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.use('/books', bookRoutes);
app.use('/borrowers', borrowerRoutes);
app.use('/', borrowRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
