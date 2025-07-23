// frontend/public/js/auth.js

document.addEventListener('DOMContentLoaded', () => {
    // BURAYI KENDİ BACKEND SERVİSİNİN RENDER URL'İ İLE DEĞİŞTİR!
    // Örnek: https://fotogram-backend-abcdef.onrender.com (SENİN BACKEND URL'İN)
    const API_BASE_URL = 'https://fotogram-backend.onrender.com'; // Lütfen burayı güncelleyin!

    // Tüm gerekli DOM elementlerini seç
    const authModal = document.getElementById('authModal');
    const modalTitle = document.getElementById('modalTitle');
    const authForm = document.getElementById('authForm');
    const emailInput = document.getElementById('email');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword'); // Confirm password input
    const emailGroup = document.getElementById('emailGroup');
    const usernameGroup = document.getElementById('usernameGroup');
    const passwordGroup = document.getElementById('passwordGroup');
    const confirmPasswordGroup = document.getElementById('confirmPasswordGroup'); // Confirm password group
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
        if (authModal) {
            authModal.style.display = 'flex';
        }
    }

    // Fonksiyon: Modalı kapat
    function closeModal() {
        if (authModal) {
            authModal.style.display = 'none';
        }
        if (authMessage) {
            authMessage.style.display = 'none';
            authMessage.className = 'message'; // Mesajın stilini sıfırla
            authMessage.textContent = ''; // Mesaj içeriğini temizle
        }
        if (authForm) {
            authForm.reset(); // Formu temizle
        }
    }

    // Fonksiyon: Mesajı göster
    function showMessage(message, type) {
        if (authMessage) {
            authMessage.textContent = message;
            authMessage.className = `message ${type}`; // 'success' veya 'error'
            authMessage.style.display = 'block';
        }
    }

    // Fonksiyon: Modu değiştir (Kayıt Ol <-> Giriş Yap)
    function setAuthMode(mode) {
        isRegisterMode = mode === 'register';
        if (authForm) authForm.reset();

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

        // Alanların görünürlüğünü ayarla
        if (emailGroup) emailGroup.style.display = 'block';
        if (passwordGroup) passwordGroup.style.display = 'block';
        if (usernameGroup) usernameGroup.style.display = isRegisterMode ? 'block' : 'none';
        if (confirmPasswordGroup) confirmPasswordGroup.style.display = isRegisterMode ? 'block' : 'none';
        if (forgotPasswordLink) forgotPasswordLink.style.display = isRegisterMode ? 'none' : 'block';

        // Mesajı gizle
        if (authMessage) authMessage.style.display = 'none';
    }

    // Buton Dinleyicileri
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
        showMessage('', ''); // Önceki mesajı temizle

        const email = emailInput?.value.trim();
        const password = passwordInput?.value.trim();
        const username = usernameInput?.value.trim();
        const confirmPassword = confirmPasswordInput?.value.trim();

        // Basit validasyonlar
        if (!email || !password || (isRegisterMode && (!username || !confirmPassword))) {
            showMessage('Lütfen tüm alanları doldurun.', 'error');
            return;
        }

        if (isRegisterMode && password !== confirmPassword) {
            showMessage('Şifreler uyuşmuyor.', 'error');
            return;
        }

        let url = '';
        let body = {};

        if (isRegisterMode) {
            url = `${API_BASE_URL}/api/auth/register`;
            body = { email, password, username, confirmPassword };
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

            if (!response.ok) { // HTTP yanıtı 200-299 aralığında değilse
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP Hata: ${response.status}`);
            }

            const data = await response.json();

            showMessage(data.message || 'İşlem Başarılı!', 'success');

            if (!isRegisterMode && data.token) { // Sadece başarılı girişte token kaydet
                localStorage.setItem('token', data.token);
                // Başarılı girişte dashboard'a yönlendir
                setTimeout(() => {
                    window.location.href = '/dashboard.html';
                }, 1000); // 1 saniye sonra yönlendir
            }
            // Kayıt başarılı olduğunda modalı kapat ve kullanıcıya bilgiyi ver
            if (isRegisterMode) {
                 setTimeout(() => {
                     closeModal();
                     setAuthMode('login'); // Kayıt sonrası otomatik Giriş ekranına geç
                 }, 2000); // 2 saniye sonra kapat
            }

        } catch (error) {
            console.error('API İsteği Hatası:', error);
            // Hata mesajını daha anlaşılır hale getirelim
            let errorMessage = 'Sunucuya bağlanılamadı veya ağ hatası oluştu.';
            if (error.message.includes('HTTP Hata')) {
                errorMessage = error.message; // Backend'den gelen spesifik HTTP hatasını göster
            } else if (error.message.includes('Failed to fetch')) {
                errorMessage = 'Sunucuya ulaşılamıyor. Lütfen daha sonra tekrar deneyin.';
            } else if (error.message) {
                errorMessage = error.message; // Custom hata mesajları
            }
            showMessage(errorMessage, 'error');
        }
    });

    // Sayfa yüklendiğinde varsayılan modu ayarla
    setAuthMode('register');
});
