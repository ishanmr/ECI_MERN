const express = require('express');
const router = express.Router();
const eroController = require('../controllers/eroController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

router.post('/generate-blo-key', verifyToken, authorizeRoles('ERO'), eroController.generateBloKey);
router.get('/keys', verifyToken, authorizeRoles('ERO'), eroController.getBloKeys);
router.get('/blo-work/:bloKey', verifyToken, authorizeRoles('ERO'), eroController.inspectBloWork);

module.exports = router;
Part 2: Frontend Code (ECI-Project/frontend/)
