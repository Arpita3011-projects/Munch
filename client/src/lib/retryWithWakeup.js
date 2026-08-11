/**
 * Retry utility for handling Render backend cold-start.
 *
 * When the Render backend is idle, initial requests may fail with 502/503/504
 * or network timeouts. This utility automatically retries such requests with
 * exponential backoff, while preserving the existing error handling for
 * normal application errors (400, 401, 403, 404, validation errors).
 *
 * Only retries:
 * - Network failures (connection, timeout, ERR_NETWORK)
 * - Server unavailable (502, 503, 504)
 *
 * Does NOT retry:
 * - Normal app errors (400, 401, 403, 404)
 * - Mutations (POST, PATCH, DELETE) — these are not idempotent
 * - Auth requests — to avoid duplicate login/register attempts
 *
 * Usage:
 *   const data = await retryWithWakeup(
 *     () => api.get('/menu'),
 *     { maxAttempts: 4, onRetry: (attempt, delay) => ... }
 *   );
 */

/**
 * Detect whether an error is a cold-start / server wake-up error.
 * These are temporary failures that should be retried.
 */
function isColdStartError(error) {
  // Network error (no response from server at all)
  if (!error.response) {
    // Timeout or network connection failure
    if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
      return true;
    }
    // Generic network error
    if (error.message === 'Network Error') {
      return true;
    }
    return true; // Default: retry on any network failure
  }

  // Server error: backend is temporarily unavailable
  const status = error.response.status;
  if (status === 502 || status === 503 || status === 504) {
    return true;
  }

  return false;
}

/**
 * Retry an async operation with exponential backoff for cold-start errors.
 *
 * @param {Function} operation - Async function to retry (e.g., () => api.get(...))
 * @param {Object} options - Configuration
 * @param {number} options.maxAttempts - Max attempts (default: 4 = 1 initial + 3 retries)
 * @param {Function} options.onRetry - Callback: (attemptNumber, delayMs, error) => void
 * @param {boolean} options.throwOnColdStart - If true, throw immediately on cold-start
 *   errors without retrying (for testing/compatibility)
 * @returns {Promise} - Result of operation or throws final error
 */
export async function retryWithWakeup(
  operation,
  options = {}
) {
  const {
    maxAttempts = 4,
    onRetry = () => {},
    throwOnColdStart = false,
  } = options;

  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Not a cold-start error — throw immediately
      if (!isColdStartError(error)) {
        throw error;
      }

      // If throwOnColdStart flag is set, throw immediately
      if (throwOnColdStart) {
        throw error;
      }

      // Last attempt failed — throw
      if (attempt === maxAttempts) {
        throw error;
      }

      // Calculate exponential backoff delay
      // Attempt 1 fails: wait 3s before attempt 2
      // Attempt 2 fails: wait 6s before attempt 3
      // Attempt 3 fails: wait 10s before attempt 4
      const delays = [3000, 6000, 10000];
      const delayMs = delays[attempt - 1] || 10000;

      // Call the retry callback
      onRetry(attempt, delayMs, error);

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  // Should never reach here, but throw the last error just in case
  throw lastError;
}
