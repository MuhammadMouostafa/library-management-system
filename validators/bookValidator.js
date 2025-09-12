function validateBookInput(book) {
  const errors = [];

  const { title, author, isbn, quantity, shelfLocation } = book;

  if (!title || !title.trim()) {
    errors.push({ field: "title", message: "Title is required" });
  }

  if (!author || !author.trim()) {
    errors.push({ field: "author", message: "Author is required" });
  }

  if (!isbn || !isbn.trim()) {
    errors.push({ field: "isbn", message: "ISBN is required" });
  } else {
    const isbnRegex = /^(97(8|9))?\d{9}(\d|X)$/;
    if (!isbnRegex.test(isbn)) {
      errors.push({
        field: "isbn",
        message: "ISBN must be a valid ISBN-10 or ISBN-13",
      });
    }
  }

  if (!shelfLocation || !shelfLocation.trim()) {
    errors.push({ field: "shelfLocation", message: "Shelf location is required" });
  } else {
    const loc = shelfLocation.trim();
    if (!/^[A-Z]-\d+$/.test(loc)) {
      errors.push({
        field: "shelfLocation",
        message: "Shelf location must follow format like A-12 (capital letter, dash, number)",
      });
    }
  }

  const qty = quantity == null ? null : Number(quantity);
  if (qty == null) {
    errors.push({ field: "quantity", message: "Quantity is required" });
  } else if (Number.isNaN(qty)) {
    errors.push({ field: "quantity", message: "Quantity must be a number" });
  } else if (!Number.isInteger(qty)) {
    errors.push({ field: "quantity", message: "Quantity must be an integer" });
  } else if (qty < 0) {
    errors.push({ field: "quantity", message: "Quantity cannot be negative" });
  }

  return errors;
}

module.exports = { validateBookInput };