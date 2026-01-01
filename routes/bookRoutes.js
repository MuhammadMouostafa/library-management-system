const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');

// List all books
router.get('/', bookController.getAllBooks);

// Get books by category
router.get('/category/', bookController.getBooksByCategory);

// Add a new book
router.post('/', bookController.addBook);

// Update a book
router.put('/:id', bookController.updateBook);

// Delete a book
router.delete('/:id', bookController.deleteBook);

// Search books by title, author, or ISBN
router.get('/search', bookController.searchBooks);

module.exports = router;
