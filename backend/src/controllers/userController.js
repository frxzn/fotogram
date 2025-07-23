const User = require('../models/User');
const Photo = require('../models/Photo'); // Fotoğraf modelini de ekliyoruz

// Kullanıcı profili getir
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select('-password -verificationToken -verificationTokenExpires -passwordResetToken -passwordResetExpires');
        if (!user) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
        }
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
};

// Kendi profilini güncelle
exports.updateUserProfile = async (req, res) => {
    const { username, bio, profilePicture } = req.body; // profilePicture için dosya yükleme (multer) eklenecek
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
        }

        // Kullanıcı adı benzersizlik kontrolü
        if (username && username !== user.username) {
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                return res.status(400).json({ message: 'Bu kullanıcı adı zaten alınmış.' });
            }
            user.username = username;
        }

        if (bio !== undefined) user.bio = bio;
        if (profilePicture !== undefined) user.profilePicture = profilePicture; // Resim yükleme logic buraya eklenecek

        await user.save();
        res.json({ message: 'Profil başarıyla güncellendi.', user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
};

// Kullanıcıları ara
exports.searchUsers = async (req, res) => {
    const { query } = req.query;
    if (!query) {
        return res.status(400).json({ message: 'Arama sorgusu boş olamaz.' });
    }
    try {
        const users = await User.find({
            username: { $regex: query, $options: 'i' }, // 'i' case-insensitive arama yapar
            isVerified: true // Sadece doğrulanmış kullanıcıları göster
        }).select('username profilePicture');
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
};

// Kullanıcının fotoğraflarını getir
exports.getUserPhotos = async (req, res) => {
    try {
        const photos = await Photo.find({ owner: req.params.userId, isApproved: true }).sort({ createdAt: -1 });
        res.json(photos);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
};

// DM kutusu ve bildirimler için placeholder
exports.getMessages = async (req, res) => {
    // Mesajlaşma sistemi için ayrı bir modül veya servis düşünülebilir.
    res.json({ messages: [] }); // Geçici boş dizi
};

exports.getNotifications = async (req, res) => {
    // Bildirim sistemi için ayrı bir modül veya servis düşünülebilir.
    res.json({ notifications: [] }); // Geçici boş dizi
};
