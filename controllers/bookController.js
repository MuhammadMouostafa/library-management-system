const { PrismaClient } = require('../generated/prisma');
const { handlePrismaError } = require("../utils/prismaErrorHandler");
const { validateBookInput } = require("../validators/bookValidator");
const prisma = new PrismaClient();

// List all books
const getAllBooks = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const take = parseInt(limit);
    const skip = (parseInt(page) - 1) * take;

    // Fetch books with pagination
    const [books, total] = await Promise.all([
      prisma.book.findMany({
        skip,
        take,
        orderBy: { title: "asc" }
      }),
      prisma.book.count()
    ]);

    // Fetch active borrow counts for all books in one query
    const borrowCounts = await prisma.borrow.groupBy({
      by: ['bookId'],
      where: { returnDate: null },
      _count: { id: true }
    });

    // Create a map: bookId -> activeBorrows
    const borrowMap = {};
    borrowCounts.forEach(b => {
      borrowMap[b.bookId] = b._count.id;
    });

    // Map each book to include availableQuantity
    const booksWithAvailability = books.map(book => {
      const activeBorrows = borrowMap[book.id] || 0;
      return {
        ...book,
        activeBorrows,
        availableQuantity: book.quantity - activeBorrows
      };
    });

    res.json({
      totalBooks: total,
      limitPerPage: take,
      totalPages: Math.ceil(total / take),
      pageNumber: parseInt(page),
      booksInPageCount: booksWithAvailability.length,
      books: booksWithAvailability
    });
  } catch (err) {
    handlePrismaError(err, res, "Failed to fetch books");
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
  const { q, page = 1, limit = 10 } = req.query;

  if (!q || q.trim() === "") {
    return res.status(400).json({
      errors: [{ field: "Query", message: "Missing or empty search query (?q=...)" }]
    });
  }

  try {
    const take = parseInt(limit);
    const skip = (parseInt(page) - 1) * take;

    const where = {
      OR: [
        { title: { contains: q } },
        { author: { contains: q } },
        { isbn: { contains: q } },
      ],
    };

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        skip,
        take,
        orderBy: { title: "asc" }
      }),
      prisma.book.count({ where })
    ]);

    res.json({
      totalBooks: total,
      limitPerPage: take,
      totalPages: Math.ceil(total / take),
      pageNumber: parseInt(page),
      booksInPageCount: books.length,
      books
    });
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
