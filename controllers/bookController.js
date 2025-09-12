const { PrismaClient } = require('../generated/prisma');
const { handlePrismaError } = require("../utils/prismaErrorHandler");
const { validateBookInput } = require("../validators/bookValidator");
const prisma = new PrismaClient();

// List all books
const getAllBooks = async (req, res) => {
  try {
    const books = await prisma.book.findMany();
    res.json(books);
  } catch (err) {
    handlePrismaError(err, res, "Failed to fetch Books");
  }
};

// Add a new book
const addBook = async (req, res) => {
  const errors = validateBookInput(req.body);
  if (errors.length > 0) return res.status(400).json({ errors });
  try {
    const newBook = await prisma.book.create({ data: req.body });
    res.status(201).json(newBook);
  } catch (err) {
    handlePrismaError(err, res, "Failed to add book");
  }
};

// Update a book
const updateBook = async (req, res) => {
  const errors = validateBookInput(req.body);
  if (errors.length > 0) return res.status(400).json({ errors });
  const { id } = req.params;
  const bookId = parseInt(id);
  try {
    // Check for active borrows
    const activeBorrows = await prisma.borrow.count({
      where: { bookId: bookId, returnDate: null },
    });

    // Validate quantity
    if (req.body.quantity != null && req.body.quantity < activeBorrows) {
      return res.status(400).json({
        errors: [
          {
            field: "Quantity",
            message: `Quantity cannot be less than the number of active borrows (${activeBorrows})`
          }
        ]
      });
    }

    // Update book
    const updatedBook = await prisma.book.update({
      where: { id: bookId },
      data: req.body,
    });
    res.json(updatedBook);
  } catch (err) {
    handlePrismaError(err, res, "Failed to update book");
  }
};

// Delete a book
const deleteBook = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.book.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    handlePrismaError(err, res, "Failed to delete book");
  }
};

// Search books by title, author, or ISBN
const searchBooks = async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim() === "") {
     return res.status(400).json({
      errors: [{ field: "Query", message: "Missing or empty search query (?q=...)" }]
    });
  }
  try {
    const books = await prisma.book.findMany({
      where: {
        OR: [
          { title: { contains: q } },
          { author: { contains: q } },
          { isbn: { contains: q } },
        ],
      },
    });
    res.json(books);
  } catch (err) {
    handlePrismaError(err, res, "Failed to search books");
  }
};

module.exports = {
  getAllBooks,
  addBook,
  updateBook,
  deleteBook,
  searchBooks,
};
