/**
 * Express middleware factory that validates request body against a Zod schema.
 * Attaches parsed (and transformed) body to req.body on success.
 * Throws 400 with detailed field errors on failure.
 */
const validate = (schema) => {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));

      const error = new Error('Validation failed');
      error.statusCode = 400;
      error.code = 'VALIDATION_ERROR';
      error.details = errors;
      return next(error);
    }

    // Replace body with parsed (transformed) values
    req.body = result.data;
    next();
  };
};

module.exports = { validate };
