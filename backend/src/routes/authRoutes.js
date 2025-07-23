// backend/src/routes/authRoutes.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware'); // Eğer varsa


router.post('/register', (req, res, next) => {
    console.log('Backend Log: /api/auth/register rotasına istek geldi.'); // Yeni log
    authController.register(req, res, next);
});

// ... diğer rotalar

router.post('/login', (req, res, next) => {
    console.log('Backend Log: /api/auth/login rotasına istek geldi.'); // Yeni log
    authController.login(req, res, next);
});


// Eğer varsa, örnek protect middleware kullanımı
// router.get('/me', protect, authController.getMe);

module.exports = router;
