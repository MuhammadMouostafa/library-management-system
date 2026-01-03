const express = require('express');
const router = express.Router();
const borrowController = require('../controllers/borrowController');

// Borrow a book
router.post('/', borrowController.borrowBook);

// Return a book
router.put('/return/:id', borrowController.returnBook);

// List books currently borrowed by a borrower
router.get('/borrower/:id', borrowController.getBorrowedBooks);

// List borrows with state filter
router.get("/", borrowController.getBorrows);

module.exports = router;
