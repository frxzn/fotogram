// frontend/public/js/auth.js - SON GÜNCEL VERSİYON (Login sonrası yönlendirme fix)

// BURADAKİ URL'Yİ KENDİ BACKEND URL'N İ İLE DEĞİŞTİR!!!
const API_BASE_URL = 'https://fotogram-backend.onrender.com'; // Örn: 'https://fotogram-backend-abcdef.onrender.com'

// DOM elementleri
const authModal = document.getElementById('authModal');
const authForm = document.getElementById('authForm');
const showRegisterLink = document.getElementById('showRegister');
const showLoginLink = document.getElementById('showLogin');
const authTitle = document.getElementById('authTitle');
const submitButton = document.getElementById('submitButton');
const messageDisplay = document.getElementById('message');
const usernameGroup = document.getElementById('usernameGroup');
const confirmPasswordGroup = document.getElementById('confirmPasswordGroup');
const forgotPasswordLink = document.getElementById('forgotPasswordLink'); 

const forgotPasswordModal = document.getElementById('forgotPasswordModal');
const forgotPasswordForm = document.getElementById('forgotPasswordForm');
const forgotPasswordEmailInput = document.getElementById('forgotPasswordEmail');
const forgotPasswordMessage = document.getElementById('forgotPasswordMessage'); 

let isRegisterMode = false;

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

function openModal(mode = 'login') {
    isRegisterMode = (mode === 'register');
    if (authModal) {
        authModal.style.display = 'flex';
        clearMessage();
        authForm?.reset();
        updateFormMode();
    }
}

function closeModal() {
    if (authModal) {
        authModal.style.display = 'none';
        clearMessage();
        authForm?.reset();
    }
    closeForgotPasswordModal(); 
}

function openForgotPasswordModal() {
    if (forgotPasswordModal) {
        forgotPasswordModal.style.display = 'flex';
    }
    clearMessage(forgotPasswordMessage);
    forgotPasswordForm?.reset();
    if (authModal && authModal.style.display === 'flex') {
        closeModal(); 
    }
}

function closeForgotPasswordModal() {
    if (forgotPasswordModal) {
        forgotPasswordModal.style.display = 'none';
    }
    clearMessage(forgotPasswordMessage);
    forgotPasswordForm?.reset();
}

function updateFormMode() {
    const elementsExist = authTitle && submitButton && usernameGroup && confirmPasswordGroup && 
                          showRegisterLink && showLoginLink && forgotPasswordLink;

    if (elementsExist) {
        if (isRegisterMode) {
            authTitle.textContent = 'Kayıt Ol';
            submitButton.textContent = 'Kayıt Ol';
            usernameGroup.style.display = 'block';
            confirmPasswordGroup.style.display = 'block';
            showRegisterLink.style.display = 'none';
            showLoginLink.style.display = 'inline';
            forgotPasswordLink.style.display = 'none';
        } else {
            authTitle.textContent = 'Giriş Yap';
            submitButton.textContent = 'Giriş Yap';
            usernameGroup.style.display = 'none';
            confirmPasswordGroup.style.display = 'none';
            showRegisterLink.style.display = 'inline';
            showLoginLink.style.display = 'none';
            forgotPasswordLink.style.display = 'block';
        }
        authForm?.reset();
        clearMessage();
    } else {
        console.warn("auth.js: updateFormMode için gerekli bazı DOM elementleri bulunamadı.");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const authModalCloseButton = document.querySelector('#authModal .close-button');
    if (authModalCloseButton) {
        authModalCloseButton.addEventListener('click', closeModal);
    }
    
    authModal?.addEventListener('click', (e) => {
        if (e.target === authModal) {
            closeModal();
        }
    });

    const forgotPasswordModalCloseButton = document.querySelector('#forgotPasswordModal .close-button');
    if (forgotPasswordModalCloseButton) {
        forgotPasswordModalCloseButton.addEventListener('click', closeForgotPasswordModal);
    }

    forgotPasswordModal?.addEventListener('click', (e) => {
        if (e.target === forgotPasswordModal) {
            closeForgotPasswordModal();
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

    if (forgotPasswordLink) { 
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openForgotPasswordModal();
            console.log("Şifremi unuttum butonuna tıklandı.");
        });
    } else {
        console.warn("forgotPasswordLink elementi bulunamadı. Lütfen index.html'i kontrol edin.");
    }

    updateFormMode();
});


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
            showMessage('Şifreler eşleşmiyor!', 'error'); 
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
        console.log('API İsteği Başlatılıyor:', apiUrl, 'Body:', requestBody);
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        console.log('API Yanıtı Geldi. Durum Kodu:', response.status);
        const data = await response.json();
        console.log('API Yanıt Verisi:', data);

        if (!response.ok) {
            throw new Error(data.message || errorMessage);
        }

        showMessage(data.message || successMessage, 'success');

        if (!isRegisterMode) { // Sadece giriş modunda localStorage'a kullanıcı adı kaydet
            // Backend'den 'username' alanı geliyorsa onu kullan, yoksa e-postadan türet
            const usernameFromBackend = data.username; // Varsayılan olarak backend'den gelen username
            let usernameToSet;

            if (usernameFromBackend) {
                usernameToSet = usernameFromBackend;
            } else {
                // Eğer backend username dönmüyorsa, email'in '@' öncesini al
                const emailToUse = document.getElementById('email').value.trim();
                usernameToSet = emailToUse.split('@')[0];
            }
            
            if (usernameToSet) { // Kullanıcı adının boş olmadığından emin ol
                localStorage.setItem('loggedInUsername', usernameToSet); 
                console.log('--- GİRİŞ BAŞARILI DEBUG ---');
                console.log('Ayarlanan Kullanıcı Adı (localStorage):', localStorage.getItem('loggedInUsername'));
                console.log('Yönlendirme Başlatılıyor...');
                
                // Yönlendirme için daha belirgin bir setTimeout kullan (100-200ms)
                // Bu, localStorage'ın güncellenmesi ve dashboard.html'in bu değeri okuması için zaman tanır.
                setTimeout(() => {
                    window.location.href = '/dashboard.html'; 
                }, 200); 
            } else {
                console.error('Kullanıcı adı boş olduğu için localStorage ayarlanmadı. Yönlendirme yapılamadı.');
                showMessage('Giriş başarılı ama kullanıcı adı alınamadı. Lütfen tekrar deneyin.', 'error');
            }
        } else { // Kayıt başarılı ise
            console.log('Kayıt başarılı, giriş moduna geçiliyor...');
            setTimeout(() => {
                isRegisterMode = false;
                updateFormMode();
            }, 2000);
        }

    } catch (error) {
        console.error('Kimlik doğrulama işlemi hatası:', error);
        showMessage(error.message || 'Bir hata oluştu. Lütfen tekrar deneyin.', 'error');
    }
});

forgotPasswordForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMessage(forgotPasswordMessage);

    const email = forgotPasswordEmailInput?.value.trim();

    if (!email) {
        showMessage('Lütfen e-posta adresinizi girin.', 'error', forgotPasswordMessage);
        return;
    }

    try {
        console.log('Şifre sıfırlama API isteği başlatılıyor:', `${API_BASE_URL}/api/auth/forgot-password`, 'Email:', email);
        const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        console.log('Şifre sıfırlama API Yanıtı Geldi. Durum Kodu:', response.status);
        const data = await response.json();
        console.log('API Yanıt Verisi:', data);

        if (!response.ok) {
            throw new Error(data.message || 'Şifre sıfırlama isteği başarısız oldu.');
        }

        showMessage(data.message || 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.', 'success', forgotPasswordMessage);
        setTimeout(closeForgotPasswordModal, 3000);

    } catch (error) {
        console.error('Şifre sıfırlama hatası:', error);
        showMessage(error.message || 'Şifre sıfırlama isteği gönderilirken bir hata oluştu.', 'error', forgotPasswordMessage);
    }
});
