const Photo = require('../models/Photo');
const User = require('../models/User');

// Onay bekleyen fotoğrafları listele
exports.getPendingPhotos = async (req, res) => {
    try {
        const photos = await Photo.find({ isApproved: false }).populate('owner', 'username email');
        res.json(photos);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Bekleyen fotoğraflar getirilirken hata oluştu.' });
    }
};

// Fotoğrafı onayla
exports.approvePhoto = async (req, res) => {
    const { photoId } = req.params;
    try {
        const photo = await Photo.findById(photoId);
        if (!photo) {
            return res.status(404).json({ message: 'Fotoğraf bulunamadı.' });
        }
        photo.isApproved = true;
        photo.rejectedReason = undefined;
        await photo.save();

        // Kullanıcıya bildirim gönder (örnek)
        // const owner = await User.findById(photo.owner);
        // console.log(`${owner.username}'ın fotoğrafı onaylandı.`);
        // Gerçek bir bildirim sistemi buraya entegre edilecek.

        res.json({ message: 'Fotoğraf başarıyla onaylandı.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Fotoğraf onaylanırken hata oluştu.' });
    }
};

// Fotoğrafı reddet
exports.rejectPhoto = async (req, res) => {
    const { photoId } = req.params;
    const { reason } = req.body;
    try {
        const photo = await Photo.findById(photoId);
        if (!photo) {
            return res.status(404).json({ message: 'Fotoğraf bulunamadı.' });
        }
        photo.isApproved = false;
        photo.rejectedReason = reason || 'Yönetici tarafından reddedildi.';
        await photo.save();

        // Kullanıcıya bildirim gönder (örnek)
        // const owner = await User.findById(photo.owner);
        // console.log(`${owner.username}'ın fotoğrafı reddedildi. Sebep: ${photo.rejectedReason}`);
        // Gerçek bir bildirim sistemi buraya entegre edilecek.

        res.json({ message: 'Fotoğraf başarıyla reddedildi.', rejectedReason: photo.rejectedReason });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Fotoğraf reddedilirken hata oluştu.' });
    }
};

// Kullanıcıları yönet (Admin paneli için)
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password -verificationToken -passwordResetToken');
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Kullanıcılar getirilirken hata oluştu.' });
    }
};

// Kullanıcıyı sil (Admin yetkisi ile)
exports.deleteUser = async (req, res) => {
    const { userId } = req.params;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
        }
        // Kullanıcının tüm fotoğraflarını da sil
        await Photo.deleteMany({ owner: userId });
        await user.deleteOne(); // updated from user.remove()

        res.json({ message: 'Kullanıcı ve ilişkili tüm fotoğrafları başarıyla silindi.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Kullanıcı silinirken hata oluştu.' });
    }
};

// Bir kullanıcıyı admin yap veya adminlikten çıkar
exports.toggleAdminStatus = async (req, res) => {
    const { userId } = req.params;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
        }
        user.isAdmin = !user.isAdmin;
        await user.save();
        res.json({ message: `Kullanıcının adminlik durumu ${user.isAdmin ? 'yapıldı' : 'kaldırıldı'}.` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Kullanıcının adminlik durumu güncellenirken hata oluştu.' });
    }
};
