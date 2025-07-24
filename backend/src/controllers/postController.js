// backend/src/controllers/postController.js

const Post = require('../models/Post');
const User = require('../models/User'); // Kullanıcı bilgilerini çekmek için gerekebilir
const multer = require('multer'); // Fotoğraf yükleme için
const sharp = require('sharp'); // Görsel boyutlandırma ve optimizasyon için (isteğe bağlı ama önerilir)

// Multer Storage Ayarları
// Şimdilik diske kaydediyoruz. Daha sonra bulut depolama (Cloudinary, S3 vb.) kullanılabilir.
const multerStorage = multer.memoryStorage(); // Dosyayı bellekte tut, sonra işleyelim

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new Error('Yalnızca görsel dosyaları yüklenebilir!'), false); // Hata mesajı verebiliriz
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Tek fotoğraf yükleme middleware'i
exports.uploadPostPhoto = upload.single('photo'); // 'photo' frontend'den gelecek alanın adı olmalı

// Fotoğrafı boyutlandırma ve kaydetme (middleware)
exports.resizePostPhoto = async (req, res, next) => {
    if (!req.file) return next(); // Eğer dosya yoksa bir sonraki middleware'e geç

    req.file.filename = `post-${req.user.id}-${Date.now()}.jpeg`; // Dosya adı oluştur

    try {
        await sharp(req.file.buffer)
            .resize(800, 800, {
                fit: sharp.fit.inside,
                withoutEnlargement: true
            })
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toFile(`public/img/posts/${req.file.filename}`); // 'public/img/posts' klasörüne kaydediyoruz

        req.body.photo = `${process.env.BACKEND_URL}/img/posts/${req.file.filename}`; // Veritabanına kaydedilecek URL

        next();
    } catch (error) {
        console.error('Backend: resizePostPhoto hatası:', error);
        return res.status(500).json({ status: 'error', message: 'Fotoğraf işlenirken bir hata oluştu.' });
    }
};


// @desc    Yeni gönderi oluşturma
// @route   POST /api/posts
// @access  Private
exports.createPost = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ status: 'fail', message: 'Yetkilendirme hatası. Lütfen giriş yapın.' });
        }
        if (!req.body.photo) { // Fotoğrafın resizePostPhoto tarafından ayarlandığından emin ol
            return res.status(400).json({ status: 'fail', message: 'Lütfen bir fotoğraf yükleyin.' });
        }

        req.body.user = req.user.id; // Gönderiyi yapan kullanıcıyı ayarla

        const newPost = await Post.create(req.body);

        res.status(201).json({
            status: 'success',
            message: 'Gönderi başarıyla oluşturuldu.',
            data: {
                post: newPost,
            },
        });
    } catch (error) {
        console.error('Backend: createPost hatası:', error);
        res.status(500).json({ status: 'error', message: 'Gönderi oluşturulurken bir hata oluştu.' });
    }
};

// @desc    Tüm gönderileri getir
// @route   GET /api/posts
// @access  Public
exports.getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 }); // En yeni gönderileri en üstte göster

        res.status(200).json({
            status: 'success',
            results: posts.length,
            data: {
                posts,
            },
        });
    } catch (error) {
        console.error('Backend: getAllPosts hatası:', error);
        res.status(500).json({ status: 'error', message: 'Gönderiler getirilirken bir hata oluştu.' });
    }
};

// @desc    Belirli bir gönderiyi getir
// @route   GET /api/posts/:id
// @access  Public
exports.getPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ status: 'fail', message: 'Gönderi bulunamadı.' });
        }

        res.status(200).json({
            status: 'success',
            data: {
                post,
            },
        });
    } catch (error) {
        console.error('Backend: getPost hatası:', error);
        res.status(500).json({ status: 'error', message: 'Gönderi getirilirken bir hata oluştu.' });
    }
};

// @desc    Gönderiyi güncelle
// @route   PATCH /api/posts/:id
// @access  Private (Sadece gönderi sahibi)
exports.updatePost = async (req, res) => {
    try {
        // Kullanıcının gönderinin sahibi olduğunu doğrula
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ status: 'fail', message: 'Gönderi bulunamadı.' });
        }

        // post.user bir ObjectId olduğu için string'e çevirip karşılaştır
        if (post.user._id.toString() !== req.user.id) {
            return res.status(403).json({ status: 'fail', message: 'Bu gönderiyi güncellemeye yetkiniz yok.' });
        }

        const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, {
            new: true, // Güncelledikten sonra yeni belgeyi döndür
            runValidators: true, // Şema doğrulayıcılarını çalıştır
        });

        res.status(200).json({
            status: 'success',
            message: 'Gönderi başarıyla güncellendi.',
            data: {
                post: updatedPost,
            },
        });
    } catch (error) {
        console.error('Backend: updatePost hatası:', error);
        res.status(500).json({ status: 'error', message: 'Gönderi güncellenirken bir hata oluştu.' });
    }
};

// @desc    Gönderiyi sil
// @route   DELETE /api/posts/:id
// @access  Private (Sadece gönderi sahibi veya Admin)
exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ status: 'fail', message: 'Gönderi bulunamadı.' });
        }

        // post.user bir ObjectId olduğu için string'e çevirip karşılaştır
        if (post.user._id.toString() !== req.user.id && req.user.role !== 'admin') { // Adminler de silebilir
            return res.status(403).json({ status: 'fail', message: 'Bu gönderiyi silmeye yetkiniz yok.' });
        }
        
        // Fotoğraf dosyasını da silmek istersen buraya mantık eklenebilir
        // const filePath = path.join(__dirname, `../public/img/posts/${post.photo.split('/').pop()}`);
        // fs.unlink(filePath, (err) => {
        //     if (err) console.error('Fotoğraf silinirken hata:', err);
        // });

        await Post.findByIdAndDelete(req.params.id);

        res.status(204).json({ // 204 No Content, başarılı silme yanıtıdır
            status: 'success',
            data: null,
            message: 'Gönderi başarıyla silindi.'
        });
    } catch (error) {
        console.error('Backend: deletePost hatası:', error);
        res.status(500).json({ status: 'error', message: 'Gönderi silinirken bir hata oluştu.' });
    }
};
