// backend/src/routes/authRoutes.js
const express = require('express');
// BURADA 'db.js' veya './config/db' İLE İLGİLİ HİÇBİR require SATIRI OLMAYACAK!
// SADECE authController'dan fonksiyonları import edeceğiz.
const { register, completeRegister, login, forgotPassword, resetPassword } = require('../controllers/authController');

const router = express.Router();

router.post('/register', register); // E-posta ile ilk kayıt isteği
router.post('/complete-register', completeRegister); // Kaydı tamamlama (kullanıcı adı ve şifre belirleme)
router.post('/login', login); // Giriş yapma
router.post('/forgot-password', forgotPassword); // Şifremi unuttum isteği
router.post('/reset-password', resetPassword); // Şifreyi sıfırlama

module.exports = router;
