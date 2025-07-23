// backend/src/routes/authRoutes.js

const express = require('express');
// Controller'daki fonksiyonları doğru isimleriyle import et
const { registerUser, loginUser } = require('../controllers/authController');

const router = express.Router();

// POST isteği ile /api/auth/register adresine gelen isteği registerUser fonksiyonuna yönlendir
router.post('/register', registerUser);

// POST isteği ile /api/auth/login adresine gelen isteği loginUser fonksiyonuna yönlendir
router.post('/login', loginUser);

module.exports = router;
