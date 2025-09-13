const express = require('express');
const router = express.Router();
const borrowController = require('../controllers/borrowController');

// Borrow a book
router.post('/borrow', borrowController.borrowBook);

// Return a book
router.post('/return/:id', borrowController.returnBook);

// List books currently borrowed by a borrower
router.get('/borrower/:id/books', borrowController.getBorrowedBooks);

// List borrows with state filter
router.get("/", borrowController.getBorrows);

module.exports = router;
