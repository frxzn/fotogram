// backend/src/models/Post.js

const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    photo: {
        type: String, // Fotoğrafın buluttaki veya sunucudaki URL'si
        required: [true, 'Bir gönderi fotoğrafı olmalıdır.'],
    },
    caption: {
        type: String,
        trim: true,
        maxlength: [2200, 'Gönderi açıklaması 2200 karakteri geçemez.'],
        default: '', // Açıklama boş bırakılabilir
    },
    user: {
        type: mongoose.Schema.ObjectId, // Gönderiyi paylaşan kullanıcının ID'si
        ref: 'User', // 'User' modeline referans veriyoruz
        required: [true, 'Bir gönderinin bir kullanıcısı olmalıdır.'],
    },
    likes: [ // Gönderiyi beğenen kullanıcıların ID'leri
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
        },
    ],
    comments: [ // Gönderiye yapılan yorumlar (şimdilik basit bir yapı)
        {
            text: String,
            user: {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
            },
            createdAt: {
                type: Date,
                default: Date.now,
            },
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, {
    toJSON: { virtuals: true }, // Sanal alanları JSON çıktısına dahil et
    toObject: { virtuals: true }, // Sanal alanları Object çıktısına dahil et
});

// Populate user field automatically on find queries
// Bir gönderi sorgulandığında user bilgilerini otomatik olarak getirmek için
postSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'user',
        select: 'username photo', // Kullanıcıdan sadece kullanıcı adı ve fotoğrafı çek
    });
    // Yorumlardaki kullanıcıları da populate etmek isteyebiliriz
    // this.populate({
    //     path: 'comments.user',
    //     select: 'username photo',
    // });
    next();
});


const Post = mongoose.model('Post', postSchema);

module.exports = Post;
