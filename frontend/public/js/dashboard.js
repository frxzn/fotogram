// frontend/public/js/dashboard.js - Kullanıcı Adı Yansıtma Fix

document.addEventListener('DOMContentLoaded', () => {
    // 1. localStorage'dan kullanıcı adını çek
    const loggedInUsername = localStorage.getItem('loggedInUsername');
    console.log('dashboard.js: localStorage.loggedInUsername değeri:', loggedInUsername); // DEBUG LOG

    // 2. Kullanıcı adını göstereceğimiz HTML elementini seç
    // Bu ID'nin dashboard.html dosyasındaki HTML elementinin ID'si ile aynı olduğundan emin ol!
    const welcomeMessageElement = document.getElementById('welcomeMessage'); // veya 'usernameDisplay' eğer HTML'de bu ID'yi kullanıyorsan

    // 3. Eğer kullanıcı adı varsa, karşılama mesajını güncelle
    if (loggedInUsername && welcomeMessageElement) {
        welcomeMessageElement.textContent = `Hoş Geldin, ${loggedInUsername}!`;
        console.log(`dashboard.js: Karşılama mesajı güncellendi: Hoş Geldin, ${loggedInUsername}!`); // DEBUG LOG
    } else {
        console.warn('dashboard.js: Kullanıcı adı bulunamadı veya welcomeMessageElement elementi yok. Yönlendirme kontrol ediliyor.'); // DEBUG LOG
        // Eğer kullanıcı adı yoksa veya welcomeMessageElement yoksa, kullanıcıyı ana sayfaya yönlendir (güvenlik)
        // Bu kısım login.js ve index.html'deki yönlendirme mantığıyla uyumlu olmalı.
        // Güvenlik amacıyla, bu kontrolü burada tutmak önemlidir.
        if (!loggedInUsername) {
            console.log('dashboard.js: Kullanici giris yapmamis, ana sayfaya yonlendiriliyor.');
            window.location.href = '/index.html'; 
        }
    }

    // Logout butonuna tıklama olayını dinle
    const logoutButton = document.getElementById('logoutButton'); // dashboard.html içinde logout butonunun id'si 'logoutButton' olmalı
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('loggedInUsername'); // Kullanıcı adını localStorage'dan sil
            localStorage.removeItem('jwtToken'); // Eğer token da saklanıyorsa onu da sil
            console.log('dashboard.js: Kullanici cikis yapti, ana sayfaya yonlendiriliyor.');
            window.location.href = '/index.html'; // Ana sayfaya yönlendir
        });
    } else {
        console.warn("dashboard.js: 'logoutButton' elementi bulunamadı. Lütfen dashboard.html'i kontrol edin.");
    }
});
