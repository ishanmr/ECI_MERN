const Application = require('../models/Application');
const AuditLog = require('../models/AuditLog');
const { maskKey } = require('../utils/keyHelper');

exports.createApplication = async (req, res) => {
  try {
    const { formType, formData } = req.body;
    const newApp = await Application.create({
      citizenId: req.user.id,
      citizenName: req.user.name,
      formType,
      formData,
      status: 'PENDING_BLO'
    });

    await AuditLog.create({
      action: `${formType}_SUBMITTED`,
      actorName: req.user.name,
      actorRole: 'CITIZEN',
      staffKey: 'N/A',
      applicationId: newApp._id,
      details: `Citizen ${req.user.name} submitted ${formType} for ${formData.applicantName} (${formData.address})`
    });

    res.status(201).json(newApp);
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit application: ' + err.message });
  }
};

exports.getCitizenApplications = async (req, res) => {
  try {
    const apps = await Application.find({ citizenId: req.user.id }).sort({ createdAt: -1 });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch citizen applications' });
  }
};

exports.getAllApplications = async (req, res) => {
  try {
    const apps = await Application.find().sort({ createdAt: -1 });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
};

exports.approveApplication = async (req, res) => {
  try {
    const { verificationNote } = req.body;
    const bloName = req.user.name;
    const bloKey = req.user.staffKey;

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
};

exports.getAuditLogs = async (req, res) => {
  try {
    const filter = req.user.role === 'BLO' ? { actorRole: { $ne: 'ERO' } } : {};
    const logs = await AuditLog.find(filter).sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
};
