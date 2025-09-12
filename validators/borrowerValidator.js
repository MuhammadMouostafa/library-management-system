function validateBorrowerInput(borrower) {
  const errors = [];

  const { name, email } = borrower;

  if (!name || !name.trim()) {
    errors.push({ field: "name", message: "Name is required" });
  }

  if (!email || !email.trim()) {
    errors.push({ field: "email", message: "Email is required" });
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push({ field: "email", message: "Invalid email format" });
    }
  }

  return errors;
}

module.exports = { validateBorrowerInput };