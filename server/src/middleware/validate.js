/**
 * Express middleware factory that validates request body, params, or query against a Zod schema.
 * @param {object} schema - Zod schema to validate against
 * @param {'body'|'query'|'params'} [source='body'] - Which req property to validate
 * Attaches parsed (and transformed) values back to the same source on success.
 * Throws 400 with detailed field errors on failure.
 */
const validate = (schema, source = 'body') => {
  return (req, _res, next) => {
    const dataToValidate = req[source] || {};
    const result = schema.safeParse(dataToValidate);
    if (!result.success) {
      const errors = result.error.issues.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));

      const error = new Error('Validation failed');
      error.statusCode = 400;
      error.code = 'VALIDATION_ERROR';
      error.details = errors;
      return next(error);
    }

    // Replace source with parsed (transformed) values
    req[source] = result.data;
    next();
  };
};

/**
 * Express middleware factory that validates request query string against a Zod schema.
 * Attaches parsed (and transformed) query to req.query on success.
 * Throws 400 with detailed field errors on failure.
 */
const validateQuery = (schema) => {
  return (req, _res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const errors = result.error.issues.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));

      const error = new Error('Validation failed');
      error.statusCode = 400;
      error.code = 'VALIDATION_ERROR';
      error.details = errors;
      return next(error);
    }

    // Replace query with parsed (transformed) values
    req.query = result.data;
    next();
  };
};

module.exports = { validate, validateQuery };
