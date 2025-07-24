// frontend/public/js/settings.js

const API_BASE_URL = 'https://fotogram-backend.onrender.com'; // Backend URL'si - Kendi Backend URL'n ile değiştirmeyi UNUTMA!

document.addEventListener('DOMContentLoaded', () => {
    const changePasswordForm = document.getElementById('changePasswordForm');
    const passwordMessageDisplay = document.getElementById('passwordMessage');
    const logoutButton = document.getElementById('logoutButton');

    // Yardımcı mesaj gösterme fonksiyonu (auth.js'ten kopyalandı)
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

    // Yetkisiz erişim kontrolü
    const checkAuthAndLoadSettings = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            // Token yoksa giriş sayfasına yönlendir
            redirectToLogin();
            return;
        }
        // Eğer token varsa ve geçerliyse (backend'e istek gönderip doğrulamak en iyisi olurdu ama şimdilik sadece varlığını kontrol ediyoruz)
        // console.log('Kullanıcı giriş yapmış, ayarlar sayfası yüklendi.');
    };

    // Giriş sayfasına yönlendirme fonksiyonu
    const redirectToLogin = () => {
        // console.log('Giriş yapılmamış veya geçersiz kullanıcı. index.html e yönlendiriliyor.');
        window.location.href = '/index.html';
    };

    // Sayfa yüklendiğinde yetki kontrolünü yap
    checkAuthAndLoadSettings();

    // Şifre Değiştirme Formu Gönderimi
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearMessage(passwordMessageDisplay);

            const currentPassword = document.getElementById('currentPassword').value.trim();
            const newPassword = document.getElementById('newPassword').value.trim();
            const newPasswordConfirm = document.getElementById('newPasswordConfirm').value.trim();

            if (!currentPassword || !newPassword || !newPasswordConfirm) {
                showMessage('Lütfen tüm alanları doldurun.', 'error', passwordMessageDisplay);
                return;
            }
            if (newPassword !== newPasswordConfirm) {
                showMessage('Yeni şifreler eşleşmiyor.', 'error', passwordMessageDisplay);
                return;
            }
            if (newPassword.length < 6) {
                showMessage('Yeni şifre en az 6 karakter olmalıdır.', 'error', passwordMessageDisplay);
                return;
            }

            const token = localStorage.getItem('token');
            if (!token) {
                showMessage('Yetkilendirme hatası. Lütfen tekrar giriş yapın.', 'error', passwordMessageDisplay);
                redirectToLogin();
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/api/auth/update-password`, {
                    method: 'PATCH', // Şifre güncellemek için genellikle PATCH kullanılır
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` // Yetkilendirme token'ı gönderiliyor
                    },
                    body: JSON.stringify({
                        currentPassword,
                        password: newPassword, // Backend'in beklediği anahtar genellikle 'password'
                        passwordConfirm: newPasswordConfirm // Backend'in beklediği anahtar genellikle 'passwordConfirm'
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Şifre değiştirme başarısız oldu.');
                }

                showMessage(data.message || 'Şifreniz başarıyla değiştirildi!', 'success', passwordMessageDisplay);
                changePasswordForm.reset(); // Formu temizle

            } catch (error) {
                console.error('Şifre değiştirme hatası:', error);
                showMessage(error.message || 'Bir hata oluştu. Lütfen tekrar deneyin.', 'error', passwordMessageDisplay);
            }
        });
    }

    // Çıkış Yap butonu olay dinleyicisi (profile.js'den kopyalandı)
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            setTimeout(() => {
                redirectToLogin();
            }, 50);
        });
    }
});
