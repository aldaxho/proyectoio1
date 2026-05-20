/**
 * Standardized success response.
 *
 * @param {import('express').Response} res
 * @param {object} data
 * @param {number} [status=200]
 */
export function sendSuccess(res, data, status = 200) {
  res.status(status).json({ success: true, ...data });
}

/**
 * Standardized error response.
 *
 * @param {import('express').Response} res
 * @param {number} status
 * @param {string} message
 */
export function sendError(res, status, message) {
  res.status(status).json({ success: false, error: message });
}
