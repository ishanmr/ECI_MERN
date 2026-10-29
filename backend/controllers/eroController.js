const InviteKey = require('../models/InviteKey');
const User = require('../models/User');
const Application = require('../models/Application');
const AuditLog = require('../models/AuditLog');
const { generateAlphanumericKey, maskKey } = require('../utils/keyHelper');

exports.generateBloKey = async (req, res) => {
  try {
    const newBloKey = generateAlphanumericKey(16);
    const savedKey = await InviteKey.create({ key: newBloKey, role: 'BLO' });

    await AuditLog.create({
      action: 'GENERATED_BLO_KEY',
      actorName: req.user.name,
      actorRole: 'ERO',
      staffKey: maskKey(req.user.staffKey),
      details: `ERO ${req.user.name} generated new 16-char alphanumeric BLO Key: ${maskKey(newBloKey)}`
    });

    res.json(savedKey);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate BLO key' });
  }
};

exports.getBloKeys = async (req, res) => {
  try {
    const keys = await InviteKey.find({ role: 'BLO' }).sort({ createdAt: -1 });
    res.json(keys);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load BLO keys' });
  }
};

exports.inspectBloWork = async (req, res) => {
  try {
    const key = req.params.bloKey.trim().toUpperCase();
    const keyDoc = await InviteKey.findOne({ key, role: 'BLO' });
    const bloUser = await User.findOne({ staffKey: key, role: 'BLO' });
    const approvedApplications = await Application.find({ verifiedByBloKey: key }).sort({ verifiedAt: -1 });
    const auditActions = await AuditLog.find({ staffKey: { $in: [key, maskKey(key)] } }).sort({ createdAt: -1 });

    res.json({
      key,
      bloName: bloUser ? bloUser.name : (keyDoc ? keyDoc.assignedToName : 'Unassigned'),
      bloEmail: bloUser ? bloUser.email : 'Not registered yet',
      approvedApplications,
      auditActions
    });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching BLO work' });
  }
};
