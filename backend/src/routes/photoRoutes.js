const express = require('express');
const router = express.Router();
const photoController = require('../controllers/photoController');
const { protect } = require('../middleware/authMiddleware');

// Fotoğraf yükle
router.post('/', protect, photoController.uploadPhoto);

// Rastgele fotoğraf getir (puanlama için)
router.get('/random-for-rating', protect, photoController.getRandomPhotoForRating);

// Fotoğraf puanla
router.post('/:photoId/rate', protect, photoController.ratePhoto);

// Fotoğrafa yorum ekle
router.post('/:photoId/comment', protect, photoController.addComment);

// Fotoğrafın yorumlarını getir
router.get('/:photoId/comments', protect, photoController.getComments);

module.exports = router;
