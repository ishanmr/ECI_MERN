const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

router.post('/applications', verifyToken, authorizeRoles('CITIZEN'), applicationController.createApplication);
router.get('/applications/citizen/:citizenId', verifyToken, authorizeRoles('CITIZEN'), applicationController.getCitizenApplications);
router.get('/applications/all', verifyToken, authorizeRoles('BLO', 'ERO'), applicationController.getAllApplications);
router.put('/applications/:id/approve', verifyToken, authorizeRoles('BLO'), applicationController.approveApplication);
router.get('/audit-logs', verifyToken, authorizeRoles('BLO', 'ERO'), applicationController.getAuditLogs);

module.exports = router;
