const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// List all categories
router.get('/', categoryController.getAllCategorys);

// Add a new category
router.post('/', categoryController.addCategory);

// Update a category
router.put('/:id', categoryController.updateCategory);

// Delete a category
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
