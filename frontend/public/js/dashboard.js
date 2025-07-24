// frontend/public/js/dashboard.js - YENİ VE GÜNCEL KONTROLCÜ

document.addEventListener('DOMContentLoaded', () => {
    console.log('dashboard.js yüklendi.');

    // 1. Yetkilendirme Kontrolü (Sayfa Yüklendiğinde İlk Yapılacak İşlem)
    const loggedInUsername = localStorage.getItem('loggedInUsername');
    console.log('dashboard.js: localStorage.loggedInUsername değeri:', loggedInUsername);

    if (!loggedInUsername) {
        // Eğer kullanıcı adı localStorage'da yoksa veya boşsa, giriş yapmamış demektir.
        console.warn('dashboard.js: Kullanici giris yapmamis veya localStorage.loggedInUsername degeri bos. index.html e yonlendiriliyor.');
        window.location.href = '/index.html'; 
        return; // Yönlendirme yapıldığı için kodun geri kalanını çalıştırma
    }

    // 2. Kullanıcı Adını Yansıtma (Sadece Kullanıcı Giriş Yapmışsa Çalışacak)
    const usernameDisplayElement = document.getElementById('usernameDisplay'); // dashboard.html'deki h2 elementinin ID'si
    if (usernameDisplayElement) {
        usernameDisplayElement.textContent = `Hoş Geldin, ${loggedInUsername}!`;
        console.log(`dashboard.js: Karşılama mesajı güncellendi: Hoş Geldin, ${loggedInUsername}!`);
    } else {
        console.error("dashboard.js: 'usernameDisplay' ID'li element dashboard.html'de bulunamadı. Lütfen kontrol edin.");
    }

    // 3. Çıkış Yap Butonu İşlevselliği
    const logoutButton = document.getElementById('logoutButton'); // dashboard.html'deki çıkış yap butonunun ID'si
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault(); // Linkin varsayılan davranışını engelle
            console.log('dashboard.js: Çıkış yap butonuna basildi. localStorage temizleniyor...');
            localStorage.removeItem('loggedInUsername'); // Kullanıcı adını localStorage'dan sil
            // Eğer bir JWT token da saklıyorsan, onu da silmelisin:
            // localStorage.removeItem('jwtToken'); 

            // Kısa bir gecikme sonrası index.html'e yönlendir (localStorage'ın güncellenmesi için)
            setTimeout(() => {
                console.log('dashboard.js: index.html e yonlendiriliyor. localStorage.loggedInUsername şimdi:', localStorage.getItem('loggedInUsername'));
                window.location.href = '/index.html';
            }, 50); 
        });
    } else {
        console.warn("dashboard.js: 'logoutButton' ID'li element dashboard.html'de bulunamadı. Lütfen kontrol edin.");
    }

    // Buraya gelecekte dashboard'a özgü diğer JS kodları eklenecek
    // Örneğin, fotoğraf yükleme, feed'i dinamik olarak doldurma, vs.
});
