const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const InviteKey = require('../models/InviteKey');
const AuditLog = require('../models/AuditLog');
const { maskKey } = require('../utils/keyHelper');

class AuthService {
  async registerUser({ name, email, password, portalType, staffKey }) {
    const existingUser = await User.findOne({ email });
    if (existingUser) throw new Error('Email is already registered.');

    let assignedRole = 'CITIZEN';
    const trimmedKey = staffKey ? staffKey.trim().toUpperCase() : '';

    if (portalType === 'STAFF') {
      if (!trimmedKey || trimmedKey.length !== 16) {
        throw new Error('Staff registration requires a 16-character alphanumeric key.');
      }

      const envEroKey = (process.env.ERO_MASTER_KEY || '').trim().toUpperCase();
      if (trimmedKey === envEroKey) {
        assignedRole = 'ERO';
        await InviteKey.findOneAndUpdate(
          { role: 'ERO' },
          { isUsed: true, assignedToName: name, assignedToEmail: email }
        );
      } else {
        const bloKeyDoc = await InviteKey.findOne({ key: trimmedKey, role: 'BLO' });
        if (!bloKeyDoc) {
          throw new Error('Invalid 16-Character Alphanumeric Staff Key!');
        }
        if (bloKeyDoc.isUsed && bloKeyDoc.assignedToEmail !== email) {
          throw new Error('This BLO Key is already assigned to another BLO officer.');
        }
        assignedRole = 'BLO';
        bloKeyDoc.isUsed = true;
        bloKeyDoc.assignedToName = name;
        bloKeyDoc.assignedToEmail = email;
        await bloKeyDoc.save();
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: assignedRole,
      staffKey: assignedRole === 'CITIZEN' ? null : trimmedKey
    });

    await AuditLog.create({
      action: `${assignedRole}_REGISTERED`,
      actorName: name,
      actorRole: assignedRole,
      staffKey: assignedRole === 'CITIZEN' ? 'N/A' : maskKey(trimmedKey),
      details: `${assignedRole} account registered (${email})`
    });

    return { role: assignedRole, user };
  }

  async loginUser({ email, password, portalType, staffKey }) {
    const user = await User.findOne({ email });
    if (!user) throw new Error('No account found with this email.');

    if (portalType === 'CITIZEN' && user.role !== 'CITIZEN') {
      throw new Error('Please use the Staff Portal to log in as BLO or ERO.');
    }
    if (portalType === 'STAFF' && user.role === 'CITIZEN') {
      throw new Error('Citizens cannot log in via the Staff Portal.');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Incorrect password.');

    if (portalType === 'STAFF') {
      const trimmedKey = staffKey ? staffKey.trim().toUpperCase() : '';
      const envEroKey = (process.env.ERO_MASTER_KEY || '').trim().toUpperCase();

      if (user.role === 'ERO') {
        if (trimmedKey !== envEroKey && trimmedKey !== user.staffKey) {
          throw new Error('Invalid 16-character ERO Key.');
        }
      } else if (user.role === 'BLO') {
        if (trimmedKey !== user.staffKey) {
          throw new Error('Invalid 16-character BLO Key for this account.');
        }
      }
    }

    const payload = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      staffKey: user.staffKey
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return { token, user: payload };
  }
}

module.exports = new AuthService();
