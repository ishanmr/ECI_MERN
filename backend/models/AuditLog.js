const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  actorName: { type: String, required: true },
  actorRole: { type: String, enum: ['CITIZEN', 'BLO', 'ERO'], required: true },
  staffKey: { type: String, default: 'N/A', index: true },
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', default: null },
  details: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
