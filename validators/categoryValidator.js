function validateCategoryInput(category) {
  const errors = [];

  const { name, order } = category;

  if (!name || !name.trim()) {
    errors.push({ field: "name", message: "Name is required" });
  }


  const category_order = order == null ? null : Number(order);
  if (category_order == null) {
    errors.push({ field: "order", message: "Order is required" });
  } else if (Number.isNaN(category_order)) {
    errors.push({ field: "order", message: "Order must be a number" });
  } else if (!Number.isInteger(category_order)) {
    errors.push({ field: "order", message: "Order must be an integer" });
  } else if (category_order < 0) {
    errors.push({ field: "order", message: "Order cannot be negative" });
  }

  return errors;
}

module.exports = { validateCategoryInput };