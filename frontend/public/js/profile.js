// frontend/public/js/profile.js

document.addEventListener('DOMContentLoaded', () => {
    const profileUsernameElement = document.getElementById('profileUsername');
    const profileEmailElement = document.getElementById('profileEmail');
    const logoutButton = document.getElementById('logoutButton');
    const editProfileButton = document.getElementById('editProfileButton'); // Henüz fonksiyonel değil

    // Kullanıcı bilgilerini localStorage'dan al ve sayfaya yansıt
    const loadUserProfile = () => {
        const userString = localStorage.getItem('user');
        if (userString) {
            try {
                const user = JSON.parse(userString);
                // Kullanıcı adı ve e-postayı göster
                profileUsernameElement.textContent = `Hoş Geldin, ${user.username || user.email}!`;
                profileEmailElement.textContent = `E-posta: ${user.email || 'Bilgi Yok'}`;
            } catch (e) {
                console.error("localStorage'dan kullanıcı bilgisi ayrıştırılamadı:", e);
                // Hata durumunda da yönlendirme yap
                redirectToLogin();
            }
        } else {
            // Kullanıcı bilgisi yoksa giriş sayfasına yönlendir
            redirectToLogin();
        }
    };

    // Giriş sayfasına yönlendirme fonksiyonu
    const redirectToLogin = () => {
        // console.log('Giriş yapılmamış veya geçersiz kullanıcı. index.html e yönlendiriliyor.');
        window.location.href = '/index.html';
    };

    // Sayfa yüklendiğinde kullanıcı profilini yükle
    loadUserProfile();

    // Çıkış Yap butonu olay dinleyicisi
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            // console.log('Çıkış yap butonuna basıldı. localStorage temizleniyor...');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // Çıkış yaptıktan sonra giriş sayfasına yönlendir
            setTimeout(() => {
                redirectToLogin();
            }, 50); // Küçük bir gecikme ile yönlendir
        });
    }

    // "Profili Düzenle" butonu için şimdilik bir placeholder alert
    if (editProfileButton) {
        editProfileButton.addEventListener('click', () => {
            alert('Profil düzenleme özelliği yakında gelecek!');
            // Buraya daha sonra /settings.html sayfasına yönlendirme veya bir modal açma eklenebilir
        });
    }
});
