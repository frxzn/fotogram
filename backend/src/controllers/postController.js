// backend/src/controllers/postController.js

const Post = require('../models/Post'); // Model dosyasının adı 'postModel' olmalı
const User = require('../models/User');   // User modelini içeri aktar (Model dosyasının adı 'userModel' olmalı)
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs'); // Dosya sistemi işlemleri için fs modülünü ekle

// --- 1. Multer Depolama Alanı ve Dosya Filtresi Tanımlaması ---
const multerStorage = multer.memoryStorage(); // Dosyayı bellekte tutar, Sharp işleyecek

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    // Hata durumunda, Express hata işleme middleware'ine iletilmek üzere bir hata döndür
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
      // Daha spesifik Multer hataları için yanıt döndür
      return res.status(400).json({ status: 'fail', message: `Dosya yükleme hatası: ${err.message}` });
    } else if (err) {
      // Diğer bilinmeyen hatalar
      console.error('--- HATA: Dosya yükleme sırasında bilinmeyen bir hata yakalandı: ---', err);
      return res.status(500).json({ status: 'error', message: `Beklenmeyen bir hata oluştu: ${err.message}` });
    }
    console.log('Multer middleware\'i tamamlandı. req.file kontrol edilecek.');
    next(); // Hata yoksa veya hata yakalanıp yanıt gönderildiyse devam et
  });
};


// --- Yeni Gönderi Oluşturma Fonksiyonu ---
exports.createPost = async (req, res, next) => {
  console.log('--- createPost fonksiyonu (kontrolcü) başladı ---');
  console.log('createPost içinde req.body:', req.body);
  console.log('createPost içinde req.file:', req.file); // Multer'dan sonra req.file'ı kontrol et

  // Kullanıcı ID kontrolü (Auth middleware'inden gelmeli)
  if (!req.user || !req.user.id) {
    console.error('--- HATA: createPost: req.user.id mevcut değil. ---');
    return res.status(401).json({ status: 'fail', message: 'Yetkilendirme hatası: Kullanıcı oturum açmamış.' });
  }
  console.log('createPost: Kullanıcı ID:', req.user.id);

  // --- Resim İşleme ve Kaydetme ---
  if (req.file) {
    console.log('createPost: Resim işleme süreci başlatılıyor.');
    try {
      // __dirname: Bu dosyanın (postController.js) bulunduğu dizin: backend/src/controllers
      // Hedef klasör: backend/public/img/posts
      // Bu yüzden 'controllers'dan '../' ile 'src'ye,
      // 'src'den '../' ile 'backend'e çıkarız,
      // sonra 'public/img/posts' yoluna gideriz.
      const uploadDir = path.join(__dirname, '../../../public/img/posts'); // <<< BURASI DÜZELTİLDİ!
      console.log(`createPost: Resim kaydedilecek hedef klasör: ${uploadDir}`); // Yeni log

      // Klasörün varlığını kontrol et ve yoksa oluştur
      if (!fs.existsSync(uploadDir)) {
        console.log(`createPost: Hedef klasör "${uploadDir}" mevcut değil, oluşturuluyor...`);
        // fs.mkdirSync yerine async versiyonu fs.promises.mkdir kullanmak daha iyi
        await fs.promises.mkdir(uploadDir, { recursive: true });
        console.log('createPost: Hedef klasör başarıyla oluşturuldu.');
      } else {
        console.log(`createPost: Hedef klasör "${uploadDir}" zaten mevcut.`);
      }

      // Dosya adını oluştur
      const filename = `post-${req.user.id}-${Date.now()}.jpeg`;
      const filepath = path.join(uploadDir, filename);

      console.log('createPost: Resim Sharp ile işleniyor:', req.file.originalname, '-> Hedef:', filepath);

      // Sharp ile resmi yeniden boyutlandır ve kaydet
      await sharp(req.file.buffer)
        .resize(500, 500, {
            fit: sharp.fit.inside, // Resmin boyutlarını aşmadan sığdır
            withoutEnlargement: true // Resim orijinal boyutundan büyükse büyütme
        })
        .toFormat('jpeg')
        .jpeg({ quality: 90 }) // JPEG kalitesi
        .toFile(filepath);

      console.log(`createPost: Resim başarıyla işlendi ve kaydedildi: ${filename}`);
      // Sadece dosya adını veritabanına kaydet (tam yolu değil)
      req.body.photo = filename;
    } catch (err) {
      console.error('--- HATA: createPost: Resim işleme veya kaydetme sırasında hata: ---', err);
      console.error('Hata Stack:', err.stack);
      // Resim işleme hatasında sunucu hatası döndür
      return res.status(500).json({ status: 'error', message: 'Sunucu tarafında resim işlenirken kritik bir hata oluştu.' });
    }
  } else {
    console.log('createPost: req.file bulunamadı. Gönderi fotoğrafsız oluşturuluyor.');
    req.body.photo = null; // Fotoğraf yoksa null olarak kaydet
  }

  // --- Gönderiyi Veritabanına Kaydetme ---
  try {
    console.log('createPost: Gönderi veritabanına kaydediliyor...');
    const newPost = await Post.create({
      user: req.user.id,
      caption: req.body.caption,
      photo: req.body.photo // Kaydedilen dosya adını veya null'ı kullan
    });
    console.log('createPost: Yeni gönderi başarıyla veritabanına kaydedildi:', newPost._id);

    // Başarılı yanıt
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

    // Mongoose doğrulama hatalarını daha anlaşılır hale getir
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(el => el.message);
      return res.status(400).json({ status: 'fail', message: `Veri doğrulama hatası: ${errors.join('. ')}` });
    }
    // Diğer veritabanı hataları
    return res.status(500).json({ status: 'error', message: 'Sunucu tarafında gönderi kaydedilirken kritik bir hata oluştu.' });
  }
};

// --- Diğer Post Fonksiyonları (Önceki Durumda Kaldı) ---

exports.getAllPosts = async (req, res, next) => {
  console.log('--- getAllPosts fonksiyonu başladı ---');
  try {
    // Populate ile gönderiyi yapan kullanıcı bilgilerini de çek (username ve photo)
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

// Bu fonksiyonlar şu an için uygulanmamış olarak kalabilir
exports.updatePost = async (req, res, next) => {
  console.log('--- updatePost fonksiyonu çağrıldı (Henüz içi dolu değil!) ---');
  res.status(501).json({ status: 'error', message: 'Bu fonksiyon henüz uygulanmadı!' });
};

exports.deletePost = async (req, res, next) => {
  console.log('--- deletePost fonksiyonu çağrıldı (Henüz içi dolu değil!) ---');
  res.status(501).json({ status: 'error', message: 'Bu fonksiyon henüz uygulanmadı!' });
};
