// frontend/public/js/auth.js

document.addEventListener('DOMContentLoaded', () => {
    // BURAYI KENDİ BACKEND SERVİSİNİN RENDER URL'İ İLE DEĞİŞTİR!
    // Örnek: https://fotogram-backend-xxxx.onrender.com
    // KESİN KONTROL: URL'İN SONUNDA '/' OLMADIĞINDAN EMİN OL!
    const API_BASE_URL = 'https://fotogram-backend.onrender.com'; // BURAYI KENDİ BACKEND URL'İNLE DEĞİŞTİR!

    // Tüm gerekli DOM elementlerini seç
    const authModal = document.getElementById('authModal');
    const modalTitle = document.getElementById('modalTitle');
    const authForm = document.getElementById('authForm');
    const emailInput = document.getElementById('email');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const emailGroup = document.getElementById('emailGroup');
    const usernameGroup = document.getElementById('usernameGroup');
    const passwordGroup = document.getElementById('passwordGroup');
    const confirmPasswordGroup = document.getElementById('confirmPasswordGroup');
    const submitButton = document.getElementById('submitButton');
    const authMessage = document.getElementById('authMessage');
    const toggleAuthMode = document.getElementById('toggleAuthMode');
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const closeButton = document.querySelector('.close-button');

    const registerButtonHeader = document.getElementById('registerButton');
    const loginButtonHeader = document.getElementById('loginButton');
    const registerButtonMain = document.getElementById('registerButtonMain');
    const loginButtonMain = document.getElementById('loginButtonMain');

    let isRegisterMode = true; // Varsayılan: Kayıt modu

    function openModal() {
        if (authModal) {
            authModal.style.display = 'flex';
        }
    }

    function closeModal() {
        if (authModal) {
            authModal.style.display = 'none';
        }
        if (authMessage) {
            authMessage.style.display = 'none';
            authMessage.className = 'message';
            authMessage.textContent = '';
        }
        if (authForm) {
            authForm.reset(); // Formu sıfırla
        }
    }

    function showMessage(message, type) {
        if (authMessage) {
            authMessage.textContent = message;
            authMessage.className = `message ${type}`;
            authMessage.style.display = 'block';
        }
    }

    function setAuthMode(mode) {
        isRegisterMode = mode === 'register';
        if (authForm) authForm.reset(); // Mod değiştiğinde formu sıfırla

        if (modalTitle) modalTitle.textContent = isRegisterMode ? 'Kayıt Ol' : 'Giriş Yap';
        if (submitButton) submitButton.textContent = isRegisterMode ? 'Kayıt Ol' : 'Giriş Yap';

        if (toggleAuthMode) {
            toggleAuthMode.innerHTML = isRegisterMode ?
                'Zaten hesabın var mı? <a href="#" id="toggleLogin">Giriş Yap</a>' :
                'Hesabın yok mu? <a href="#" id="toggleRegister">Kayıt Ol</a>';

            // Dinamik olarak oluşturulan linklere event listener ekle
            document.getElementById('toggleLogin')?.addEventListener('click', (e) => {
                e.preventDefault();
                setAuthMode('login');
            });
            document.getElementById('toggleRegister')?.addEventListener('click', (e) => {
                e.preventDefault();
                setAuthMode('register');
            });
        }

        // Alanların görünürlüğünü ayarla
        if (emailGroup) emailGroup.style.display = 'block';
        if (passwordGroup) passwordGroup.style.display = 'block';
        if (usernameGroup) usernameGroup.style.display = isRegisterMode ? 'block' : 'none';
        if (confirmPasswordGroup) confirmPasswordGroup.style.display = isRegisterMode ? 'block' : 'none';
        if (forgotPasswordLink) forgotPasswordLink.style.display = isRegisterMode ? 'none' : 'block';

        if (authMessage) authMessage.style.display = 'none'; // Mod değişince mesajı gizle
    }

    // Butonlara olay dinleyicileri ekle
    registerButtonHeader?.addEventListener('click', (e) => { e.preventDefault(); setAuthMode('register'); openModal(); });
    loginButtonHeader?.addEventListener('click', (e) => { e.preventDefault(); setAuthMode('login'); openModal(); });
    registerButtonMain?.addEventListener('click', (e) => { e.preventDefault(); setAuthMode('register'); openModal(); });
    loginButtonMain?.addEventListener('click', (e) => { e.preventDefault(); setAuthMode('login'); openModal(); });
    closeButton?.addEventListener('click', closeModal);

    // Modal dışına tıklayınca kapat
    authModal?.addEventListener('click', (e) => { if (e.target === authModal) { closeModal(); } });
    // Esc tuşu ile kapat
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && authModal && authModal.style.display === 'flex') { closeModal(); } });


    // Form gönderimi (Backend API çağrısı)
    authForm?.addEventListener('submit', async (e) => {
        e.preventDefault(); // Varsayılan form gönderme davranışını engelle
        showMessage('', ''); // Önceki mesajı temizle

        const email = emailInput?.value.trim();
        const password = passwordInput?.value.trim();
        const username = usernameInput?.value.trim();
        const confirmPassword = confirmPasswordInput?.value.trim();

        // Basit frontend validasyonları
        if (isRegisterMode) {
            if (!username || !email || !password || !confirmPassword) {
                showMessage('Lütfen tüm alanları doldurun.', 'error');
                return;
            }
            if (password !== confirmPassword) {
                showMessage('Şifreler uyuşmuyor.', 'error');
                return;
            }
            if (password.length < 6) {
                showMessage('Şifre en az 6 karakter olmalıdır.', 'error');
                return;
            }
        } else { // Login mode
            if (!email || !password) {
                showMessage('Lütfen e-posta ve şifrenizi girin.', 'error');
                return;
            }
        }


        let url = '';
        let body = {};

        if (isRegisterMode) {
            url = `${API_BASE_URL}/api/auth/register`;
            body = { email, password, username, confirmPassword }; // confirmPassword'u backend'e göndermiyoruz, sadece frontend'de doğrulama için
            // Backend'e sadece 'email', 'password', 'username' gönderilmeli
            body = { email, password, username }; // Güncellenmiş body
        } else {
            url = `${API_BASE_URL}/api/auth/login`;
            body = { email, password };
        }

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            // Yanıtı JSON olarak ayrıştırmadan önce hata durumunu kontrol et
            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json(); // Hata yanıtını JSON olarak ayrıştırmaya çalış
                } catch (jsonError) {
                    console.error("JSON ayrıştırma hatası:", jsonError);
                    throw new Error(`Sunucudan geçerli bir hata yanıtı alınamadı. HTTP Durum: ${response.status}`);
                }
                throw new Error(errorData.message || `HTTP Hata: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json(); // Başarılı yanıtı JSON olarak ayrıştır

            showMessage(data.message || 'İşlem Başarılı!', 'success');

            if (!isRegisterMode && data.token) { // Sadece başarılı girişte token kaydet
                localStorage.setItem('token', data.token);
                setTimeout(() => {
                    window.location.href = '/dashboard.html'; // 1 saniye sonra dashboard'a yönlendir
                }, 1000);
            }
            if (isRegisterMode) {
                 setTimeout(() => {
                     closeModal();
                     setAuthMode('login'); // Kayıt sonrası otomatik Giriş ekranına geç
                 }, 2000); // 2 saniye sonra modalı kapat
            }

        } catch (error) {
            console.error('API İsteği Hatası:', error);
            let errorMessage = 'Sunucuya bağlanılamadı veya ağ hatası oluştu.';
            // Hata mesajını daha anlaşılır hale getir
            if (error.message) {
                errorMessage = error.message;
            } else if (error.message.includes('Failed to fetch')) {
                errorMessage = 'Sunucuya ulaşılamıyor. Lütfen internet bağlantınızı ve backend servisinizin aktifliğini kontrol edin.';
            }
            showMessage(errorMessage, 'error');
        }
    });

    // Sayfa yüklendiğinde varsayılan olarak modalı açmıyoruz.
    // setAuthMode('register'); // BU SATIR YORUM SATIRI KALMALI VEYA SİLİNMELİ.
});
