const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const InviteKey = require('../models/InviteKey');
const { generateAlphanumericKey } = require('../utils/keyHelper');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/electionDB';

    const conn = await mongoose.connect(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000
    });

    console.log(`Connected to MongoDB: ${conn.connection.host} (${conn.connection.name})`);

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB runtime error:', err.message);
    });

    // Ensure 16-character alphanumeric ERO_MASTER_KEY exists in .env
    let eroKey = process.env.ERO_MASTER_KEY ? process.env.ERO_MASTER_KEY.trim().toUpperCase() : '';
    const generatedEroKey = !eroKey;
    if (eroKey && !/^[A-Z0-9]{16}$/.test(eroKey)) {
      throw new Error('ERO_MASTER_KEY must be exactly 16 alphanumeric characters.');
    }
    if (!eroKey) {
      eroKey = generateAlphanumericKey(16);
      process.env.ERO_MASTER_KEY = eroKey;
      const envPath = path.join(__dirname, '..', '.env');
      const envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
      if (envContent.includes('ERO_MASTER_KEY=')) {
        fs.writeFileSync(envPath, envContent.replace(/ERO_MASTER_KEY=.*/g, `ERO_MASTER_KEY=${eroKey}`));
      } else {
        fs.appendFileSync(envPath, `\nERO_MASTER_KEY=${eroKey}\n`);
      }
    }

    // Sync the .env ERO_MASTER_KEY into MongoDB InviteKey collection
    let eroKeyDoc = await InviteKey.findOne({ role: 'ERO' });
    if (!eroKeyDoc) {
      eroKeyDoc = await InviteKey.create({
        key: eroKey,
        role: 'ERO',
        assignedToName: 'Master Console ERO Key (.env)'
      });
    } else if (eroKeyDoc.key !== eroKey) {
      eroKeyDoc.key = eroKey;
      await eroKeyDoc.save();
    }

    if (generatedEroKey) {
      console.log('\n============================================================');
      console.log('ELECTION COMMISSION PORTAL - MONGODB BACKEND RUNNING');
      console.log('New 16-character ERO registration key (shown once): ' + eroKey);
      console.log('============================================================\n');
    }
  } catch (err) {
    console.error('MongoDB Connection Failed:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
