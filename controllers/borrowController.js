const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

// Borrow a book
const borrowBook = async (req, res) => {
  const { borrowerId, bookId, dueDate } = req.body;
  try {
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) return res.status(404).json({ error: 'Book not found' });

    // Count active borrows (returnDate is null)
    const activeBorrows = await prisma.borrow.count({
      where: { bookId: parseInt(bookId), returnDate: null }
    });

    const availableQuantity = book.quantity - activeBorrows;

    if (availableQuantity <= 0) return res.status(400).json({ error: 'No available copies' });

    // Create borrow record
    const borrow = await prisma.borrow.create({
      data: { borrowerId, bookId, dueDate: new Date(dueDate) }
    });

    res.status(201).json(borrow);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to borrow book' });
  }
};

// Return a book
const returnBook = async (req, res) => {
  const { borrowId } = req.body;
  try {
    const borrow = await prisma.borrow.findUnique({ where: { id: borrowId } });
    if (!borrow) return res.status(404).json({ error: 'Borrow record not found' });
    if (borrow.returnDate) return res.status(400).json({ error: 'Book already returned' });

    // Update borrow record
    const updatedBorrow = await prisma.borrow.update({
      where: { id: borrowId },
      data: { returnDate: new Date() }
    });

    res.json(updatedBorrow);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to return book' });
  }
};

// List books currently borrowed by a borrower
const getBorrowedBooks = async (req, res) => {
  const { id } = req.params;
  try {
    const borrows = await prisma.borrow.findMany({
      where: { borrowerId: parseInt(id), returnDate: null },
      include: { book: true }
    });
    res.json(borrows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch borrowed books' });
  }
};

// List all overdue books
const getOverdueBooks = async (req, res) => {
  try {
    const now = new Date();
    const overdue = await prisma.borrow.findMany({
      where: { returnDate: null, dueDate: { lt: now } },
      include: { borrower: true, book: true }
    });
    res.json(overdue);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch overdue books' });
  }
};

module.exports = {
  borrowBook,
  returnBook,
  getBorrowedBooks,
  getOverdueBooks
};
