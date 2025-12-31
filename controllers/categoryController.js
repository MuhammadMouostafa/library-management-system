const { PrismaClient } = require('../generated/prisma');
const { handlePrismaError } = require("../utils/prismaErrorHandler");
const { validateCategoryInput } = require("../validators/categoryValidator");
const prisma = new PrismaClient();

// List all categories
const getAllCategorys = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        order: 'asc',
      },
    });
    res.json(categories);
  } catch (err) {
    handlePrismaError(err, res, "Failed to fetch categories");
  }
};

// Add a new category
const addCategory = async (req, res) => {
  const errors = validateCategoryInput(req.body);
  if (errors.length > 0) return res.status(400).json({ errors });
  try {
    const newCategory = await prisma.category.create({ data: req.body });
    res.status(201).json(newCategory);
  } catch (err) {
    handlePrismaError(err, res, "Failed to add category");
  }
};

// Update a category
const updateCategory = async (req, res) => {
  const errors = validateCategoryInput(req.body);
  if (errors.length > 0) return res.status(400).json({ errors });
  const { id } = req.params;
  const categoryId = parseInt(id);
  try {
    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: req.body,
    });
    res.json(updatedCategory);
  } catch (err) {
    handlePrismaError(err, res, "Failed to update category");
  }
};

// Delete a category
const deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.category.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    handlePrismaError(err, res, "Failed to delete category");
  }
};

module.exports = {
  getAllCategorys,
  addCategory,
  updateCategory,
  deleteCategory,
};
