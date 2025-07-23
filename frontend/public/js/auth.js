// frontend/public/js/auth.js
// frontend/public/js/auth.js'in en başına
const API_BASE_URL = 'https://fotogram-backend.onrender.com'; // BURAYA KOPYALADIĞIN BACKEND URL'İNİ YAPIŞTIR
document.addEventListener('DOMContentLoaded', () => {
    // Tüm gerekli DOM elementlerini seç
    const authModal = document.getElementById('authModal');
    const modalTitle = document.getElementById('modalTitle');
    const authForm = document.getElementById('authForm');
    const emailGroup = document.getElementById('emailGroup');
    const usernameGroup = document.getElementById('usernameGroup');
    const passwordGroup = document.getElementById('passwordGroup');
    const confirmPasswordGroup = document.getElementById('confirmPasswordGroup');
    const submitButton = document.getElementById('submitButton');
    const authMessage = document.getElementById('authMessage');
    const toggleAuthMode = document.getElementById('toggleAuthMode');
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const closeButton = document.querySelector('.close-button'); // X butonu

    // Header ve main bölümündeki butonlar
    const registerButtonHeader = document.getElementById('registerButton');
    const loginButtonHeader = document.getElementById('loginButton');
    const registerButtonMain = document.getElementById('registerButtonMain');
    const loginButtonMain = document.getElementById('loginButtonMain');

    let isRegisterMode = true; // Varsayılan: Kayıt modu

    // Fonksiyon: Modalı aç
    function openModal() {
        if (authModal) { // authModal elementinin varlığını kontrol et
            authModal.style.display = 'flex'; // CSS'te display:flex kullandık
        }
    }

    // Fonksiyon: Modalı kapat
    function closeModal() {
        if (authModal) { // authModal elementinin varlığını kontrol et
            authModal.style.display = 'none';
        }
        if (authMessage) { // authMessage elementinin varlığını kontrol et
            authMessage.style.display = 'none'; // Mesajı da gizle
            authMessage.className = 'message'; // Mesajın stilini sıfırla
            authMessage.textContent = ''; // Mesaj içeriğini temizle
        }
        if (authForm) { // authForm elementinin varlığını kontrol et
            authForm.reset(); // Formu temizle
        }
    }

    // Fonksiyon: Modu değiştir (Kayıt Ol <-> Giriş Yap)
    function setAuthMode(mode) {
        isRegisterMode = mode === 'register';
        if (authForm) authForm.reset(); // Formu temizle

        if (modalTitle) modalTitle.textContent = isRegisterMode ? 'Kayıt Ol' : 'Giriş Yap';
        if (submitButton) submitButton.textContent = isRegisterMode ? 'Kayıt Ol' : 'Giriş Yap';

        if (toggleAuthMode) {
            toggleAuthMode.innerHTML = isRegisterMode ?
                'Zaten hesabın var mı? <a href="#" id="toggleLogin">Giriş Yap</a>' :
                'Hesabın yok mu? <a href="#" id="toggleRegister">Kayıt Ol</a>';

            // Dinleyicileri yeniden ata (toggleAuthMode içinde yeni linkler oluştuğu için)
            document.getElementById('toggleLogin')?.addEventListener('click', (e) => {
                e.preventDefault();
                setAuthMode('login');
            });
            document.getElementById('toggleRegister')?.addEventListener('click', (e) => {
                e.preventDefault();
                setAuthMode('register');
            });
        }

        // Alanların görünürlüğünü ayarla (null kontrolü ile)
        if (emailGroup) emailGroup.style.display = 'block';
        if (passwordGroup) passwordGroup.style.display = 'block';
        if (usernameGroup) usernameGroup.style.display = isRegisterMode ? 'block' : 'none';
        if (confirmPasswordGroup) confirmPasswordGroup.style.display = isRegisterMode ? 'block' : 'none';
        if (forgotPasswordLink) forgotPasswordLink.style.display = isRegisterMode ? 'none' : 'block';
    }

    // Header ve main section'daki buton dinleyicileri
    registerButtonHeader?.addEventListener('click', (e) => {
        e.preventDefault();
        setAuthMode('register');
        openModal();
    });

    loginButtonHeader?.addEventListener('click', (e) => {
        e.preventDefault();
        setAuthMode('login');
        openModal();
    });

    registerButtonMain?.addEventListener('click', (e) => {
        e.preventDefault();
        setAuthMode('register');
        openModal();
    });

    loginButtonMain?.addEventListener('click', (e) => {
        e.preventDefault();
        setAuthMode('login');
        openModal();
    });

    // Kapatma butonu dinleyicisi
    closeButton?.addEventListener('click', closeModal);

    // Modal dışına tıklayınca kapatma
    authModal?.addEventListener('click', (e) => {
        if (e.target === authModal) {
            closeModal();
        }
    });

    // ESC tuşuna basınca kapatma
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && authModal && authModal.style.display === 'flex') {
            closeModal();
        }
    });

    // Form gönderimi (Backend API çağrısı)
    authForm?.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (authMessage) {
            authMessage.style.display = 'none';
            authMessage.className = 'message'; // Önceki sınıfları temizle
            authMessage.textContent = ''; // Mesaj içeriğini temizle
        }

        const email = document.getElementById('email')?.value;
        const password = document.getElementById('password')?.value;
        const username = document.getElementById('username')?.value;
        const confirmPassword = document.getElementById('confirmPassword')?.value;

        let url = '';
        let body = {};

        if (isRegisterMode) {
            url = '/api/auth/register';
            body = { email, password, username, confirmPassword };
        } else {
            url = '/api/auth/login';
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

            const data = await response.json();

            if (response.ok) {
                if (authMessage) {
                    authMessage.textContent = data.message;
                    authMessage.classList.add('success');
                    authMessage.style.display = 'block';
                }

                if (!isRegisterMode && data.token) { // Sadece başarılı girişte token kaydet
                    localStorage.setItem('token', data.token);
                    // Başarılı girişte dashboard'a yönlendir
                    window.location.href = '/dashboard.html';
                }
                // Kayıt başarılı olduğunda modalı kapat ve kullanıcıya bilgiyi ver
                if (isRegisterMode) {
                     setTimeout(() => {
                         closeModal();
                         // İsteğe bağlı: Başarılı kayıt sonrası giriş moduna geçiş yapabilirsin
                         setAuthMode('login'); // Kayıt sonrası otomatik Giriş ekranına geç
                     }, 2000); // 2 saniye sonra kapat
                }

            } else {
                if (authMessage) {
                    authMessage.textContent = data.message || 'Bir hata oluştu.';
                    authMessage.classList.add('error');
                    authMessage.style.display = 'block';
                }
            }
        } catch (error) {
            console.error('Fetch hatası:', error);
            if (authMessage) {
                authMessage.textContent = 'Sunucuya bağlanılamadı veya ağ hatası oluştu.';
                authMessage.classList.add('error');
                authMessage.style.display = 'block';
            }
        }
    });

    // Sayfa yüklendiğinde varsayılan modu ayarla
    setAuthMode('register');
});
