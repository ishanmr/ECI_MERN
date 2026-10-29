require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function main() {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD, MONGODB_URI } = process.env;
  if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 12) {
    throw new Error('Set ADMIN_NAME, ADMIN_EMAIL, and an ADMIN_PASSWORD with at least 12 characters in backend/.env.');
  }
  await mongoose.connect(MONGODB_URI || 'mongodb://127.0.0.1:27017/eciElectionPortal');
  const email = ADMIN_EMAIL.trim().toLowerCase();
  const user = await User.findOneAndUpdate(
    { email },
    { $set: { name: ADMIN_NAME.trim(), email, password: await bcrypt.hash(ADMIN_PASSWORD, 12), role: 'ADMIN' } },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  );
  console.log(`Administrator account ready: ${user.email}`);
  await mongoose.disconnect();
}
main().catch(async (error) => { console.error(error.message); await mongoose.disconnect().catch(() => {}); process.exitCode = 1; });
