<<<<<<< HEAD
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const eroRoutes = require('./routes/eroRoutes');

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));

// Modular API Routes
app.use('/api/auth', authRoutes);
app.use('/api', applicationRoutes);
app.use('/api/ero', eroRoutes);

const PORT = process.env.PORT || 5000;

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('Set JWT_SECRET to a random value of at least 32 characters in backend/.env.');
}

// Connect to MongoDB first, then start Express
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
});
=======
// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = 'ECI_SUPER_SECRET_KEY_2026';

// Helper to mask keys like 50xxxx85 in Audit Logs
function maskKey(key) {
  if (!key || key === 'N/A') return 'N/A';
  const str = String(key).trim();
  if (str.length <= 4) return str;
  return `${str.slice(0, 2)}xxxx${str.slice(-2)}`;
}

// --- MONGODB SCHEMAS ---
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['CITIZEN', 'BLO', 'ERO'], required: true },
  staffKey: { type: String, default: null }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const inviteKeySchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  role: { type: String, enum: ['BLO', 'ERO'], required: true },
  assignedToName: { type: String, default: 'Unassigned' },
  assignedToEmail: { type: String, default: null },
  isUsed: { type: Boolean, default: false }
}, { timestamps: true });

const InviteKey = mongoose.model('InviteKey', inviteKeySchema);

const applicationSchema = new mongoose.Schema({
  citizenId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  citizenName: { type: String, required: true },
  formType: { type: String, enum: ['FORM_6', 'FORM_7', 'FORM_8'], required: true },
  // Stores both summary fields and all detailed Form 6, 7, 8 sections
  formData: { type: mongoose.Schema.Types.Mixed, required: true },
  status: { type: String, enum: ['PENDING_BLO', 'BLO_APPROVED'], default: 'PENDING_BLO' },
  verifiedByBloName: { type: String, default: null },
  verifiedByBloKey: { type: String, default: null },
  verificationNote: { type: String, default: null },
  verifiedAt: { type: Date, default: null }
}, { timestamps: true });

const Application = mongoose.model('Application', applicationSchema);

const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  actorName: { type: String, required: true },
  actorRole: { type: String, enum: ['CITIZEN', 'BLO', 'ERO'], required: true },
  staffKey: { type: String, default: 'N/A' },
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', default: null },
  details: { type: String, required: true }
}, { timestamps: true });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

function generate16DigitKey() {
  let key = '';
  for (let i = 0; i < 16; i++) {
    key += Math.floor(Math.random() * 10);
  }
  return key;
}

// --- DB CONNECTION & 16-DIGIT ERO TERMINAL KEY ---
mongoose.connect('mongodb://127.0.0.1:27017/electionDB')
  .then(async () => {
    console.log('Connected to MongoDB (electionDB)');

    let eroKeyDoc = await InviteKey.findOne({ role: 'ERO' });
    if (!eroKeyDoc) {
      const new16DigitKey = generate16DigitKey();
      eroKeyDoc = await InviteKey.create({
        key: new16DigitKey,
        role: 'ERO',
        assignedToName: 'Master Console ERO Key'
      });
    }

    console.log('\n============================================================');
    console.log('ELECTION COMMISSION PORTAL - BACKEND RUNNING');
    console.log('16-DIGIT ERO CONSOLE KEY: ' + eroKeyDoc.key);
    console.log('(Use this 16-digit key in the Combined Staff Portal for ERO)');
    console.log('============================================================\n');
  })
  .catch(err => console.error('MongoDB Connection Error:', err));

// --- AUTH ROUTES (CITIZEN + COMBINED STAFF PORTAL) ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, portalType, staffKey } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email is already registered' });

    let assignedRole = 'CITIZEN';
    const trimmedKey = staffKey ? staffKey.trim() : '';

    // Combined Staff Registration (Auto-detects ERO or BLO from the 16-digit key)
    if (portalType === 'STAFF') {
      const keyDoc = await InviteKey.findOne({ key: trimmedKey });
      if (!keyDoc) {
        return res.status(400).json({
          error: 'Invalid 16-Digit Staff Key! Enter a valid ERO Console Key or ERO-generated BLO Key.'
        });
      }

      if (keyDoc.role === 'BLO' && keyDoc.isUsed && keyDoc.assignedToEmail !== email) {
        return res.status(400).json({ error: 'This BLO Key is already assigned to another BLO officer.' });
      }

      assignedRole = keyDoc.role; // 'ERO' or 'BLO'
      keyDoc.isUsed = true;
      keyDoc.assignedToName = name;
      keyDoc.assignedToEmail = email;
      await keyDoc.save();
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
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

    res.status(201).json({
      message: `${assignedRole} registered successfully! Please switch to Login.`
    });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed: ' + err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, portalType, staffKey } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ error: 'No account found with this email.' });

    if (portalType === 'CITIZEN' && user.role !== 'CITIZEN') {
      return res.status(400).json({ error: 'Please use the Staff Portal to log in as BLO or ERO.' });
    }

    if (portalType === 'STAFF' && user.role === 'CITIZEN') {
      return res.status(400).json({ error: 'Citizens cannot log in via the Staff Portal.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Incorrect password.' });

    if (portalType === 'STAFF') {
      const trimmedKey = staffKey ? staffKey.trim() : '';
      if (user.staffKey !== trimmedKey) {
        return res.status(400).json({ error: `Invalid 16-digit key for this ${user.role} account.` });
      }
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, staffKey: user.staffKey }
    });
  } catch (err) {
    res.status(500).json({ error: 'Login failed: ' + err.message });
  }
});

// --- CITIZEN ROUTES ---
app.post('/api/applications', async (req, res) => {
  try {
    const { citizenId, citizenName, formType, formData } = req.body;
    const newApp = await Application.create({
      citizenId,
      citizenName,
      formType,
      formData,
      status: 'PENDING_BLO'
    });

    await AuditLog.create({
      action: `${formType}_SUBMITTED`,
      actorName: citizenName,
      actorRole: 'CITIZEN',
      staffKey: 'N/A',
      applicationId: newApp._id,
      details: `Citizen ${citizenName} submitted ${formType} for ${formData.applicantName} (${formData.address})`
    });

    res.status(201).json(newApp);
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

app.get('/api/applications/citizen/:citizenId', async (req, res) => {
  const apps = await Application.find({ citizenId: req.params.citizenId }).sort({ createdAt: -1 });
  res.json(apps);
});

// --- BLO & SHARED ROUTES ---
app.get('/api/applications/all', async (req, res) => {
  const apps = await Application.find().sort({ createdAt: -1 });
  res.json(apps);
});

app.put('/api/applications/:id/approve', async (req, res) => {
  try {
    const { bloName, bloKey, verificationNote } = req.body;
    const updatedApp = await Application.findByIdAndUpdate(
      req.params.id,
      {
        status: 'BLO_APPROVED',
        verifiedByBloName: bloName,
        verifiedByBloKey: bloKey,
        verificationNote: verificationNote || 'House visited and documents verified manually.',
        verifiedAt: new Date()
      },
      { new: true }
    );

    await AuditLog.create({
      action: 'HOUSE_VISIT_VERIFIED',
      actorName: bloName,
      actorRole: 'BLO',
      staffKey: maskKey(bloKey),
      applicationId: updatedApp._id,
      details: `BLO ${bloName} (Key: ${maskKey(bloKey)}) visited house & approved ${updatedApp.formType} for ${updatedApp.formData.applicantName}`
    });

    res.json(updatedApp);
  } catch (err) {
    res.status(500).json({ error: 'Failed to approve application' });
  }
});

app.get('/api/audit-logs', async (req, res) => {
  const logs = await AuditLog.find().sort({ createdAt: -1 });
  res.json(logs);
});

// --- ERO ROUTES ---
app.post('/api/ero/generate-blo-key', async (req, res) => {
  try {
    const { eroName, eroKey } = req.body;
    const newBloKey = generate16DigitKey();
    const savedKey = await InviteKey.create({ key: newBloKey, role: 'BLO' });

    await AuditLog.create({
      action: 'GENERATED_BLO_KEY',
      actorName: eroName,
      actorRole: 'ERO',
      staffKey: maskKey(eroKey),
      details: `ERO ${eroName} generated new 16-digit BLO Key: ${maskKey(newBloKey)}`
    });

    res.json(savedKey);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate BLO key' });
  }
});

app.get('/api/ero/keys', async (req, res) => {
  const keys = await InviteKey.find({ role: 'BLO' }).sort({ createdAt: -1 });
  res.json(keys);
});

app.get('/api/ero/blo-work/:bloKey', async (req, res) => {
  try {
    const key = req.params.bloKey.trim();
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
});

app.listen(5000, () => console.log('Server running on http://localhost:5000'));
>>>>>>> 70108038339f07e1273cf82609242007d0340237
