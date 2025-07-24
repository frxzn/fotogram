// frontend/public/js/dashboard.js - KULLANICI ADI VE YETKİSİZ ERİŞİM FİX

document.addEventListener('DOMContentLoaded', () => {
    // 1. localStorage'dan kullanıcı adını çek
    const loggedInUsername = localStorage.getItem('loggedInUsername');
    console.log('dashboard.js: localStorage.loggedInUsername değeri:', loggedInUsername); // DEBUG LOG

    // 2. Yetkisiz erişim kontrolü: Eğer kullanıcı adı yoksa, ana sayfaya yönlendir
    if (!loggedInUsername) {
        console.warn('dashboard.js: Kullanici giris yapmamis veya localStorage.loggedInUsername degeri bos. Ana sayfaya yonlendiriliyor.');
        window.location.href = '/index.html'; 
        return; // Yönlendirme yapıldıktan sonra kodun devam etmesini engelle
    }

    // 3. Kullanıcı adını göstereceğimiz HTML elementini seç
    // Bu ID'nin dashboard.html dosyasındaki HTML elementinin ID'si ile aynı olduğundan emin ol!
    const welcomeMessageElement = document.getElementById('welcomeMessage'); 

    // 4. Eğer kullanıcı adı varsa ve HTML elementi mevcutsa, karşılama mesajını güncelle
    if (loggedInUsername && welcomeMessageElement) {
        welcomeMessageElement.textContent = `Hoş Geldin, ${loggedInUsername}!`;
        console.log(`dashboard.js: Karşılama mesajı güncellendi: Hoş Geldin, ${loggedInUsername}!`); // DEBUG LOG
    } else if (!welcomeMessageElement) {
        console.error("dashboard.js: 'welcomeMessage' ID'li element bulunamadı. Lütfen dashboard.html'i kontrol edin.");
    }

    // 5. Logout butonuna tıklama olayını dinle
    const logoutButton = document.getElementById('logoutButton'); 
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('loggedInUsername'); // Kullanıcı adını localStorage'dan sil
            // Eğer JWT token da saklıyorsan, onu da silmelisin:
            // localStorage.removeItem('jwtToken'); 
            console.log('dashboard.js: Kullanici cikis yapti, ana sayfaya yonlendiriliyor.');
            window.location.href = '/index.html'; // Ana sayfaya yönlendir
        });
    } else {
        console.warn("dashboard.js: 'logoutButton' elementi bulunamadı. Lütfen dashboard.html'i kontrol edin.");
    }
});
