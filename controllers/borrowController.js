const { PrismaClient } = require('../generated/prisma');
const { handlePrismaError } = require("../utils/prismaErrorHandler");
const { exportData } = require("../utils/exporter");
const prisma = new PrismaClient();

// Borrow a book
const borrowBook = async (req, res) => {
  const { borrowerId, bookId, dueDate } = req.body;
  try {
     // Validate dueDate
    const parsedDueDate = new Date(dueDate);
    if (isNaN(parsedDueDate)) {
      return res.status(400).json({
        errors: [{ field: "dueDate", message: "Invalid due date format" }]
      });
    }

    if (parsedDueDate < new Date()) {
      return res.status(400).json({
        errors: [{ field: "dueDate", message: "Due date cannot be in the past" }]
      });
    }
    
    // check if book exists
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) {
      return res.status(404).json({
        errors: [{ field: "Book", message: "Book not found" }]
      });
    }
    // Count active borrows (returnDate is null)
    const activeBorrows = await prisma.borrow.count({
      where: { bookId: parseInt(bookId), returnDate: null }
    });

    const availableQuantity = book.quantity - activeBorrows;

    if (availableQuantity <= 0) {
      return res.status(400).json({
        errors: [{ field: "Book", message: "No available copies" }]
      });
    }

    // Create borrow record
    const borrow = await prisma.borrow.create({
      data: { borrowerId, bookId, dueDate: new Date(dueDate) }
    });

    res.status(201).json(borrow);
  } catch (err) {
    handlePrismaError(err, res, "Failed to Borrow Book");
  }
};

// Return a book
const returnBook = async (req, res) => {
  const { id } = req.params;
  const borrowId = parseInt(id);
  try {
    const borrow = await prisma.borrow.findUnique({ where: { id: borrowId } });
    if (!borrow){
      return res.status(404).json({
        errors: [{ field: "Borrow", message: "Borrow record not found" }]
      });
    }
      
    if (borrow.returnDate) {
      return res.status(400).json({
        errors: [{ field: "Borrow", message: "Book already returned" }]
      });
    }

    if (new Date() > borrow.dueDate) {
      console.warn(`⚠️ Book return is overdue for borrowId ${borrow.id}`);
    }

    // Update borrow record
    const updatedBorrow = await prisma.borrow.update({
      where: { id: borrowId },
      data: { returnDate: new Date() }
    });

    res.json(updatedBorrow);
  } catch (err) {
    handlePrismaError(err, res, "Failed to add book");
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
    handlePrismaError(err, res, "Failed to add book");
  }
};

// Get borrows with optional state filter
const getBorrows = async (req, res) => {
  const { state = "all", page = 1, limit = 10, startDate, endDate, lastMonth, format } = req.query;
  const now = new Date();
  const hasTimePart = (date) => date.includes("T") || /\d{2}:\d{2}/.test(date);

  try {
    let where = {};
    switch (state) {
      case "active":   where = { returnDate: null };                       break;
      case "overdue":  where = { returnDate: null, dueDate: { lt: now } }; break;
      case "returned": where = { returnDate: { not: null } };              break;
      case "all":      where = {};                                         break;
      default:
        return res.status(400).json({
          errors: [{ field: "state", message: "Invalid state. Use active, overdue, returned, or all" }]
        });
    }

    // Date range filter
    if (lastMonth === "true") {
      // Calculate first and last day of last month
      const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
      const lastDay = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

      where.borrowDate = { gte: firstDay, lte: lastDay };
    } else if (startDate || endDate) {
      where.borrowDate = {};

      if (startDate) {
        const parsedStart = new Date(startDate);
        if (isNaN(parsedStart)) {
          return res.status(400).json({
            errors: [{ field: "startDate", message: "Invalid startDate format" }]
          });
        }
        if (!hasTimePart(startDate)) parsedStart.setHours(0, 0, 0, 0);
        where.borrowDate.gte = parsedStart;
      }

      if (endDate) {
        const parsedEnd = new Date(endDate);
        if (isNaN(parsedEnd)) {
          return res.status(400).json({
            errors: [{ field: "endDate", message: "Invalid endDate format" }]
          });
        }
        if (!hasTimePart(endDate)) parsedEnd.setHours(23, 59, 59, 999);
        where.borrowDate.lte = parsedEnd;
      }
    }

    // Pagination setup
    const take = parseInt(limit);
    const skip = (parseInt(page) - 1) * take;

    // Query with pagination
    const [borrows, total] = await Promise.all([
      prisma.borrow.findMany({
        where,
        skip,
        take,
        orderBy: { borrowDate: "desc" },
        select: {
          id: true,
          borrowDate: true,
          dueDate: true,
          returnDate: true,
          book: { select: { id: true, title: true } },
          borrower: { select: { id: true, name: true } }
        }
      }),
      prisma.borrow.count({ where })
    ]);

    const formattedBorrows = borrows.map(({ book, borrower, ...rest }) => ({
      ...rest,
      bookId: book.id,
      bookTitle: book.title,
      borrowerId: borrower.id,
      borrowerName: borrower.name
    }));

    if (format === "csv" || format === "xlsx") {
      return exportData(res, borrows, format, "borrows");
    }

    res.json({
      totalBorrows: total,
      limitPerPage: take,
      totalPages: Math.ceil(total / take),
      pageNumber: parseInt(page),
      borrowsInPageCount: formattedBorrows.length,
      borrowsPage: formattedBorrows
    });
  } catch (err) {
    handlePrismaError(err, res, "Failed to fetch borrows");
  }
};

module.exports = {
  borrowBook,
  returnBook,
  getBorrowedBooks,
  getBorrows
};
