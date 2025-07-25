// frontend/public/js/auth.js

const API_BASE_URL = 'https://fotogram-backend.onrender.com'; // Backend URL'si - Kendi Backend URL'n ile değiştirmeyi UNUTMA!

// DOM elementleri
const authModal = document.getElementById('authModal');
const authForm = document.getElementById('authForm');
const closeButton = document.querySelector('.close-button'); // Auth modal kapatma butonu
const showRegisterLink = document.getElementById('showRegister');
const showLoginLink = document.getElementById('showLogin');
const authTitle = document.getElementById('authTitle');
const submitButton = document.getElementById('submitButton');
const toggleLinks = document.getElementById('toggleLinks'); // Bu elementin ID'si HTML'de mevcut olmayabilir, kontrol et
const messageDisplay = document.getElementById('message'); // Auth modal mesaj alanı
const usernameGroup = document.getElementById('usernameGroup');
const confirmPasswordGroup = document.getElementById('confirmPasswordGroup');
const forgotPasswordLink = document.getElementById('forgotPasswordLink');

// Şifremi Unuttum Modalı için gerekli DOM elementleri
const forgotPasswordModal = document.getElementById('forgotPasswordModal');
const forgotPasswordForm = document.getElementById('forgotPasswordForm');
const forgotPasswordEmailInput = document.getElementById('forgotPasswordEmail');
const forgotPasswordMessage = document.getElementById('forgotPasswordMessage'); // Şifremi unuttum modalı mesaj alanı
const closeForgotPasswordModalButton = document.querySelector('#forgotPasswordModal .close-button');

// "Şimdi Kayıt Ol" ve "Giriş Yap" düğmeleri için ana sayfa
const openAuthModalButtonMain = document.getElementById('openAuthModalButtonMain');
const openAuthModalButtonSecondary = document.getElementById('openAuthModalButtonSecondary');

let isRegisterMode = false; // Başlangıçta giriş modu (login)

// Yardımcı fonksiyonlar
function showMessage(message, type, displayElement = messageDisplay) {
    if (displayElement) {
        displayElement.textContent = message;
        displayElement.className = `message ${type}`;
        displayElement.style.display = 'block';
    }
}

function clearMessage(displayElement = messageDisplay) {
    if (displayElement) {
        displayElement.textContent = '';
        displayElement.className = 'message';
        displayElement.style.display = 'none';
    }
}

function openModal() {
    if (authModal) {
        authModal.style.display = 'flex';
        clearMessage();
        authForm?.reset(); // Formu açtığında resetle
        updateFormMode(); // Form modunu başlangıç durumuna getir
    }
}

function closeModal() {
    if (authModal) {
        authModal.style.display = 'none';
        clearMessage();
        authForm?.reset();
    }
}

function openForgotPasswordModal() {
    if (forgotPasswordModal) {
        forgotPasswordModal.style.display = 'flex';
    }
    clearMessage(forgotPasswordMessage); // Şifremi unuttum modalındaki mesajı temizle
    forgotPasswordForm?.reset(); // Şifremi unuttum formunu sıfırla
    closeModal(); // Ana auth modal açıksa kapat
}

function closeForgotPasswordModal() {
    if (forgotPasswordModal) {
        forgotPasswordModal.style.display = 'none';
    }
    clearMessage(forgotPasswordMessage);
    forgotPasswordForm?.reset();
}

function updateFormMode() {
    if (authTitle && submitButton && usernameGroup && confirmPasswordGroup && showRegisterLink && showLoginLink && forgotPasswordLink) {
        if (isRegisterMode) {
            authTitle.textContent = 'Kayıt Ol';
            submitButton.textContent = 'Kayıt Ol';
            usernameGroup.style.display = 'block'; // Kullanıcı adı alanı
            confirmPasswordGroup.style.display = 'block'; // Şifre onayı alanı
            showRegisterLink.style.display = 'none'; // Kayıt ol linkini gizle
            showLoginLink.style.display = 'inline'; // Giriş yap linkini göster
            forgotPasswordLink.style.display = 'none'; // Kayıt modunda şifremi unuttumu gizle
        } else {
            authTitle.textContent = 'Giriş Yap';
            submitButton.textContent = 'Giriş Yap';
            usernameGroup.style.display = 'none';
            confirmPasswordGroup.style.display = 'none';
            showRegisterLink.style.display = 'inline';
            showLoginLink.style.display = 'none';
            forgotPasswordLink.style.display = 'block'; // Giriş modunda şifremi unuttumu göster
        }
        authForm?.reset(); // Mod değiştiğinde formu sıfırla
        clearMessage(); // Mod değiştiğinde mesajı temizle
    }
}

// Olay dinleyicileri (Null kontrolü ile daha güvenli)
document.addEventListener('DOMContentLoaded', () => {
    // Auth Modal Butonları (Ana sayfadaki)
    openAuthModalButtonMain?.addEventListener('click', () => {
        isRegisterMode = true; // "Şimdi Kayıt Ol" butonu kayıt modunda açsın
        openModal();
    });
    openAuthModalButtonSecondary?.addEventListener('click', () => {
        isRegisterMode = false; // "Giriş Yap" butonu giriş modunda açsın
        openModal();
    });

    // Auth Modal içindeki butonlar
    closeButton?.addEventListener('click', closeModal);
    authModal?.addEventListener('click', (e) => {
        if (e.target === authModal) {
            closeModal();
        }
    });

    showRegisterLink?.addEventListener('click', (e) => {
        e.preventDefault();
        isRegisterMode = true;
        updateFormMode();
    });

    showLoginLink?.addEventListener('click', (e) => {
        e.preventDefault();
        isRegisterMode = false;
        updateFormMode();
    });

    forgotPasswordLink?.addEventListener('click', (e) => {
        e.preventDefault();
        openForgotPasswordModal();
    });

    // Şifremi Unuttum modalı kapatma butonu
    closeForgotPasswordModalButton?.addEventListener('click', closeForgotPasswordModal);

    // Şifremi Unuttum modalı dışına tıklama olayı
    forgotPasswordModal?.addEventListener('click', (e) => {
        if (e.target === forgotPasswordModal) {
            closeForgotPasswordModal();
        }
    });

    // Form modunu başlangıçta ayarla
    updateFormMode();
});


// Ana kimlik doğrulama formu gönderimi
authForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMessage(); // Mesajı her gönderimde temizle

    const username = document.getElementById('username')?.value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const confirmPassword = document.getElementById('confirmPassword')?.value.trim(); // Sadece kayıt modunda geçerli

    let requestBody = { email, password }; // Varsayılan: Giriş isteği için
    let apiUrl = '';
    let successMessage = '';
    let errorMessage = '';

    // Kayıt modu kontrolü
    if (isRegisterMode) {
        // Kayıt için tüm gerekli alanların dolu olduğunu kontrol et
        if (!username || !email || !password || !confirmPassword) {
            showMessage('Lütfen tüm alanları doldurun.', 'error');
            return;
        }
        // Şifre eşleşme kontrolü
        if (password !== confirmPassword) {
            showMessage('Şifreler eşleşmiyor.', 'error');
            return;
        }
        // Şifre uzunluk kontrolü
        if (password.length < 6) {
            showMessage('Şifre en az 6 karakter olmalıdır.', 'error');
            return;
        }
        
        requestBody = { username, email, password, confirmPassword }; // TÜM ALANLARI GÖNDER
        apiUrl = `${API_BASE_URL}/api/auth/register`;
        successMessage = 'Kayıt başarılı! Hesabınızı doğrulamak için lütfen e-postanızı kontrol edin.';
        errorMessage = 'Kayıt başarısız oldu.';
    } else { // Giriş modu
        if (!email || !password) {
            showMessage('Lütfen e-posta ve şifrenizi girin.', 'error');
            return;
        }
        apiUrl = `${API_BASE_URL}/api/auth/login`;
        successMessage = 'Giriş başarılı!';
        errorMessage = 'Giriş başarısız oldu.';
    }

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        if (!response.ok) {
            // Backend'den gelen hata mesajını göster
            throw new Error(data.message || errorMessage);
        }

        // Başarı mesajını göster
        showMessage(data.message || successMessage, 'success');

        if (!isRegisterMode && data.token) {
            // Giriş başarılı ise token'ı Local Storage'a kaydet
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user)); // Kullanıcı bilgilerini de kaydet
            // 1 saniye sonra dashboard'a yönlendir
            setTimeout(() => {
                window.location.href = '/dashboard.html'; // Kullanıcının yönlendirileceği dashboard sayfası
            }, 1000);
        } else if (isRegisterMode) {
            // Kayıt başarılı ise kullanıcıya bilgi ver ve giriş moduna geçmesi için biraz bekle
            setTimeout(() => {
                isRegisterMode = false; // Giriş moduna geç
                updateFormMode();
            }, 2000); // 2 saniye sonra giriş moduna geç
        }

    } catch (error) {
        console.error('Kimlik doğrulama işlemi hatası:', error);
        showMessage(error.message || 'Bir hata oluştu. Lütfen tekrar deneyin.', 'error');
    }
});

// Şifremi Unuttum formunun gönderimi
forgotPasswordForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMessage(forgotPasswordMessage); // Önceki mesajı temizle

    const email = forgotPasswordEmailInput?.value.trim();

    if (!email) {
        showMessage('Lütfen e-posta adresinizi girin.', 'error', forgotPasswordMessage);
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Şifre sıfırlama isteği başarısız oldu.');
        }

        showMessage(data.message || 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.', 'success', forgotPasswordMessage);
        setTimeout(closeForgotPasswordModal, 3000); // 3 saniye sonra modalı kapat

    } catch (error) {
        console.error('Şifre sıfırlama hatası:', error);
        showMessage(error.message || 'Şifre sıfırlama isteği gönderilirken bir hata oluştu.', 'error', forgotPasswordMessage);
    }
});
