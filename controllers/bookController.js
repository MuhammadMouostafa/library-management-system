const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

// List all books
const getAllBooks = async (req, res) => {
  try {
    // Fetch all books
    const books = await prisma.book.findMany();

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

    res.json(booksWithAvailability);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
};

// Add a new book
const addBook = async (req, res) => {
  const { title, author, isbn, quantity, shelfLocation } = req.body;
  try {
    const newBook = await prisma.book.create({
      data: { title, author, isbn, quantity, shelfLocation },
    });
    res.status(201).json(newBook);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add book' });
  }
};

// Update a book
const updateBook = async (req, res) => {
  const { id } = req.params;
  const { title, author, isbn, quantity, shelfLocation } = req.body;
  try {
    const updatedBook = await prisma.book.update({
      where: { id: parseInt(id) },
      data: { title, author, isbn, quantity, shelfLocation },
    });
    res.json(updatedBook);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update book' });
  }
};

// Delete a book
const deleteBook = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.book.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete book' });
  }
};

// Search books by title, author, or ISBN
const searchBooks = async (req, res) => {
  const { q } = req.query; // search query
  try {
    const books = await prisma.book.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { author: { contains: q, mode: 'insensitive' } },
          { isbn: { contains: q, mode: 'insensitive' } },
        ],
      },
    });
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: 'Failed to search books' });
  }
};

module.exports = {
  getAllBooks,
  addBook,
  updateBook,
  deleteBook,
  searchBooks,
};
