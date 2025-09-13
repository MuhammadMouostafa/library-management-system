const { PrismaClient } = require('../generated/prisma');
const { handlePrismaError } = require("../utils/prismaErrorHandler");
const { validateBorrowerInput } = require("../validators/borrowerValidator");
const prisma = new PrismaClient();

// List all borrowers
const getAllBorrowers = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const take = parseInt(limit);
    const skip = (parseInt(page) - 1) * take;

    // Fetch borrowers with pagination
    const [borrowers, total] = await Promise.all([
      prisma.borrower.findMany({
        skip,
        take,
        orderBy: { name: "asc" }
      }),
      prisma.borrower.count()
    ]);

    res.json({
      totalBorrowers: total,
      limitPerPage: take,
      totalPages: Math.ceil(total / take),
      pageNumber: parseInt(page),
      borrowersInPageCount: borrowers.length,
      borrowers
    });
  } catch (err) {
    handlePrismaError(err, res, "Failed to fetch borrowers");
  }
};

// Add a new borrower
const addBorrower = async (req, res) => {
  const errors = validateBorrowerInput(req.body);
  if (errors.length > 0)  return res.status(400).json({ errors });
  try {
    const newBorrower = await prisma.borrower.create({ data: req.body });
    res.status(201).json(newBorrower);
  } catch (err) {
    handlePrismaError(err, res, "Failed to add borrower");
  }
};

// Update a borrower
const updateBorrower = async (req, res) => {
  const errors = validateBorrowerInput(req.body);
  if (errors.length > 0)  return res.status(400).json({ errors });
  const { id } = req.params;
  try {
    const updatedBorrower = await prisma.borrower.update({
      where: { id: parseInt(id) },
      data: req.body
    });
    res.json(updatedBorrower);
  } catch (err) {
    handlePrismaError(err, res, "Failed to update borrower");
  }
};

// Delete a borrower
const deleteBorrower = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.borrower.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Borrower deleted successfully' });
  } catch (err) {
    handlePrismaError(err, res, "Failed to delete borrower");
  }
};

module.exports = {
  getAllBorrowers,
  addBorrower,
  updateBorrower,
  deleteBorrower
};
