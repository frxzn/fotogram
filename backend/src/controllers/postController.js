const Post = require('../models/Post'); // Post modelini içeri aktar
const User = require('../models/User'); // User modelini içeri aktar (kullanıcıya post atama veya profil güncelleme için gerekli olabilir)
const multer = require('multer'); // Dosya yükleme için Multer
const sharp = require('sharp'); // Resim işleme için Sharp
const path = require('path'); // Dosya yolları ile çalışmak için
const fs = require('fs'); // Dosya sistemi işlemleri için

// --- 1. Multer Depolama Alanı ve Dosya Filtresi Tanımlaması ---
// Resimleri doğrudan bellekte tutar, böylece Sharp onları işleyebilir
const multerStorage = multer.memoryStorage();

// Sadece resim dosyalarına izin veren filtre
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    // Geçersiz dosya tipi hatası
    cb(new Error('Sadece resim dosyaları yüklenebilir!'), false);
  }
};

// --- 2. Multer Upload Middleware'i ---
// `photo` adındaki tek bir dosyayı işleyecek
const upload = multer({
  storage: multerStorage, // Bellekte saklama
  fileFilter: multerFilter, // Resim filtresi
  limits: { fileSize: 10 * 1024 * 1024 } // Maksimum 10MB dosya boyutu limiti
});

// Middleware: Gönderi fotoğrafını yüklemek için kullanılır
exports.uploadPostPhoto = upload.single('photo'); // 'photo' frontend'den gelen dosya form alanının adı olmalı

// --- 3. Yeni Gönderi Oluşturma Fonksiyonu ---
exports.createPost = async (req, res, next) => {
  console.log('--- createPost fonksiyonu başladı ---');
  console.log('Request Body:', req.body); // Frontend'den gelen diğer verileri (örneğin caption) gösterir
  console.log('Request File (req.file):', req.file); // Yüklenen dosya bilgisini gösterir

  // Kullanıcının oturum açıp açmadığını ve ID'sinin varlığını kontrol et
  if (!req.user || !req.user.id) {
    console.error('--- HATA: req.user.id mevcut değil. Kullanıcı oturum açmamış veya JWT hatası var. ---');
    return res.status(401).json({ status: 'fail', message: 'Yetkilendirme hatası: Kullanıcı oturum açmamış.' });
  }
  console.log('Mevcut Kullanıcı ID:', req.user.id);

  // --- Resim İşleme ve Kaydetme ---
  if (req.file) {
    console.log('Dosya işleme süreci başladı: Yüklenen dosya adı:', req.file.originalname);
    try {
      // Dosya için benzersiz bir ad oluştur
      req.file.filename = `post-${req.user.id}-${Date.now()}.jpeg`; // Örnek: post-60d5ec49c8f8b8a8d0f1b2c3-1678886400000.jpeg

      // Resimlerin kaydedileceği hedef klasörün yolu
      const uploadDir = path.join(__dirname, '../public/img/posts');
      const filepath = path.join(uploadDir, req.file.filename);

      // Hedef klasörün varlığını kontrol et, yoksa oluştur
      if (!fs.existsSync(uploadDir)) {
        console.log(`Hedef klasör "${uploadDir}" mevcut değil, oluşturuluyor...`);
        fs.mkdirSync(uploadDir, { recursive: true }); // Rekürsif olarak alt klasörleri de oluştur
        console.log('Hedef klasör başarıyla oluşturuldu.');
      } else {
        console.log(`Hedef klasör "${uploadDir}" zaten mevcut.`);
      }

      // Sharp ile resmi yeniden boyutlandır, formatını değiştir ve kaydet
      await sharp(req.file.buffer) // Bellekteki buffer'ı kullan
        .resize(500, 500) // Resmi 500x500 piksel boyutuna getir
        .toFormat('jpeg') // JPEG formatına dönüştür
        .jpeg({ quality: 90 }) // JPEG kalitesini ayarla
        .toFile(filepath); // Belirtilen yola kaydet

      console.log(`Resim başarıyla işlendi ve kaydedildi: ${req.file.filename}`);
      // İşlenen fotoğrafın adını req.body'ye ekle, veritabanına kaydedilirken kullanılacak
      req.body.photo = req.file.filename;
    } catch (err) {
      console.error('--- HATA: Resim işleme veya kaydetme sırasında beklenmedik bir hata oluştu: ---', err);
      // Hatanın türüne göre daha spesifik mesajlar
      if (err.message.includes('Input buffer contains unsupported image format') || err.message.includes('Input file is missing or of an unsupported image format')) {
          return res.status(400).json({ status: 'fail', message: 'Desteklenmeyen resim formatı veya bozuk dosya. Lütfen geçerli bir JPEG, PNG vb. dosya yükleyin.' });
      }
      // Diğer tüm sunucu hataları için genel mesaj
      return res.status(500).json({ status: 'error', message: 'Sunucu tarafında resim işlenirken kritik bir hata oluştu. Lütfen logları kontrol edin.' });
    }
  } else {
    console.log('req.file bulunamadı. Gönderi fotoğrafsız oluşturuluyor.');
    req.body.photo = null; // Fotoğraf yüklenmediyse 'photo' alanı null olsun
  }

  // --- Gönderiyi Veritabanına Kaydetme ---
  try {
    console.log('Gönderi veritabanına kaydediliyor...');
    const newPost = await Post.create({
      user: req.user.id, // Oturum açmış kullanıcının ID'si
      caption: req.body.caption, // Frontend'den gelen açıklama
      photo: req.body.photo // İşlenen fotoğrafın adı (veya null)
    });
    console.log('Yeni gönderi başarıyla veritabanına kaydedildi:', newPost._id);

    // Eğer User modelinde 'posts' adında bir dizi varsa, yeni gönderiyi kullanıcının post listesine ekle
    // Bu kısım User modelinin yapısına bağlıdır, eğer böyle bir alanın yoksa kaldırabilirsin.
    // try {
    //   await User.findByIdAndUpdate(req.user.id, { $push: { posts: newPost._id } });
    //   console.log('Kullanıcıya gönderi bağlantısı başarıyla eklendi.');
    // } catch (userUpdateErr) {
    //   console.error('--- HATA: Kullanıcı post listesini güncellerken hata: ---', userUpdateErr);
    //   // Bu hata kritik olmayabilir, gönderi zaten oluşturuldu
    // }


    res.status(201).json({
      status: 'success',
      message: 'Gönderi başarıyla oluşturuldu!',
      data: {
        post: newPost
      }
    });
    console.log('createPost fonksiyonu başarıyla tamamlandı, yanıt gönderildi.');
  } catch (err) {
    console.error('--- HATA: Gönderi veritabanına kaydedilirken kritik bir hata oluştu: ---', err);
    // Mongoose doğrulama (validation) hatalarını daha anlaşılır yap
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(el => el.message);
      return res.status(400).json({ status: 'fail', message: `Veri doğrulama hatası: ${errors.join('. ')}` });
    }
    // Diğer tüm sunucu hataları için genel mesaj
    return res.status(500).json({ status: 'error', message: 'Sunucu tarafında gönderi kaydedilirken kritik bir hata oluştu. Lütfen logları kontrol edin.' });
  }
};

// --- Diğer Post Fonksiyonları (Örnek) ---
// Eğer bu fonksiyonları da kullanıyorsan, yukarıdaki gibi console.log'lar ekleyerek hata ayıklayabilirsin.

exports.getAllPosts = async (req, res, next) => {
  console.log('--- getAllPosts fonksiyonu başladı ---');
  try {
    // Populate ile gönderiyle ilişkili kullanıcı bilgilerini de çek
    const posts = await Post.find().populate('user', 'username photo'); // 'user' alanını 'username' ve 'photo' ile doldur
    console.log('Tüm gönderiler başarıyla çekildi. Toplam:', posts.length);
    res.status(200).json({
      status: 'success',
      results: posts.length,
      data: {
        posts
      }
    });
  } catch (err) {
    console.error('--- HATA: Gönderiler çekilirken hata: ---', err);
    res.status(500).json({ status: 'error', message: 'Gönderiler çekilirken bir hata oluştu.' });
  }
};

exports.getPost = async (req, res, next) => {
  console.log('--- getPost fonksiyonu başladı ---');
  try {
    const post = await Post.findById(req.params.id).populate('user', 'username photo');
    if (!post) {
      console.log('Gönderi bulunamadı:', req.params.id);
      return res.status(404).json({ status: 'fail', message: 'Bu ID ile gönderi bulunamadı.' });
    }
    console.log('Gönderi başarıyla çekildi:', post._id);
    res.status(200).json({
      status: 'success',
      data: {
        post
      }
    });
  } catch (err) {
    console.error('--- HATA: Belirli bir gönderi çekilirken hata: ---', err);
    res.status(500).json({ status: 'error', message: 'Gönderi çekilirken bir hata oluştu.' });
  }
};
