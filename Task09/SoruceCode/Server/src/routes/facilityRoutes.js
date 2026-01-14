const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validateRequest } = require('../middlewares/validate');
const { protect, adminOnly } = require('../middlewares/auth');
const facilityController = require('../controllers/facilityController');

// Validation rules
const facilityValidation = [
    body('name').trim().notEmpty().withMessage('Facility name is required'),
    body('category').isIn(['lab', 'hall', 'equipment', 'sports', 'meeting-room', 'auditorium', 'other'])
        .withMessage('Invalid category')
];

// Public routes
router.get('/', facilityController.getAllFacilities);
router.get('/:id', facilityController.getFacility);
router.get('/:id/availability', facilityController.getFacilityAvailability);

// Admin routes
router.get('/admin/list', protect, adminOnly, facilityController.getAdminFacilities);
router.get('/admin/stats', protect, adminOnly, facilityController.getFacilityStats);
router.post('/', protect, adminOnly, facilityValidation, validateRequest, facilityController.createFacility);
router.put('/:id', protect, adminOnly, facilityController.updateFacility);
router.delete('/:id', protect, adminOnly, facilityController.deleteFacility);

module.exports = router;
