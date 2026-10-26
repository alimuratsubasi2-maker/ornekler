// Gülüş Diş Kliniği demo modu: mobil menü, gece modu ve randevu formu.
(function () {
  var header = document.getElementById('header');
  var toggle = document.querySelector('[data-aw-toggle-menu]');
  var nav = document.querySelector('#header nav');
  var last = document.querySelector('#header > div > div:last-child');
  if (toggle) toggle.addEventListener('click', function () {
    var on = toggle.classList.toggle('expanded');
    toggle.setAttribute('aria-expanded', String(on));
    document.body.classList.toggle('overflow-hidden', on);
    ['h-screen', 'expanded', 'bg-page'].forEach(function (c) { header && header.classList.toggle(c, on); });
    nav && nav.classList.toggle('hidden', !on);
    last && last.classList.toggle('hidden', !on);
  });
  if (nav) nav.addEventListener('click', function (e) {
    if (e.target.closest('a') && toggle && toggle.classList.contains('expanded')) toggle.click();
  });

  try { if (localStorage.theme === 'dark') document.documentElement.classList.add('dark'); } catch (e) {}
  document.querySelectorAll('[data-aw-toggle-color-scheme]').forEach(function (b) {
    b.addEventListener('click', function () {
      var dark = document.documentElement.classList.toggle('dark');
      try { localStorage.theme = dark ? 'dark' : 'light'; } catch (e) {}
    });
  });

  document.querySelectorAll('form').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var ad = (f.querySelector('input[name=name], input[type=text]') || {}).value || '';
      var box = document.createElement('div');
      box.style.cssText = 'text-align:center;padding:40px 20px';
      box.innerHTML = '<div style="width:64px;height:64px;border-radius:50%;background:#16a34a;color:#fff;font-size:34px;line-height:64px;margin:0 auto 16px">✓</div>' +
        '<h3 style="font-size:24px;font-weight:700;margin:0 0 8px">Talebiniz alındı' + (ad ? ', ' + ad.replace(/</g, '') : '') + '!</h3>' +
        '<p style="opacity:.75;margin:0">Hasta danışmanımız en geç 1 saat içinde sizi arayarak randevu saatinizi kesinleştirecek.</p>';
      f.replaceWith(box);
    });
  });
})();
