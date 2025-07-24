// backend/src/routes/authRoutes.js - GÜNCEL VE SON VERSİYON

const express = require('express');
const {
    registerUser, 
    loginUser,    
    forgotPassword,
    resetPassword,
    verifyEmail   
} = require('../controllers/authController'); 

const router = express.Router();

// POST isteği ile /api/auth/register adresine gelen isteği registerUser fonksiyonuna yönlendir
router.post('/register', registerUser);

// POST isteği ile /api/auth/login adresine gelen isteği loginUser fonksiyonuna yönlendir
router.post('/login', loginUser);

// POST isteği ile /api/auth/forgot-password adresine gelen isteği forgotPassword fonksiyonuna yönlendir
router.post('/forgot-password', forgotPassword);

// PUT isteği ile /api/auth/reset-password/:token adresine gelen isteği resetPassword fonksiyonuna yönlendir
router.put('/reset-password/:token', resetPassword);

// GET isteği ile /api/auth/verify-email adresine gelen isteği verifyEmail fonksiyonuna yönlendir
// Token artık bir yol parametresi değil, sorgu parametresi olarak bekleniyor (örn: ?token=XYZ)
router.get('/verify-email', verifyEmail); 

module.exports = router;
