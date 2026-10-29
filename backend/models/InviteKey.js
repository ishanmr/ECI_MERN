const mongoose = require('mongoose');

const inviteKeySchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, index: true },
  role: { type: String, enum: ['BLO', 'ERO'], required: true },
  assignedToName: { type: String, default: 'Unassigned' },
  assignedToEmail: { type: String, default: null },
  isUsed: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('InviteKey', inviteKeySchema);
