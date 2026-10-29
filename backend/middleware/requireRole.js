module.exports = (...roles) => (req, res, next) => {
  if (!roles.includes(req.role)) return res.status(403).json({ message: 'You do not have permission to perform this action.' });
  next();
};
