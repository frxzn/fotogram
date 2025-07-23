const Photo = require('../models/Photo');
const User = require('../models/User'); // Bildirim göndermek için

// Yeni fotoğraf yükle (Onay için beklet)
exports.uploadPhoto = async (req, res) => {
    const { imageUrl, caption } = req.body;
    try {
        const newPhoto = new Photo({
            owner: req.user.id,
            imageUrl,
            caption,
            isApproved: false // Admin onayı bekleyecek
        });
        await newPhoto.save();
        res.status(201).json({ message: 'Fotoğrafınız yüklendi ve yönetici onayı bekliyor.', photo: newPhoto });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Fotoğraf yüklenirken bir hata oluştu.' });
    }
};

// Rastgele fotoğraf getir (Puanlama için)
exports.getRandomPhotoForRating = async (req, res) => {
    try {
        // Kendi yüklediği ve daha önce oy verdiği fotoğrafları hariç tutabiliriz
        const userId = req.user.id;
        const photo = await Photo.aggregate([
            { $match: { isApproved: true, owner: { $ne: mongoose.Types.ObjectId(userId) } } }, // Onaylı ve kendi fotoğrafı olmayan
            { $sample: { size: 1 } }, // Rastgele 1 fotoğraf seç
            {
                $lookup: { // Sahibi bilgilerini getir
                    from: 'users',
                    localField: 'owner',
                    foreignField: '_id',
                    as: 'ownerInfo'
                }
            },
            { $unwind: '$ownerInfo' },
            {
                $project: { // Sadece gerekli alanları göster
                    _id: 1,
                    imageUrl: 1,
                    caption: 1,
                    averageRating: 1,
                    'ownerInfo.username': 1,
                    'ownerInfo._id': 1
                }
            }
        ]);

        if (photo.length === 0) {
            return res.status(404).json({ message: 'Puanlayacak fotoğraf bulunamadı.' });
        }

        // Kullanıcının bu fotoğrafa daha önce oy verip vermediğini kontrol et
        const userRated = photo[0].ratings.some(rating => rating.user.toString() === userId);
        if (userRated) {
            // Eğer oy verdiyse başka bir fotoğraf bulmaya çalış (recursive veya loop ile)
            // Daha robust bir çözüm için, aggregation içinde $redact veya $filter kullanılabilir.
            // Şimdilik basitçe başka bir fotoğraf bulunamadı mesajı dönebiliriz.
            return res.status(404).json({ message: 'Puanlayacak başka fotoğraf bulunamadı (daha önce oy verdiniz veya kendi fotoğrafınız).' });
        }


        res.json(photo[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Rastgele fotoğraf getirilirken hata oluştu.' });
    }
};

// Fotoğraf puanla
exports.ratePhoto = async (req, res) => {
    const { photoId } = req.params;
    const { score } = req.body;
    const userId = req.user.id;

    if (score < 1 || score > 5) {
        return res.status(400).json({ message: 'Puan 1 ile 5 arasında olmalıdır.' });
    }

    try {
        const photo = await Photo.findById(photoId);
        if (!photo) {
            return res.status(404).json({ message: 'Fotoğraf bulunamadı.' });
        }

        if (photo.owner.toString() === userId) {
            return res.status(400).json({ message: 'Kendi fotoğrafınızı puanlayamazsınız.' });
        }

        const existingRating = photo.ratings.find(r => r.user.toString() === userId);
        if (existingRating) {
            return res.status(400).json({ message: 'Bu fotoğrafa zaten oy verdiniz.' });
        }

        photo.ratings.push({ user: userId, score });

        // Ortalama puanı yeniden hesapla
        const totalScore = photo.ratings.reduce((sum, r) => sum + r.score, 0);
        photo.averageRating = totalScore / photo.ratings.length;

        await photo.save();

        // Fotoğraf sahibine bildirim gönder (örnek)
        const owner = await User.findById(photo.owner);
        // Burada gerçek bir bildirim sistemi (webSockets veya bildirim veritabanı) entegre edilebilir.
        console.log(`${owner.username} adlı kullanıcının fotoğrafı, ${req.user.username} tarafından ${score} puan aldı.`);

        res.status(200).json({ message: 'Puanınız başarıyla kaydedildi.', photo });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Fotoğraf puanlanırken hata oluştu.' });
    }
};

// Fotoğrafa yorum yap
exports.addComment = async (req, res) => {
    const { photoId } = req.params;
    const { text } = req.body;
    const userId = req.user.id;

    if (!text || text.trim() === '') {
        return res.status(400).json({ message: 'Yorum metni boş olamaz.' });
    }

    try {
        const photo = await Photo.findById(photoId);
        if (!photo) {
            return res.status(404).json({ message: 'Fotoğraf bulunamadı.' });
        }

        photo.comments.push({ user: userId, text });
        await photo.save();

        res.status(201).json({ message: 'Yorum başarıyla eklendi.', comment: photo.comments[photo.comments.length - 1] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Yorum eklenirken hata oluştu.' });
    }
};

// Yorumları getir (bir fotoğrafın)
exports.getComments = async (req, res) => {
    const { photoId } = req.params;
    try {
        const photo = await Photo.findById(photoId).populate('comments.user', 'username profilePicture');
        if (!photo) {
            return res.status(404).json({ message: 'Fotoğraf bulunamadı.' });
        }
        res.json(photo.comments);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Yorumlar getirilirken hata oluştu.' });
    }
};
