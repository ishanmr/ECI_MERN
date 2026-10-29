const authService = require('../services/authService');

exports.register = async (req, res) => {
  try {
    const { role } = await authService.registerUser(req.body);
    res.status(201).json({ message: `${role} registered successfully! Please switch to Login.` });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const data = await authService.loginUser(req.body);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
