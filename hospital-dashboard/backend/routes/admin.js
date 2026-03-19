const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const verifyAdmin = require('../middleware/auth');

// ── Public ──────────────────────────────────────────────────
router.post('/login', adminController.login);

// ── Protected (all routes below require admin JWT) ──────────
router.use(verifyAdmin);

router.get('/verify', adminController.verifyToken);

// bang_khoa
router.get('/khoa', adminController.getKhoa);
router.post('/khoa', adminController.createKhoa);
router.put('/khoa/:id', adminController.updateKhoa);
router.delete('/khoa/:id', adminController.deleteKhoa);

// bang_chi_so
router.get('/chi-so', adminController.getChiSo);
router.post('/chi-so', adminController.createChiSo);
router.put('/chi-so/:id', adminController.updateChiSo);
router.delete('/chi-so/:id', adminController.deleteChiSo);

// khoa_chi_so
router.get('/khoa-chi-so', adminController.getKhoaChiSo);
router.post('/khoa-chi-so', adminController.createKhoaChiSo);
router.delete('/khoa-chi-so/:id', adminController.deleteKhoaChiSo);

// bang_du_lieu_chi_so
router.get('/du-lieu', adminController.getDuLieu);
router.post('/du-lieu', adminController.createDuLieu);
router.put('/du-lieu/:id', adminController.updateDuLieu);
router.delete('/du-lieu/:id', adminController.deleteDuLieu);

module.exports = router;
