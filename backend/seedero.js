// backend/seedEro.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

mongoose.connect('mongodb://127.0.0.1:27017/electionDB')
  .then(async () => {
    const hashedPassword = await bcrypt.hash('ero123', 10);
    
    await User.create({
      name: 'District ERO Officer',
      email: 'ero@eci.gov',
      password: hashedPassword,
      role: 'ERO' // This is the crucial part
    });

    console.log('ERO Account Created Successfully!');
    process.exit();
  });