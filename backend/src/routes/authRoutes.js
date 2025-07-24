// backend/src/routes/authRoutes.js

const express = require('express');
const {
    register, // Fonksiyon isimlerini authController'daki gibi eşleştir
    login,    // Fonksiyon isimlerini authController'daki gibi eşleştir
    forgotPassword,
    resetPassword, // Eğer resetPassword endpoint'ini kullanacaksan
    verifyEmail    // E-posta doğrulama için
} = require('../controllers/authController');

const router = express.Router();

// POST isteği ile /api/auth/register adresine gelen isteği register fonksiyonuna yönlendir
router.post('/register', register);

// POST isteği ile /api/auth/login adresine gelen isteği login fonksiyonuna yönlendir
router.post('/login', login);

// POST isteği ile /api/auth/forgot-password adresine gelen isteği forgotPassword fonksiyonuna yönlendir
router.post('/forgot-password', forgotPassword);

// PATCH isteği ile /api/auth/reset-password/:token adresine gelen isteği resetPassword fonksiyonuna yönlendir
// Eğer şifre sıfırlama işlemi token ile yapılıyorsa bu da gereklidir.
// Henüz resetPassword fonksiyonunu konuşmadık ama ilerde lazım olacak.
// router.patch('/reset-password/:token', resetPassword); 

// GET isteği ile /api/auth/verify-email/:token adresine gelen isteği verifyEmail fonksiyonuna yönlendir
router.get('/verify-email/:token', verifyEmail);

module.exports = router;
