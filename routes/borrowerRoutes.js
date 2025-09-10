const express = require('express');
const router = express.Router();
const borrowerController = require('../controllers/borrowerController');

// List all borrowers
router.get('/', borrowerController.getAllBorrowers);

// Add a new borrower
router.post('/', borrowerController.addBorrower);

// Update a borrower
router.put('/:id', borrowerController.updateBorrower);

// Delete a borrower
router.delete('/:id', borrowerController.deleteBorrower);

module.exports = router;
