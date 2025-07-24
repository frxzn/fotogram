// backend/src/routes/postRoutes.js

const express = require('express');
const postController = require('../controllers/postController'); // Henüz oluşturmadık, birazdan oluşturacağız
const authController = require('../controllers/authController'); // JWT doğrulaması için protect middleware'i buradan alacağız

const router = express.Router();

// Tüm gönderileri çekmek için (giriş yapmadan da görülebilir)
router.get('/', postController.getAllPosts); 

// Gönderi oluşturma - protect middleware ile korunacak
router.post('/', authController.protect, postController.createPost);

// Belirli bir gönderiyi getirme, güncelleme, silme (şimdilik bu kadar yeter)
router
    .route('/:id')
    .get(postController.getPost)
    .patch(authController.protect, postController.updatePost) // Sadece gönderinin sahibi güncelleyebilir
    .delete(authController.protect, postController.deletePost); // Sadece gönderinin sahibi silebilir

module.exports = router;
