const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

// List all borrowers, including borrowed books
const getAllBorrowers = async (req, res) => {
  try {
    const borrowers = await prisma.borrower.findMany();
    res.json(borrowers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch borrowers' });
  }
};

// Add a new borrower
const addBorrower = async (req, res) => {
  const { name, email } = req.body;
  try {
    const newBorrower = await prisma.borrower.create({
      data: { name, email }
    });
    res.status(201).json(newBorrower);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add borrower' });
  }
};

// Update a borrower
const updateBorrower = async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  try {
    const updatedBorrower = await prisma.borrower.update({
      where: { id: parseInt(id) },
      data: { name, email }
    });
    res.json(updatedBorrower);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update borrower' });
  }
};

// Delete a borrower
const deleteBorrower = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.borrower.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Borrower deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete borrower' });
  }
};

module.exports = {
  getAllBorrowers,
  addBorrower,
  updateBorrower,
  deleteBorrower
};
