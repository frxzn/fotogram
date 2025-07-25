const Post = require('../models/Post');
const User = require('../models/User'); 
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Multer konfigürasyonu, hala burada kalsın ama middleware'i kullanmayacağız şimdilik
const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Error('Sadece resim dosyaları yüklenebilir!'), false); 
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fileSize: 10 * 1024 * 1024 } 
});
exports.uploadPostPhoto = (req, res, next) => {
  console.log('Multer middleware aktif değil (devre dışı bırakıldı).');
  next(); // Devre dışı olduğu için direkt next'e geçiyoruz
};


// --- Yeni Gönderi Oluşturma Fonksiyonu ---
exports.createPost = async (req, res, next) => {
  console.log('--- createPost fonksiyonu EN BAŞINDA ---'); // Fonksiyonun gerçekten buraya ulaşıp ulaşmadığını kontrol et
  
  // req objesini ve içindekileri detaylıca logla
  console.log('DEBUG: req.body:', req.body);
  console.log('DEBUG: req.file:', req.file); // Multer devre dışı olduğu için burası boş veya undefined olmalı
  console.log('DEBUG: req.user:', req.user); 
  
  if (!req.user || !req.user.id) {
    console.error('--- HATA: createPost: req.user veya req.user.id mevcut değil. ---');
    return res.status(401).json({ status: 'fail', message: 'Yetkilendirme hatası: Kullanıcı oturum açmamış veya JWT hatası var.' });
  }
  console.log('createPost: Kullanıcı ID mevcut:', req.user.id);

  // Bu kısım şimdilik sadece test için. Gönderi kaydetme işlemini bypass ediyoruz.
  try {
    const testPost = {
      user: req.user.id,
      caption: req.body.caption || 'Test Açıklaması',
      photo: null // Fotoğrafı devre dışı bıraktığımız için null
    };
    console.log('createPost: Test amaçlı gönderi objesi:', testPost);

    // Gerçek veritabanı kaydını şimdilik yapmıyoruz, sadece başarılı yanıt döndürüyoruz
    res.status(201).json({
      status: 'success',
      message: 'Gönderi (test amaçlı) başarıyla oluşturuldu!',
      data: {
        post: testPost // Test objesini döndür
      }
    });
    console.log('createPost: Fonksiyon TEST amaçlı tamamlandı, yanıt gönderildi.');

  } catch (err) {
    console.error('--- HATA: createPost: Genel yakalama bloğunda hata: ---', err);
    console.error('Hata Stack:', err.stack);
    res.status(500).json({ status: 'error', message: 'Sunucu tarafında bilinmeyen bir hata oluştu.' });
  }
};


// --- Diğer Fonksiyonlar (Aynı Kalsın) ---
exports.getAllPosts = async (req, res, next) => {
  console.log('--- getAllPosts fonksiyonu başladı ---');
  try {
    const posts = await Post.find().populate('user', 'username photo');
    console.log('getAllPosts: Tüm gönderiler başarıyla çekildi. Toplam:', posts.length);
    res.status(200).json({
      status: 'success',
      results: posts.length,
      data: {
        posts
      }
    });
  } catch (err) {
    console.error('--- HATA: getAllPosts: Gönderiler çekilirken hata: ---', err);
    console.error('Hata Stack:', err.stack);
    res.status(500).json({ status: 'error', message: 'Gönderiler çekilirken bir hata oluştu.' });
  }
};

exports.getPost = async (req, res, next) => {
  console.log('--- getPost fonksiyonu başladı ---');
  try {
    const post = await Post.findById(req.params.id).populate('user', 'username photo');
    if (!post) {
      console.log('getPost: Gönderi bulunamadı:', req.params.id);
      return res.status(404).json({ status: 'fail', message: 'Bu ID ile gönderi bulunamadı.' });
    }
    console.log('getPost: Gönderi başarıyla çekildi:', post._id);
    res.status(200).json({
      status: 'success',
      data: {
        post
      }
    });
  } catch (err) {
    console.error('--- HATA: getPost: Belirli bir gönderi çekilirken hata: ---', err);
    console.error('Hata Stack:', err.stack);
    res.status(500).json({ status: 'error', message: 'Gönderi çekilirken bir hata oluştu.' });
  }
};

exports.updatePost = async (req, res, next) => {
  console.log('--- updatePost fonksiyonu çağrıldı (Henüz içi dolu değil!) ---');
  res.status(501).json({ status: 'error', message: 'Bu fonksiyon henüz uygulanmadı!' });
};

exports.deletePost = async (req, res, next) => {
  console.log('--- deletePost fonksiyonu çağrıldı (Henüz içi dolu değil!) ---');
  res.status(501).json({ status: 'error', message: 'Bu fonksiyon henüz uygulanmadı!' });
};
