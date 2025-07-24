// backend/src/routes/authRoutes.js

const express = require('express');
const {
    registerUser, // authController.js'deki isimleriyle eşleşmeli
    loginUser,    // authController.js'deki isimleriyle eşleşmeli
    forgotPassword,
    resetPassword,
    verifyEmail   // Yeni eklenecek doğrulama fonksiyonu
} = require('../controllers/authController'); // authController'dan tüm fonksiyonları import et

const router = express.Router();

// POST isteği ile /api/auth/register adresine gelen isteği registerUser fonksiyonuna yönlendir
router.post('/register', registerUser);

// POST isteği ile /api/auth/login adresine gelen isteği loginUser fonksiyonuna yönlendir
router.post('/login', loginUser);

// POST isteği ile /api/auth/forgot-password adresine gelen isteği forgotPassword fonksiyonuna yönlendir
router.post('/forgot-password', forgotPassword);

// PUT isteği ile /api/auth/reset-password/:token adresine gelen isteği resetPassword fonksiyonuna yönlendir
router.put('/reset-password/:token', resetPassword);

// GET isteği ile /api/auth/verify-email/:token adresine gelen isteği verifyEmail fonksiyonuna yönlendir
router.get('/verify-email/:token', verifyEmail);

module.exports = router;
