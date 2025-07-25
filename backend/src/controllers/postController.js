// backend/src/controllers/postController.js

const Post = require('../models/Post'); // Modellerin 'Post.js' ve 'User.js' olduğunu varsayıyorum
const User = require('../models/User');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// --- 1. Multer Depolama Alanı ve Dosya Filtresi Tanımlaması ---
const multerStorage = multer.memoryStorage(); // Dosyayı bellekte tutar, Sharp işleyecek

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
  limits: { fileSize: 10 * 1024 * 1024 } // Maksimum 10MB dosya boyutu
});

// Middleware: Gönderi fotoğrafını yüklemek için kullanılır
exports.uploadPostPhoto = (req, res, next) => {
  console.log('--- uploadPostPhoto (Multer) middleware\'i başladı ---');
  upload.single('photo')(req, res, err => { // 'photo' frontend'den gelen form alanının adı olmalı
    if (err instanceof multer.MulterError) {
      console.error('--- HATA: MulterError yakalandı: ---', err);
      return res.status(400).json({ status: 'fail', message: `Dosya yükleme hatası: ${err.message}` });
    } else if (err) {
      console.error('--- HATA: Dosya yükleme sırasında bilinmeyen bir hata yakalandı: ---', err);
      return res.status(500).json({ status: 'error', message: `Beklenmeyen bir hata oluştu: ${err.message}` });
    }
    console.log('Multer middleware\'i tamamlandı. req.file kontrol edilecek.');
    next();
  });
};


// --- Yeni Gönderi Oluşturma Fonksiyonu ---
exports.createPost = async (req, res, next) => {
  console.log('--- createPost fonksiyonu (kontrolcü) başladı ---');
  console.log('createPost içinde req.body:', req.body);
  console.log('createPost içinde req.file:', req.file);

  if (!req.user || !req.user.id) {
    console.error('--- HATA: createPost: req.user.id mevcut değil. ---');
    return res.status(401).json({ status: 'fail', message: 'Yetkilendirme hatası: Kullanıcı oturum açmamış.' });
  }
  console.log('createPost: Kullanıcı ID:', req.user.id);

  if (req.file) {
    console.log('createPost: Resim işleme süreci başlatılıyor.');
    try {
      // *** BURASI KESİN YOL OLARAK DÜZELTİLDİ! ***
      // Render üzerindeki mutlak yolunu kullanmayı deniyoruz.
      const uploadDir = '/opt/render/project/src/backend/public/img/posts';
      console.log(`createPost: Resim kaydedilecek hedef klasör (mutlak yol): ${uploadDir}`);

      const uploadDirExists = fs.existsSync(uploadDir);
      console.log(`createPost: Hedef klasör mevcut mu? ${uploadDirExists}`);

      if (!uploadDirExists) {
        console.log(`createPost: Hedef klasör "${uploadDir}" mevcut değil, oluşturuluyor...`);
        await fs.promises.mkdir(uploadDir, { recursive: true });
        console.log('createPost: Hedef klasör başarıyla oluşturuldu.');
      } else {
        console.log(`createPost: Hedef klasör "${uploadDir}" zaten mevcut.`);
      }

      const filename = `post-${req.user.id}-${Date.now()}.jpeg`;
      const filepath = path.join(uploadDir, filename);
      console.log(`createPost: Resim kaydedilecek tam yol: ${filepath}`);

      console.log('createPost: Sharp nesnesi oluşturuluyor ve işleniyor...');
      await sharp(req.file.buffer)
        .resize(500, 500, { fit: sharp.fit.inside, withoutEnlargement: true })
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(filepath);

      console.log(`createPost: Resim Sharp ile başarıyla işlendi ve kaydedildi: ${filename}`);

      // --- KRİTİK KONTROL: Dosyanın gerçekten var olup olmadığını kontrol et ---
      if (fs.existsSync(filepath)) {
          console.log(`createPost: Dosya "${filepath}" gerçekten diskte bulundu.`);
      } else {
          console.error(`--- KRİTİK HATA: createPost: Dosya "${filepath}" diskte bulunamadı! Bu bir yazma izni veya disk hatası olabilir. ---`);
          return res.status(500).json({ status: 'error', message: 'Resim dosyası sunucuda kaydedilemedi.' });
      }
      // --- KRİTİK KONTROL SONU ---

      req.body.photo = filename; // Sadece dosya adını veritabanına kaydet
    } catch (err) {
      console.error('--- HATA: createPost: Resim işleme veya kaydetme sırasında hata: ---', err);
      console.error('Hata Stack:', err.stack);
      return res.status(500).json({ status: 'error', message: 'Sunucu tarafında resim işlenirken kritik bir hata oluştu.' });
    }
  } else {
    console.log('createPost: req.file bulunamadı. Gönderi fotoğrafsız oluşturuluyor.');
    req.body.photo = null;
  }

  try {
    console.log('createPost: Gönderi veritabanına kaydedilmeden önce req.body.photo:', req.body.photo);
    console.log('createPost: Gönderi veritabanına kaydediliyor...');
    const newPost = await Post.create({
      user: req.user.id,
      caption: req.body.caption,
      photo: req.body.photo
    });
    console.log('createPost: Yeni gönderi başarıyla veritabanına kaydedildi:', newPost._id);

    res.status(201).json({
      status: 'success',
      message: 'Gönderi başarıyla oluşturuldu!',
      data: {
        post: newPost
      }
    });
    console.log('createPost: Fonksiyon başarıyla tamamlandı, yanıt gönderildi.');
  } catch (err) {
    console.error('--- HATA: createPost: Gönderi veritabanına kaydedilirken kritik bir hata oluştu: ---', err);
    console.error('Hata Stack:', err.stack);

    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(el => el.message);
      return res.status(400).json({ status: 'fail', message: `Veri doğrulama hatası: ${errors.join('. ')}` });
    }
    return res.status(500).json({ status: 'error', message: 'Sunucu tarafında gönderi kaydedilirken kritik bir hata oluştu.' });
  }
};

// --- Diğer Post Fonksiyonları (Aynı Kalsın) ---

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
