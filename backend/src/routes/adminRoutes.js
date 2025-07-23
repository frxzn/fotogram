const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorizeAdmin } = require('../middleware/authMiddleware');

// Admin yetkisi gerektiren tüm rotalar için önce protect ve authorizeAdmin middleware'leri kullanılır.
router.get('/photos/pending', protect, authorizeAdmin, adminController.getPendingPhotos);
router.put('/photos/:photoId/approve', protect, authorizeAdmin, adminController.approvePhoto);
router.put('/photos/:photoId/reject', protect, authorizeAdmin, adminController.rejectPhoto);

router.get('/users', protect, authorizeAdmin, adminController.getUsers);
router.delete('/users/:userId', protect, authorizeAdmin, adminController.deleteUser);
router.put('/users/:userId/toggle-admin', protect, authorizeAdmin, adminController.toggleAdminStatus);

module.exports = router;
