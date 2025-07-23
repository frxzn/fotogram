const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/request-register', authController.requestRegister);
router.post('/complete-register', authController.completeRegister);
router.post('/login', authController.login);
router.post('/request-password-reset', authController.requestPasswordReset);
router.post('/reset-password', authController.resetPassword);

module.exports = router;
