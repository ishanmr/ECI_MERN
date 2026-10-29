const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  type: { type: String, enum: ['SSR', 'SIR'], required: true },
  isActive: { type: Boolean, default: false },
  qualifyingDate: { type: Date }
}, { timestamps: true });

campaignSchema.index({ isActive: 1, type: 1 });
module.exports = mongoose.model('Campaign', campaignSchema);
