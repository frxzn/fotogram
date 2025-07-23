const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:userId', protect, userController.getUserProfile);
router.put('/profile', protect, userController.updateUserProfile);
router.get('/search', protect, userController.searchUsers);
router.get('/:userId/photos', protect, userController.getUserPhotos);

// DM ve Bildirim rotaları (henüz implemente edilmedi)
router.get('/me/messages', protect, userController.getMessages);
router.get('/me/notifications', protect, userController.getNotifications);

module.exports = router;
