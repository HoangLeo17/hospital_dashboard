const express = require('express');
const router = express.Router();

const indicatorController = require('../controllers/indicatorController');
const dataController = require('../controllers/dataController');

// Departments
router.get('/departments', indicatorController.getDepartments);

// Indicators
router.get('/indicators', indicatorController.getIndicators);
router.put('/indicators/:id', indicatorController.updateIndicator);
router.get('/departments/:deptId/indicators', indicatorController.getIndicatorsByDepartment);
router.get('/indicators/:indicatorId/departments', indicatorController.getDepartmentsByIndicator);
// Vietnamese-aliased route for frontend compatibility
router.get('/chi-so/:chiSoId/khoa', indicatorController.getDepartmentsByIndicator);

// Data Entries
router.get('/indicator-data', dataController.getData);
router.post('/indicator-data', dataController.postData);

// Years
router.get('/years', dataController.getYears);

module.exports = router;
