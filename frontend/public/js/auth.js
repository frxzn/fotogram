// frontend/public/js/auth.js - GÜNCEL VE SON VERSİYON

// BURADAKİ URL'Yİ KENDİ BACKEND URL'N İ İLE DEĞİŞTİR!!!
// Lütfen buraya Render dashboard'undaki "fotogram-backend" servisinin Public URL'sini yapıştır.
const API_BASE_URL = 'https://fotogram-backend.onrender.com'; // Örn: 'https://fotogram-backend-abcdef.onrender.com' veya 'https://fotogram-backend-04a11b61b369.herokuapp.com'

// DOM elementleri
const authModal = document.getElementById('authModal');
const authForm = document.getElementById('authForm');
const showRegisterLink = document.getElementById('showRegister');
const showLoginLink = document.getElementById('showLogin');
const authTitle = document.getElementById('authTitle');
const submitButton = document.getElementById('submitButton');
const toggleLinks = document.getElementById('toggleLinks'); 
const messageDisplay = document.getElementById('message'); // Auth modal mesaj alanı
const usernameGroup = document.getElementById('usernameGroup');
const confirmPasswordGroup = document.getElementById('confirmPasswordGroup');
const forgotPasswordLink = document.getElementById('forgotPasswordLink');

// Şifremi Unuttum Modalı için gerekli DOM elementleri
const forgotPasswordModal = document.getElementById('forgotPasswordModal');
const forgotPasswordForm = document.getElementById('forgotPasswordForm');
const forgotPasswordEmailInput = document.getElementById('forgotPasswordEmail');
const forgotPasswordMessage = document.getElementById('forgotPasswordMessage'); // Şifremi unuttum modalı mesaj alanı

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

function openModal(mode = 'login') { // Varsayılan olarak login modunda açılsın
    isRegisterMode = (mode === 'register');
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
    // Auth modal kapatılırken şifremi unuttum modalı da kapansın
    closeForgotPasswordModal(); 
}

function openForgotPasswordModal() {
    if (forgotPasswordModal) {
        forgotPasswordModal.style.display = 'flex';
    }
    clearMessage(forgotPasswordMessage); // Şifremi unuttum modalındaki mesajı temizle
    forgotPasswordForm?.reset(); // Şifremi unuttum formunu sıfırla
    closeModal(); // Ana auth modal açıksa kapat (önce ana modal kapanır, sonra şifre unuttum açılır)
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
        openModal('register'); // "Şimdi Kayıt Ol" butonu kayıt modunda açsın
    });
    openAuthModalButtonSecondary?.addEventListener('click', () => {
        openModal('login'); // "Giriş Yap" butonu giriş modunda açsın
    });

    // SADECE AUTH MODAL İÇİN KAPATMA BUTONU VE ARKA PLAN TIKLAMASI
    const authModalCloseButton = document.querySelector('#authModal .close-button');
    if (authModalCloseButton) {
        authModalCloseButton.addEventListener('click', closeModal);
    }
    
    authModal?.addEventListener('click', (e) => {
        if (e.target === authModal) {
            closeModal();
        }
    });

    // SADECE FORGOT PASSWORD MODAL İÇİN KAPATMA BUTONU VE ARKA PLAN TIKLAMASI
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

    // Şifremi Unuttum linkine ekstra stopPropagation eklendi (daha önceki deneme, burada kalabilir)
    forgotPasswordLink?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation(); // Olayın yayılmasını engelle
        openForgotPasswordModal();
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
            showMessage('Şifreler eşleşmiyor!', 'error'); 
            return;
        }
        // Şifre uzunluk kontrolü
        if (password.length < 6) {
            showMessage('Şifre en az 6 karakter olmalıdır.', 'error');
            return;
        }
        
        requestBody = { username, email, password }; // confirmPassword backend'e gönderilmez
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
        console.log('API İsteği Başlatılıyor:', apiUrl, 'Body:', requestBody); // DEBUG MESAJI
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        console.log('API Yanıtı Geldi. Durum Kodu:', response.status); // DEBUG MESAJI
        const data = await response.json();
        console.log('API Yanıt Verisi:', data); // DEBUG MESAJI

        if (!response.ok) {
            // Backend'den gelen hata mesajını göster
            throw new Error(data.message || errorMessage);
        }

        showMessage(data.message || successMessage, 'success');

        if (!isRegisterMode) { // Sadece giriş modunda localStorage'a kullanıcı adı kaydet
            const emailToUse = document.getElementById('email').value.trim(); // E-posta alanından değeri al
            const usernameToSet = emailToUse.split('@')[0]; // E-postadan kullanıcı adını türet

            if (usernameToSet) { // Kullanıcı adının boş olmadığından emin ol
                localStorage.setItem('loggedInUsername', usernameToSet); 
                console.log('--- GİRİŞ BAŞARILI DEBUG ---');
                console.log('Ayarlanan Kullanıcı Adı:', usernameToSet);
                console.log('localStorage.loggedInUsername (Hemen Sonra):', localStorage.getItem('loggedInUsername'));
                console.log('Yönlendirme Başlatılıyor...');
                
                // Yönlendirme için daha belirgin bir setTimeout kullan (200ms)
                // Bu, tarayıcının localStorage'ı işlemesi ve navigasyon yapması için yeterli zaman tanır.
                setTimeout(() => {
                    window.location.href = '/dashboard.html'; 
                }, 200); 
            } else {
                console.error('Kullanıcı adı boş olduğu için localStorage ayarlanmadı. Yönlendirme yapılamadı.');
                showMessage('Giriş başarılı ama kullanıcı adı alınamadı. Lütfen tekrar deneyin.', 'error');
            }
        } else { // Kayıt başarılı ise
            console.log('Kayıt başarılı, giriş moduna geçiliyor...'); // DEBUG MESAJI
            // Kayıt başarılı ise kullanıcıya bilgi ver ve giriş moduna geçmesi için biraz bekle
            setTimeout(() => {
                isRegisterMode = false; // Giriş moduna geç
                updateFormMode();
            }, 2000); // 2 saniye sonra giriş moduna geç
        }

    } catch (error) {
        console.error('Kimlik doğrulama işlemi hatası:', error); // DEBUG MESAJI
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
        console.log('Şifre sıfırlama API isteği başlatılıyor:', `${API_BASE_URL}/api/auth/forgot-password`, 'Email:', email); // DEBUG MESAJI
        const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        console.log('Şifre sıfırlama API Yanıtı Geldi. Durum Kodu:', response.status); // DEBUG MESAJI
        const data = await response.json();
        console.log('Şifre sıfırlama API Yanıt Verisi:', data); // DEBUG MESAJI

        if (!response.ok) {
            throw new Error(data.message || 'Şifre sıfırlama isteği başarısız oldu.');
        }

        showMessage(data.message || 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.', 'success', forgotPasswordMessage);
        setTimeout(closeForgotPasswordModal, 3000); // 3 saniye sonra modalı kapat

    } catch (error) {
        console.error('Şifre sıfırlama hatası:', error); // DEBUG MESAJI
        showMessage(error.message || 'Şifre sıfırlama isteği gönderilirken bir hata oluştu.', 'error', forgotPasswordMessage);
    }
});
