const express = require('express');
const router = express.Router();
const organizationController = require('../controllers/organizationController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { handleUploadErrors } = require('../middleware/uploadMiddleware');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas CRUD para organizaciones
router.get('/', organizationController.getAllOrganizations);
router.get('/:id', organizationController.getOrganizationById);
router.post('/', handleUploadErrors, organizationController.createOrganization);
router.put('/:id', handleUploadErrors, organizationController.updateOrganization);
router.delete('/:id', organizationController.deleteOrganization);

module.exports = router; 