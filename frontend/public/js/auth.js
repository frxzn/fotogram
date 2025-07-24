// Auth modal elemanları
const authModal = document.getElementById('authModal');
const authTitle = document.getElementById('authTitle');
const authForm = document.getElementById('authForm');
const closeButtons = document.querySelectorAll('.close-button');
const usernameGroup = document.getElementById('usernameGroup');
const confirmPasswordGroup = document.getElementById('confirmPasswordGroup');
const submitButton = document.getElementById('submitButton');
const toggleLinks = document.getElementById('toggleLinks');
const showRegisterLink = document.getElementById('showRegister');
const showLoginLink = document.getElementById('showLogin');
const messageDiv = document.getElementById('message');

// Forgot Password Modal elemanları
const forgotPasswordModal = document.getElementById('forgotPasswordModal');
const forgotPasswordForm = document.getElementById('forgotPasswordForm');
const forgotPasswordEmailInput = document.getElementById('forgotPasswordEmail');
const forgotPasswordSubmitButton = document.getElementById('forgotPasswordSubmitButton');
const forgotPasswordMessageDiv = document.getElementById('forgotPasswordMessage');
const forgotPasswordLink = document.getElementById('forgotPasswordLink');

let isRegisterMode = false; // Varsayılan olarak giriş modu

// Modalı açan fonksiyon
function openAuthModal(mode) {
    if (mode === 'register') {
        authTitle.textContent = 'Kayıt Ol';
        usernameGroup.style.display = 'block';
        confirmPasswordGroup.style.display = 'block';
        submitButton.textContent = 'Kayıt Ol';
        showRegisterLink.style.display = 'none';
        showLoginLink.style.display = 'inline-block';
        isRegisterMode = true;
    } else { // 'login'
        authTitle.textContent = 'Giriş Yap';
        usernameGroup.style.display = 'none';
        confirmPasswordGroup.style.display = 'none';
        submitButton.textContent = 'Giriş Yap';
        showRegisterLink.style.display = 'inline-block';
        showLoginLink.style.display = 'none';
        isRegisterMode = false;
    }
    messageDiv.style.display = 'none'; // Yeni modda mesajı gizle
    authModal.style.display = 'flex'; // Modalı göster
    authForm.reset(); // Formu temizle
}

// Modalı kapatan fonksiyon
function closeAuthModal() {
    authModal.style.display = 'none';
    forgotPasswordModal.style.display = 'none'; // Şifre sıfırlama modalını da kapat
    messageDiv.style.display = 'none';
    forgotPasswordMessageDiv.style.display = 'none';
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Tüm kapatma butonları için event listener
    closeButtons.forEach(button => {
        button.addEventListener('click', closeAuthModal);
    });

    // Modal dışına tıklayınca kapatma
    window.addEventListener('click', (event) => {
        if (event.target === authModal || event.target === forgotPasswordModal) {
            closeAuthModal();
        }
    });

    // Kayıt Ol linki
    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        openAuthModal('register');
    });

    // Giriş Yap linki
    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        openAuthModal('login');
    });

    // Şifremi Unuttum linki
    forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        closeAuthModal(); // Auth modalı kapat
        forgotPasswordModal.style.display = 'flex'; // Şifre sıfırlama modalını aç
        forgotPasswordForm.reset();
        forgotPasswordMessageDiv.style.display = 'none';
    });

    // Auth Formu submit eventi
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const username = document.getElementById('username').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        let url = '';
        let body = {};

        if (isRegisterMode) {
            if (password !== confirmPassword) {
                messageDiv.textContent = 'Şifreler uyuşmuyor!';
                messageDiv.style.display = 'block';
                messageDiv.className = 'message error';
                return;
            }
            url = 'https://fotogram-backend-04a11b61b369.herokuapp.com/api/auth/register';
            body = { username, email, password };
        } else {
            url = 'https://fotogram-backend-04a11b61b369.herokuapp.com/api/auth/login';
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

            if (response.ok) {
                const data = await response.json();
                messageDiv.textContent = data.message;
                messageDiv.style.display = 'block';
                messageDiv.className = 'message success';

                const usernameToSet = email.split('@')[0]; // Kullanıcı adını e-postadan türet
                localStorage.setItem('loggedInUsername', usernameToSet); // localStorage'a kaydet
                console.log('Login successful. localStorage.loggedInUsername ayarlandi:', usernameToSet); // DEBUG MESAJI

                closeAuthModal(); // Modalı kapat
                window.location.href = '/dashboard.html'; // Dashboard'a yönlendir
            } else {
                const errorData = await response.json();
                messageDiv.textContent = errorData.message || 'Bir hata oluştu.';
                messageDiv.style.display = 'block';
                messageDiv.className = 'message error';
                console.error('API istegi basarisiz oldu:', errorData.message); // DEBUG MESAJI
            }
        } catch (error) {
            console.error('Network error or API call failed:', error); // DEBUG MESAJI
            messageDiv.textContent = 'Sunucuya bağlanılamadı. Lütfen daha sonra tekrar deneyin.';
            messageDiv.style.display = 'block';
            messageDiv.className = 'message error';
        }
    });

    // Forgot Password Formu submit eventi
    forgotPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = forgotPasswordEmailInput.value;
        const url = 'https://fotogram-backend-04a11b61b369.herokuapp.com/api/auth/forgot-password';

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            if (response.ok) {
                const data = await response.json();
                forgotPasswordMessageDiv.textContent = data.message;
                forgotPasswordMessageDiv.style.display = 'block';
                forgotPasswordMessageDiv.className = 'message success';
                forgotPasswordForm.reset();
            } else {
                const errorData = await response.json();
                forgotPasswordMessageDiv.textContent = errorData.message || 'Bir hata oluştu.';
                forgotPasswordMessageDiv.style.display = 'block';
                forgotPasswordMessageDiv.className = 'message error';
            }
        } catch (error) {
            console.error('Network error or API call failed for forgot password:', error);
            forgotPasswordMessageDiv.textContent = 'Sunucuya bağlanılamadı. Lütfen daha sonra tekrar deneyin.';
            forgotPasswordMessageDiv.style.display = 'block';
            forgotPasswordMessageDiv.className = 'message error';
        }
    });
});

// openAuthModal fonksiyonunu global scope'a taşıma (main.js'den erişim için)
window.openAuthModal = openAuthModal;
