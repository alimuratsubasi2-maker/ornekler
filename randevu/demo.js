// NovaDijital randevu demo modu: takvim, boş saatler ve randevu oluşturma tarayıcıda çalışır.
(function () {
  var dayBtns = document.querySelectorAll('[data-testid=day]');
  if (!dayBtns.length) return;

  var AYLAR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  var GUN = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
  var GUN_UZUN = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  var KEY = 'novadijital-randevular';
  var title = (document.querySelector('h1') || {}).textContent || 'Görüşme';
  var dur = parseInt((document.body.textContent.match(/(\d+)\s*dakika/) || [0, 30])[1], 10);
  var notice = /teklif/.test(location.pathname) ? 24 * 60 : 4 * 60; // dakika
  var BASE_CLS = dayBtns[0].className.split(' ').filter(function (c) {
    return ['hover:border-brand-default', 'text-emphasis', 'bg-emphasis', 'bg-brand-default', 'text-brand'].indexOf(c) < 0;
  }).join(' ');

  var grid = dayBtns[0].closest('.grid');
  var label = document.querySelector('[data-testid=selected-month-label]');
  var prev = document.querySelector('[data-testid=decrementMonth]');
  var next = document.querySelector('[data-testid=incrementMonth]');
  var timeBtn = document.querySelector('[data-testid=time]');
  var timeList = timeBtn && timeBtn.parentNode;
  var timeTpl = timeBtn && timeBtn.cloneNode(true);
  var head = timeList && timeList.parentNode.querySelector('header .text-emphasis') ||
    document.querySelector('header span.text-emphasis');
  var h12 = false;

  var today = new Date(); today.setHours(0, 0, 0, 0);
  var view = new Date(today.getFullYear(), today.getMonth(), 1);
  var selected = null;

  function booked() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
  function hours(d) { var w = d.getDay(); return w === 0 ? null : w === 6 ? [10, 14] : [10, 18]; }
  function key(d, m) { return d.toDateString() + ' ' + m; }
  function slots(d) {
    var h = hours(d); if (!h) return [];
    var out = [], now = new Date(), taken = booked();
    for (var m = h[0] * 60; m + dur <= h[1] * 60; m += dur) {
      var t = new Date(d); t.setHours(0, m, 0, 0);
      if (t - now < notice * 60000) continue;
      if (taken.indexOf(key(d, m)) >= 0) continue;
      out.push(m);
    }
    return out;
  }
  function fmt(m) {
    var h = Math.floor(m / 60), mm = ('0' + (m % 60)).slice(-2);
    if (!h12) return ('0' + h).slice(-2) + ':' + mm;
    return ((h + 11) % 12 + 1) + ':' + mm + (h < 12 ? 'öö' : 'ös');
  }

  function renderMonth() {
    label.innerHTML = '<strong class="text-emphasis font-semibold">' + AYLAR[view.getMonth()] + '</strong> <span class="text-subtle font-medium">' + view.getFullYear() + '</span>';
    prev.disabled = view <= new Date(today.getFullYear(), today.getMonth(), 1);
    var cells = [], first = view.getDay(), days = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
    for (var i = 0; i < first; i++) cells.push('<div class="relative w-full pt-[100%]"><div></div></div>');
    for (var d = 1; d <= days; d++) {
      var date = new Date(view.getFullYear(), view.getMonth(), d);
      var ok = slots(date).length > 0, sel = selected && date.getTime() === selected.getTime();
      var cls = BASE_CLS + (sel ? ' bg-brand-default text-brand' : ok ? ' hover:border-brand-default text-emphasis bg-emphasis' : '');
      var dot = date.getTime() === today.getTime() ? '<span class="absolute left-1/2 top-1/2 flex h-[5px] w-[5px] -translate-x-1/2 translate-y-[8px] items-center justify-center rounded-full align-middle sm:translate-y-[12px] bg-brand-accent"></span>' : '';
      cells.push('<div class="relative w-full pt-[100%]"><button type="button" class="' + cls + '" data-testid="day" data-d="' + d + '" data-disabled="' + !ok + '"' + (ok ? '' : ' disabled') + '>' + d + dot + '</button></div>');
    }
    grid.innerHTML = cells.join('');
    grid.querySelectorAll('button[data-d]').forEach(function (b) {
      b.onclick = function () { selected = new Date(view.getFullYear(), view.getMonth(), +b.getAttribute('data-d')); renderMonth(); renderTimes(); };
    });
  }

  function renderTimes() {
    if (!timeList) return;
    if (head && selected) head.innerHTML = '<span class="!text-default">' + GUN[selected.getDay()] + '</span> <span class="inline-flex items-center justify-center rounded-3xl px-1 pt-0.5 font-medium text-default text-sm">' + selected.getDate() + '</span>';
    timeList.innerHTML = '';
    var list = selected ? slots(selected) : [];
    if (!list.length) { timeList.innerHTML = '<p class="text-subtle text-sm">' + (selected ? 'Bu gün için boş saat kalmadı.' : 'Lütfen bir gün seçin.') + '</p>'; return; }
    list.forEach(function (m) {
      var b = timeTpl.cloneNode(true);
      var inner = b.querySelector('.flex.items-center') || b;
      inner.textContent = fmt(m);
      b.onclick = function () { form(m); };
      timeList.appendChild(b);
    });
  }

  function pickFirst() {
    for (var i = 0; i < 90; i++) {
      var d = new Date(today); d.setDate(d.getDate() + i);
      if (slots(d).length) { selected = d; view = new Date(d.getFullYear(), d.getMonth(), 1); return; }
    }
  }

  var css = document.createElement('style');
  css.textContent = '.dm-back{position:fixed;inset:0;background:rgba(17,24,39,.45);z-index:2147483640;display:flex;align-items:center;justify-content:center;padding:16px}' +
    '.dm-modal{background:#fff;border-radius:16px;width:min(460px,100%);max-height:92vh;overflow:auto;padding:28px;font:15px/1.5 Inter,system-ui,sans-serif;color:#111827;box-shadow:0 20px 50px rgba(0,0,0,.25)}' +
    '.dm-modal h2{font-size:20px;font-weight:700;margin:0 0 4px}.dm-modal .s{color:#6b7280;margin:0 0 18px;font-size:14px}' +
    '.dm-modal label{display:block;font-size:13px;font-weight:600;margin:12px 0 4px}' +
    '.dm-modal input,.dm-modal textarea{width:100%;box-sizing:border-box;border:1px solid #d1d5db;border-radius:8px;padding:10px 12px;font:inherit}' +
    '.dm-modal .row{display:flex;gap:10px;margin-top:20px}.dm-modal button{flex:1;height:42px;border-radius:10px;font:600 14px Inter,system-ui,sans-serif;cursor:pointer;border:1px solid #d1d5db;background:#fff}' +
    '.dm-modal button.p{background:#292929;color:#fff;border-color:#292929}' +
    '.dm-modal .ok{width:56px;height:56px;border-radius:50%;background:#16a34a;color:#fff;font-size:30px;line-height:56px;text-align:center;margin:0 auto 14px}' +
    '.dm-modal .card{background:#f9fafb;border-radius:10px;padding:14px;margin:16px 0;font-size:14px}';
  document.head.appendChild(css);

  function form(m) {
    var when = GUN_UZUN[selected.getDay()] + ', ' + selected.getDate() + ' ' + AYLAR[selected.getMonth()] + ' ' + selected.getFullYear() + ' · ' + fmt(m) + ' – ' + fmt(m + dur);
    var b = document.createElement('div'); b.className = 'dm-back';
    b.innerHTML = '<form class="dm-modal"><h2>' + title + '</h2><p class="s">' + when + ' (İstanbul)</p>' +
      '<label>Adınız Soyadınız</label><input required name="ad">' +
      '<label>E-posta</label><input required type="email" name="mail">' +
      '<label>Telefon</label><input type="tel" placeholder="05xx xxx xx xx">' +
      '<label>Projenizden kısaca bahsedin</label><textarea rows="3" placeholder="Örn. kafem için web sitesi ve online menü"></textarea>' +
      '<div class="row"><button type="button" data-x>Geri</button><button class="p" type="submit">Randevuyu onayla</button></div></form>';
    document.body.appendChild(b);
    b.querySelector('[data-x]').onclick = function () { b.remove(); };
    b.addEventListener('click', function (e) { if (e.target === b) b.remove(); });
    b.querySelector('form').onsubmit = function (e) {
      e.preventDefault();
      var ad = b.querySelector('[name=ad]').value, mail = b.querySelector('[name=mail]').value;
      try { var t = booked(); t.push(key(selected, m)); localStorage.setItem(KEY, JSON.stringify(t)); } catch (err) {}
      b.innerHTML = '<div class="dm-modal" style="text-align:center"><div class="ok">✓</div><h2>Randevunuz oluşturuldu</h2>' +
        '<p class="s">Onay ve takvim daveti <b>' + mail.replace(/</g, '') + '</b> adresine gönderildi.</p>' +
        '<div class="card" style="text-align:left"><b>' + title + '</b><br>' + when + '<br>Katılımcı: ' + ad.replace(/</g, '') + '<br>Konum: Google Meet (link e-postada)</div>' +
        '<p class="s" style="font-size:12px">Görüşmeden 1 saat önce hatırlatma gönderilir.</p>' +
        '<div class="row"><button class="p" data-x>Tamam</button></div></div>';
      b.querySelector('[data-x]').onclick = function () { b.remove(); renderMonth(); renderTimes(); };
    };
  }

  prev.onclick = function () { view = new Date(view.getFullYear(), view.getMonth() - 1, 1); renderMonth(); };
  next.onclick = function () { view = new Date(view.getFullYear(), view.getMonth() + 1, 1); renderMonth(); };
  document.querySelectorAll('[data-testid^=toggle-group-item-h]').forEach(function (t) {
    t.onclick = function () {
      h12 = t.getAttribute('data-testid') === 'toggle-group-item-h:mma';
      document.querySelectorAll('[data-testid^=toggle-group-item-h]').forEach(function (x) {
        var on = x === t; x.setAttribute('aria-checked', on); x.setAttribute('data-state', on ? 'on' : 'off');
      });
      renderTimes();
    };
  });

  pickFirst(); renderMonth(); renderTimes();
})();
