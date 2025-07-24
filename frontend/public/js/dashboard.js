// frontend/public/js/dashboard.js

document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.getElementById('logoutButton');
    const welcomeUserSpan = document.getElementById('welcomeUser');
    const displayUsernameSpan = document.getElementById('displayUsername');

    // Kullanıcının oturum açıp açmadığını kontrol et
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user')); // Kullanıcı bilgilerini al

    if (!token || !user) {
        // Token veya kullanıcı bilgisi yoksa giriş sayfasına yönlendir
        window.location.href = '/index.html';
        return; // Kodu daha fazla çalıştırma
    }

    // Kullanıcı adını göster
    if (welcomeUserSpan) {
        welcomeUserSpan.textContent = `Hoş Geldin, ${user.username}!`;
    }
    if (displayUsernameSpan) {
        displayUsernameSpan.textContent = user.username;
    }

    // Çıkış yap butonu dinleyicisi
    logoutButton?.addEventListener('click', () => {
        // Local Storage'dan token ve kullanıcı bilgilerini sil
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Giriş sayfasına yönlendir
        window.location.href = '/index.html';
    });
});
