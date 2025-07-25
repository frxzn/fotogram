// backend/src/routes/postRoutes.js

const express = require('express');
const postController = require('../controllers/postController');
const authController = require('../controllers/authController');

const router = express.Router();

// Tüm gönderileri çekmek için (giriş yapmadan da görülebilir)
router.get('/', postController.getAllPosts); 

// Gönderi oluşturma - protect middleware ile korunacak (fotoğraf yükleme de burada olacak)
router.post(
    '/', 
    authController.protect, 
    postController.uploadPostPhoto, // Eğer fotoğraf yüklemeyi kullanıyorsan bu satır olmalı
    postController.createPost
);

// Belirli bir gönderiyi getirme
router.get('/:id', postController.getPost); 


// Şimdilik .patch ve .delete satırlarını yorum satırı yapıyoruz veya siliyoruz
// router
//     .route('/:id')
//     .patch(authController.protect, postController.updatePost) 
//     .delete(authController.protect, postController.deletePost); 

module.exports = router;
