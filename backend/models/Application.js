const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  citizenId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  citizenName: { type: String, required: true },
  formType: { type: String, enum: ['FORM_6', 'FORM_7', 'FORM_8'], required: true },
  formData: { type: mongoose.Schema.Types.Mixed, required: true },
  status: { type: String, enum: ['PENDING_BLO', 'BLO_APPROVED'], default: 'PENDING_BLO' },
  verifiedByBloName: { type: String, default: null },
  verifiedByBloKey: { type: String, default: null, index: true },
  verificationNote: { type: String, default: null },
  verifiedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);
