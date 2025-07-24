// backend/src/routes/authRoutes.js

const express = require('express');
const authController = require('../controllers/authController'); // authController'ı içe aktar

const router = express.Router();

router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.get('/verify-email', authController.verifyEmail); // Doğrulama token'ı URL query'sinde geleceği için GET
router.post('/forgot-password', authController.forgotPassword);
router.put('/reset-password/:token', authController.resetPassword);

// KORUNAN ROTALAR: Giriş yapmış kullanıcılar için
// authController.protect middleware'ini kullanarak bu rotayı koruyoruz
router.patch('/update-password', authController.protect, authController.updatePassword);

module.exports = router;
