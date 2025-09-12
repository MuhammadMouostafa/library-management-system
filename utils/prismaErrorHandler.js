function handlePrismaError(err, res, defaultMessage = "Database error") {
  // Unique constraint violation
  if (err.code === "P2002") {
    const targets = Array.isArray(err.meta?.target) ? err.meta.target : [err.meta?.target];
    const errors = targets.map(f => ({
      field: f,
      message: `This value already exists for field: ${f}`
    }));
    return res.status(400).json({ errors });
  }

  // Record not found
  if (err.code === "P2025") {
    const model = err.meta?.modelName || "Record";
    return res.status(404).json({
      errors: [{ field: model.toLowerCase(), message: `${model} not found` }]
    });
  }

  // Foreign key constraint failed
  if (err.code === "P2003") {
    const model = err.meta?.modelName || "Record";
    const constraint = Array.isArray(err.meta?.constraint)
      ? err.meta.constraint.join(", ")
      : err.meta?.constraint;

    let message;

    // Heuristic: if error happened in a delete operation, assume "still referenced"
    if (err.message.includes("delete")) {
      message = `Cannot delete ${model}. It is still referenced by other records (field: ${constraint}).`;
    } else {
      message = `Invalid reference: The related record for field '${constraint}' does not exist.`;
    }

    return res.status(400).json({
      errors: [
        {
          field: constraint || "relation",
          message
        }
      ]
    });
  }

  // Validation errors (e.g., unknown fields, wrong types)
if (err.name === "PrismaClientValidationError") {
  // 1. Handle unknown arguments
  let unknownMatches = [...err.message.matchAll(/Unknown argument `(\w+)`/g)];
  let unknownFields = unknownMatches.map(m => m[1]);

  if (unknownFields.length > 0) {
    return res.status(400).json({
      errors: unknownFields.map(f => ({
        field: f,
        message: `Invalid field: '${f}' is not allowed`
      }))
    });
  }

  // 2. Handle invalid values for arguments (type mismatch, bad data, etc.)
  let invalidArgMatch = err.message.match(/Argument `(\w+)`: (.+)/);
  if (invalidArgMatch) {
    const field = invalidArgMatch[1];
    const message = invalidArgMatch[2].trim();
    return res.status(400).json({
      errors: [{
        field,
        message: `Invalid value for '${field}': ${message}`
      }]
    });
  }

  // 3. Handle invalid values for model fields (Expected Date, etc.)
  let invalidValueMatch = err.message.match(/Invalid value for argument `(\w+)`.*Expected.*/);
  if (invalidValueMatch) {
    const field = invalidValueMatch[1];
    return res.status(400).json({
      errors: [{
        field,
        message: invalidValueMatch[0] // full Prisma message
      }]
    });
  }

  // 4. Fallback
  return res.status(400).json({
    errors: [{ field: "data", message: "Invalid data provided" }]
  });
}

  // Default fallback
  console.error("❌ Prisma error:", err);
  return res.status(500).json({
    errors: [{ field: "server", message: defaultMessage }]
  });
}

module.exports = { handlePrismaError };
