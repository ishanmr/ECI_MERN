const jwt = require('jsonwebtoken');

module.exports = function auth(req, res, next) {
  const token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : null;
  if (!token) return res.status(401).json({ message: 'Please sign in to continue.' });
  try {
    const claims = jwt.verify(token, process.env.JWT_SECRET || 'local-development-secret');
    req.userId = claims.sub;
    req.role = claims.role;
    next();
  } catch {
    return res.status(401).json({ message: 'Your session has expired. Please sign in again.' });
  }
};
