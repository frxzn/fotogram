// frontend/public/js/auth.js

const API_BASE_URL = 'https://fotogram-backend.onrender.com'; // Backend URL'si

// DOM elementleri
const authModal = document.getElementById('authModal');
const authForm = document.getElementById('authForm');
const closeButton = document.querySelector('.close-button');
const showRegisterLink = document.getElementById('showRegister');
const showLoginLink = document.getElementById('showLogin');
const authTitle = document.getElementById('authTitle');
const submitButton = document.getElementById('submitButton');
const toggleLinks = document.getElementById('toggleLinks');
const messageDisplay = document.getElementById('message');
const usernameGroup = document.getElementById('usernameGroup');
const confirmPasswordGroup = document.getElementById('confirmPasswordGroup');
const forgotPasswordLink = document.getElementById('forgotPasswordLink');

// Şifremi Unuttum Modalı için gerekli DOM elementleri
const forgotPasswordModal = document.getElementById('forgotPasswordModal');
const forgotPasswordForm = document.getElementById('forgotPasswordForm');
const forgotPasswordEmailInput = document.getElementById('forgotPasswordEmail');
const forgotPasswordMessage = document.getElementById('forgotPasswordMessage');
const closeForgotPasswordModalButton = document.querySelector('#forgotPasswordModal .close-button');

let isRegisterMode = false; // Başlangıçta giriş modu

// Yardımcı fonksiyonlar
function showMessage(message, type) {
    if (messageDisplay) {
        messageDisplay.textContent = message;
        messageDisplay.className = `message ${type}`;
        messageDisplay.style.display = 'block';
    }
}

function clearMessage() {
    if (messageDisplay) {
        messageDisplay.textContent = '';
        messageDisplay.className = 'message';
        messageDisplay.style.display = 'none';
    }
}

function openModal() {
    if (authModal) {
        authModal.style.display = 'flex';
        clearMessage(); // Modalı açtığında mesajı temizle
        updateFormMode(); // Form modunu başlangıç durumuna getir
    }
}

function closeModal() {
    if (authModal) {
        authModal.style.display = 'none';
        clearMessage();
        authForm?.reset(); // Formu sıfırla
    }
}

// Yeni fonksiyonlar: Şifremi Unuttum Modalı için
function openForgotPasswordModal() {
    if (forgotPasswordModal) {
        forgotPasswordModal.style.display = 'flex';
    }
    if (forgotPasswordMessage) {
        forgotPasswordMessage.style.display = 'none'; // Önceki mesajı temizle
    }
    if (forgotPasswordForm) {
        forgotPasswordForm.reset(); // Formu sıfırla
    }
    // Ana auth modal açıksa kapat
    closeModal();
}

function closeForgotPasswordModal() {
    if (forgotPasswordModal) {
        forgotPasswordModal.style.display = 'none';
    }
    if (forgotPasswordMessage) {
        forgotPasswordMessage.style.display = 'none';
    }
    if (forgotPasswordForm) {
        forgotPasswordForm.reset();
    }
}

function showForgotPasswordMessage(message, type) {
    if (forgotPasswordMessage) {
        forgotPasswordMessage.textContent = message;
        forgotPasswordMessage.className = `message ${type}`;
        forgotPasswordMessage.style.display = 'block';
    }
}


function updateFormMode() {
    if (isRegisterMode) {
        authTitle.textContent = 'Kayıt Ol';
        submitButton.textContent = 'Kayıt Ol';
        usernameGroup.style.display = 'block';
        confirmPasswordGroup.style.display = 'block';
        showRegisterLink.style.display = 'none';
        showLoginLink.style.display = 'inline';
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

// Olay dinleyicileri
document.getElementById('openAuthModalButton')?.addEventListener('click', openModal);
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

// Şifremi Unuttum linki olay dinleyicisi
forgotPasswordLink?.addEventListener('click', (e) => {
    e.preventDefault();
    openForgotPasswordModal(); // Şifremi unuttum modalını aç
});

// Şifremi Unuttum modalı kapatma butonu
closeForgotPasswordModalButton?.addEventListener('click', closeForgotPasswordModal);

// Şifremi Unuttum modalı dışına tıklama olayı
forgotPasswordModal?.addEventListener('click', (e) => {
    if (e.target === forgotPasswordModal) {
        closeForgotPasswordModal();
    }
});


// Ana kimlik doğrulama formu gönderimi
authForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMessage();

    const username = document.getElementById('username')?.value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const confirmPassword = document.getElementById('confirmPassword')?.value.trim();

    let requestBody = { email, password };
    let apiUrl = '';
    let successMessage = '';
    let errorMessage = '';

    if (isRegisterMode) {
        if (!username || !email || !password || !confirmPassword) {
            showMessage('Lütfen tüm alanları doldurun.', 'error');
            return;
        }
        if (password !== confirmPassword) {
            showMessage('Şifreler eşleşmiyor.', 'error');
            return;
        }
        if (password.length < 6) {
            showMessage('Şifre en az 6 karakter olmalıdır.', 'error');
            return;
        }
        requestBody = { username, email, password };
        apiUrl = `${API_BASE_URL}/api/auth/register`;
        successMessage = 'Kayıt başarılı! Hesabınızı doğrulamak için lütfen e-postanızı kontrol edin.';
        errorMessage = 'Kayıt başarısız oldu.';
    } else {
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
            throw new Error(data.message || errorMessage);
        }

        showMessage(data.message || successMessage, 'success');

        if (!isRegisterMode && data.token) {
            // Giriş başarılı ise token'ı Local Storage'a kaydet
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user)); // Kullanıcı bilgilerini de kaydet
            // 1 saniye sonra dashboard'a yönlendir
            setTimeout(() => {
                window.location.href = '/dashboard.html';
            }, 1000);
        } else if (isRegisterMode) {
            // Kayıt başarılı ise login moduna geç
            setTimeout(() => {
                isRegisterMode = false;
                updateFormMode();
            }, 2000); // 2 saniye sonra giriş moduna geç
        }

    } catch (error) {
        console.error('İşlem hatası:', error);
        showMessage(error.message || 'Bir hata oluştu. Lütfen tekrar deneyin.', 'error');
    }
});

// Şifremi Unuttum formunun gönderimi
forgotPasswordForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    showForgotPasswordMessage('', ''); // Önceki mesajı temizle

    const email = forgotPasswordEmailInput?.value.trim();

    if (!email) {
        showForgotPasswordMessage('Lütfen e-posta adresinizi girin.', 'error');
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

        showForgotPasswordMessage(data.message || 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.', 'success');
        setTimeout(closeForgotPasswordModal, 3000); // 3 saniye sonra modalı kapat

    } catch (error) {
        console.error('Şifre sıfırlama hatası:', error);
        showForgotPasswordMessage(error.message || 'Şifre sıfırlama isteği gönderilirken bir hata oluştu.', 'error');
    }
});

// Sayfa yüklendiğinde formu giriş moduna ayarla
document.addEventListener('DOMContentLoaded', () => {
    updateFormMode();
});
// frontend/public/js/auth.js dosyasının en altına ekle

document.getElementById('openAuthModalButtonMain')?.addEventListener('click', () => {
    isRegisterMode = true; // "Şimdi Kayıt Ol" butonu kayıt modunda açsın
    openModal();
});
document.getElementById('openAuthModalButtonSecondary')?.addEventListener('click', () => {
    isRegisterMode = false; // "Giriş Yap" butonu giriş modunda açsın
    openModal();
});
