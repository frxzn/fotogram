// frontend/public/js/dashboard.js

const API_BASE_URL = 'https://fotogram-backend.onrender.com'; // Backend URL'nizi buraya yazın!

document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.getElementById('logoutButton');
    const createPostForm = document.getElementById('createPostForm');
    const postMessageDisplay = document.getElementById('postMessage');
    const postsContainer = document.getElementById('postsContainer');
    const loadingMessage = document.getElementById('loadingMessage');
    const noPostsMessage = document.getElementById('noPostsMessage');

    // Yardımcı mesaj gösterme fonksiyonu
    function showMessage(message, type, displayElement) {
        if (displayElement) {
            displayElement.textContent = message;
            displayElement.className = `message ${type}`;
            displayElement.style.display = 'block';
        }
    }

    // Mesaj temizleme fonksiyonu
    function clearMessage(displayElement) {
        if (displayElement) {
            displayElement.textContent = '';
            displayElement.className = 'message';
            displayElement.style.display = 'none';
        }
    }

    // Giriş yapılmamışsa ana sayfaya yönlendir
    const redirectToLogin = () => {
        window.location.href = '/index.html';
    };

    // Yetki kontrolü
    const checkAuth = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            redirectToLogin();
            return false;
        }
        return true;
    };

    if (!checkAuth()) {
        return; // Yetkisizse fonksiyonu burada sonlandır
    }

    // Çıkış Yap butonu işlevselliği
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('user'); // Kullanıcı bilgilerini de temizle
            setTimeout(() => {
                redirectToLogin();
            }, 50);
        });
    }

    // Yeni Gönderi Oluşturma Formu Gönderimi
    if (createPostForm) {
        createPostForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearMessage(postMessageDisplay);

            const token = localStorage.getItem('token');
            if (!token) {
                showMessage('Yetkilendirme hatası. Lütfen tekrar giriş yapın.', 'error', postMessageDisplay);
                redirectToLogin();
                return;
            }

            const formData = new FormData();
            const photoFile = document.getElementById('postPhoto').files[0];
            const caption = document.getElementById('postCaption').value.trim();

            if (!photoFile) {
                showMessage('Lütfen bir fotoğraf seçin.', 'error', postMessageDisplay);
                return;
            }

            formData.append('photo', photoFile);
            formData.append('caption', caption);

            try {
                const response = await fetch(`${API_BASE_URL}/api/posts`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                        // 'Content-Type': 'multipart/form-data' HEADER'I FormData kullanırken OTOMATİK AYARLANIR, elle yazma!
                    },
                    body: formData,
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Gönderi oluşturma başarısız oldu.');
                }

                showMessage(data.message || 'Gönderi başarıyla paylaşıldı!', 'success', postMessageDisplay);
                createPostForm.reset(); // Formu temizle
                await fetchPosts(); // Gönderiler listesini yeniden yükle
                
            } catch (error) {
                console.error('Gönderi oluşturma hatası:', error);
                showMessage(error.message || 'Bir hata oluştu. Lütfen tekrar deneyin.', 'error', postMessageDisplay);
            }
        });
    }

    // Gönderileri Backend'den Çekme ve Ekrana Basma
    const fetchPosts = async () => {
        loadingMessage.style.display = 'block';
        noPostsMessage.style.display = 'none';
        postsContainer.innerHTML = ''; // Önceki gönderileri temizle

        try {
            const response = await fetch(`${API_BASE_URL}/api/posts`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // Gönderileri herkese açık çekiyoruz, token gerekmeyebilir.
                    // Eğer sadece giriş yapmış kullanıcıların görmesini istersen buraya token ekleyebilirsin:
                    // 'Authorization': `Bearer ${localStorage.getItem('token')}` 
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Gönderiler getirilemedi.');
            }

            if (data.data.posts.length === 0) {
                noPostsMessage.style.display = 'block';
            } else {
                data.data.posts.forEach(post => {
                    const postCard = document.createElement('div');
                    postCard.className = 'post-card';
                    
                    const postDate = new Date(post.createdAt).toLocaleDateString('tr-TR', {
                        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    });

                    // Kullanıcı fotoğrafı ve kullanıcı adı Post modelinde populate ediliyor olmalı
                    const userPhoto = post.user && post.user.photo ? post.user.photo : 'assets/default-user.png'; // Varsayılan profil resmi
                    const username = post.user && post.user.username ? post.user.username : 'Bilinmeyen Kullanıcı';

                    postCard.innerHTML = `
                        <div class="post-header">
                            <img src="${userPhoto}" alt="${username}" class="user-photo">
                            <span class="username">${username}</span>
                        </div>
                        <img src="${post.photo}" alt="${post.caption}" class="post-image">
                        <div class="post-content">
                            <p class="caption">${post.caption || ''}</p>
                            </div>
                        <div class="post-footer">
                            <span class="post-date">${postDate}</span>
                            </div>
                    `;
                    postsContainer.appendChild(postCard);
                });
            }

        } catch (error) {
            console.error('Gönderiler çekilirken hata:', error);
            showMessage(error.message || 'Gönderiler yüklenirken bir sorun oluştu.', 'error', postsContainer);
        } finally {
            loadingMessage.style.display = 'none';
        }
    };

    // Sayfa yüklendiğinde gönderileri çek
    fetchPosts();
});
