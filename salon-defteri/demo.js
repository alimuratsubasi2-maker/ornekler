// Salon Defteri demo modu: giriş/kayıt formları demo panele götürür, paket butonları kayda.
(function () {
  var BASE = '/ornekler/salon-defteri';
  var giris = /sign-in/.test(location.pathname), kayit = /sign-up/.test(location.pathname);

  document.querySelectorAll('form').forEach(function (f) {
    var email = f.querySelector('input[type=email]');
    if (email) {
      f.removeAttribute('action');
      if (giris) {
        email.value = 'demo@salondefteri.com';
        var pw = f.querySelector('input[type=password]'); if (pw) pw.value = 'demo1234';
        var n = document.createElement('p');
        n.style.cssText = 'font-size:13px;color:#be123c;background:#fff1f2;border-radius:10px;padding:10px 12px;margin:0 0 4px';
        n.textContent = 'Demo hesabı hazır: “Giriş yap”a basmanız yeterli.';
        f.insertBefore(n, f.firstChild);
      }
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        try { localStorage.setItem('salon-kullanici', email.value); } catch (err) {}
        location.href = BASE + '/panel/' + (kayit ? '?yeni=1' : '');
      });
    } else {
      // Fiyatlar sayfası: "Ücretsiz Denemeyi Başlat"
      f.removeAttribute('action');
      f.addEventListener('submit', function (e) { e.preventDefault(); location.href = BASE + '/sign-up/'; });
    }
  });
})();
