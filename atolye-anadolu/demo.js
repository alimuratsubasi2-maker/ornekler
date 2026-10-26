// Atölye Anadolu demo modu: sepet, ödeme ve sipariş tarayıcıda (localStorage) çalışır.
(function () {
  var BASE = '/ornekler/atolye-anadolu/tr';
  var KEY = 'atolye-sepet', ORDERS = 'atolye-siparisler';

  function load(k) { try { return JSON.parse(localStorage.getItem(k)) || []; } catch (e) { return []; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function tl(n) { return '₺' + n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function count() { return load(KEY).reduce(function (s, i) { return s + i.qty; }, 0); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  var css = document.createElement('style');
  css.textContent =
    '.dm-toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:#111;color:#fff;padding:12px 18px;border-radius:10px;font:500 14px/1.4 system-ui,sans-serif;z-index:2147483646;box-shadow:0 8px 24px rgba(0,0,0,.2);max-width:90vw}' +
    '.dm-toast a{color:#fff;text-decoration:underline;margin-left:10px}' +
    '.dm-back{position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:2147483640;display:flex;justify-content:flex-start}' +
    '.dm-drawer{background:#fff;width:min(320px,85vw);height:100%;padding:28px 24px;font:16px/1.5 system-ui,sans-serif;display:flex;flex-direction:column;gap:18px}' +
    '.dm-drawer a{color:#111;text-decoration:none;font-size:22px}' +
    '.dm-modal{background:#fff;margin:auto;border-radius:14px;padding:28px;width:min(440px,92vw);max-height:90vh;overflow:auto;font:15px/1.5 system-ui,sans-serif;color:#111}' +
    '.dm-wrap{max-width:1100px;margin:0 auto;padding:40px 24px 80px;font:15px/1.5 system-ui,sans-serif;color:#111}' +
    '.dm-wrap h1{font-size:28px;margin:0 0 24px;font-weight:600}' +
    '.dm-grid{display:grid;grid-template-columns:1fr 340px;gap:40px}@media(max-width:800px){.dm-grid{grid-template-columns:1fr}}' +
    '.dm-item{display:flex;gap:16px;padding:16px 0;border-bottom:1px solid #eee;align-items:center}' +
    '.dm-item img{width:84px;height:84px;object-fit:cover;border-radius:8px;background:#f3f3f3}' +
    '.dm-item .t{flex:1}.dm-qty{display:flex;align-items:center;gap:8px}' +
    '.dm-qty button,.dm-x{border:1px solid #ddd;background:#fff;border-radius:6px;width:30px;height:30px;cursor:pointer;font-size:16px}' +
    '.dm-x{border:0;color:#888;width:auto;font-size:13px;text-decoration:underline}' +
    '.dm-box{background:#f9fafb;border-radius:12px;padding:22px;align-self:start}' +
    '.dm-row{display:flex;justify-content:space-between;margin:6px 0}.dm-row.b{font-weight:700;font-size:18px;border-top:1px solid #e5e7eb;padding-top:12px;margin-top:12px}' +
    '.dm-btn{display:block;width:100%;background:#000;color:#fff;border:0;border-radius:8px;height:46px;font-size:15px;font-weight:600;cursor:pointer;margin-top:16px;text-align:center;line-height:46px;text-decoration:none}' +
    '.dm-btn.l{background:#fff;color:#111;border:1px solid #ddd}' +
    '.dm-f label{display:block;font-size:13px;color:#555;margin:12px 0 4px}' +
    '.dm-f input,.dm-f select{width:100%;box-sizing:border-box;border:1px solid #d1d5db;border-radius:8px;height:42px;padding:0 12px;font-size:15px}' +
    '.dm-f .two{display:grid;grid-template-columns:1fr 1fr;gap:12px}' +
    '.dm-ship{display:flex;gap:10px;align-items:center;border:1px solid #d1d5db;border-radius:8px;padding:12px;margin-top:8px;cursor:pointer}' +
    '.dm-note{font-size:12px;color:#777;margin-top:10px}' +
    '.dm-ok{text-align:center;padding:40px 0}.dm-ok .c{width:64px;height:64px;border-radius:50%;background:#16a34a;color:#fff;font-size:34px;line-height:64px;margin:0 auto 16px}';
  document.head.appendChild(css);

  function toast(html) {
    var t = document.createElement('div'); t.className = 'dm-toast'; t.innerHTML = html;
    document.body.appendChild(t); setTimeout(function () { t.remove(); }, 3500);
  }
  function overlay(inner, cls) {
    var b = document.createElement('div'); b.className = 'dm-back';
    b.innerHTML = '<div class="' + cls + '">' + inner + '</div>';
    b.addEventListener('click', function (e) { if (e.target === b || e.target.hasAttribute('data-close')) b.remove(); });
    document.body.appendChild(b); return b;
  }

  // Üst menü: sepet sayacı, menü çekmecesi, hesap
  function refreshNav() {
    document.querySelectorAll('[data-testid=nav-cart-link]').forEach(function (a) {
      a.textContent = 'Sepet (' + count() + ')'; a.href = BASE + '/cart/';
    });
  }
  refreshNav();
  document.querySelectorAll('[data-testid=nav-menu-button]').forEach(function (b) {
    b.addEventListener('click', function () {
      overlay('<a href="' + BASE + '/">Ana Sayfa</a><a href="' + BASE + '/store/">Mağaza</a>' +
        '<a href="' + BASE + '/collections/one-cikanlar/">Öne Çıkanlar</a><a href="' + BASE + '/cart/">Sepet (' + count() + ')</a>' +
        '<a href="#" data-close style="font-size:15px;color:#888;margin-top:auto">Kapat ✕</a>', 'dm-drawer');
    });
  });
  document.querySelectorAll('[data-testid=nav-account-link]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var o = load(ORDERS);
      overlay('<h2 style="margin:0 0 6px;font-size:22px">Hesabım</h2><p style="color:#666;margin:0 0 16px">Demo hesabı · Siparişleriniz</p>' +
        (o.length ? o.slice().reverse().map(function (s) {
          return '<div class="dm-row" style="border-bottom:1px solid #eee;padding:10px 0"><span>#' + s.no + ' · ' + s.date + '<br><small style="color:#888">' + s.items + ' ürün · Hazırlanıyor</small></span><b>' + tl(s.total) + '</b></div>';
        }).join('') : '<p>Henüz siparişiniz yok.</p>') +
        '<button class="dm-btn l" data-close>Kapat</button>', 'dm-modal');
    });
  });

  // Ürün sayfası: sepete ekle + açılır bilgi bölümleri
  var add = document.querySelector('[data-testid=add-product-button]');
  if (add) {
    add.disabled = false;
    add.addEventListener('click', function (e) {
      e.preventDefault();
      var h = location.pathname.replace(/\/$/, '').split('/').pop();
      var title = (document.querySelector('[data-testid=product-title]') || document.querySelector('h2,h1')).textContent.trim();
      var price = +document.querySelector('[data-testid=product-price]').getAttribute('data-value');
      var img = document.querySelector('main img'); img = img ? img.src : '';
      var cart = load(KEY), ex = cart.filter(function (i) { return i.handle === h; })[0];
      if (ex) ex.qty++; else cart.push({ handle: h, title: title, price: price, img: img, qty: 1 });
      save(KEY, cart); refreshNav();
      add.textContent = 'Sepete eklendi ✓'; setTimeout(function () { add.textContent = 'Sepete ekle'; }, 1600);
      toast('“' + esc(title) + '” sepete eklendi <a href="' + BASE + '/cart/">Sepete git</a>');
    });
    var info = {
      'Ürün bilgisi': 'Malzeme: doğal ve el yapımı · Menşei: Türkiye · Her ürün tek tek kontrol edilerek paketlenir.',
      'Kargo ve iade': '750 ₺ üzeri ücretsiz kargo · 1-3 iş gününde kargoda · 14 gün içinde ücretsiz iade.'
    };
    document.querySelectorAll('button').forEach(function (b) {
      var k = b.textContent.trim(); if (!info[k]) return;
      var p = document.createElement('div');
      p.style.cssText = 'display:none;padding:0 4px 16px;font-size:14px;color:#555'; p.textContent = info[k];
      b.parentNode.insertBefore(p, b.nextSibling);
      b.addEventListener('click', function () { p.style.display = p.style.display === 'none' ? 'block' : 'none'; });
    });
  }

  // Sepet sayfası
  if (/\/cart\/?$/.test(location.pathname)) {
    var main = document.querySelector('main') || document.body;
    function render() {
      var cart = load(KEY);
      var sub = cart.reduce(function (s, i) { return s + i.price * i.qty; }, 0);
      if (!cart.length) {
        main.innerHTML = '<div class="dm-wrap"><h1>Sepet</h1><p>Sepetiniz şu an boş.</p><a class="dm-btn" style="max-width:260px" href="' + BASE + '/store/">Alışverişe başla</a></div>';
        return;
      }
      var freeShip = sub >= 750;
      main.innerHTML = '<div class="dm-wrap"><h1>Sepet</h1><div class="dm-grid"><div>' + cart.map(function (i, n) {
        return '<div class="dm-item"><img src="' + i.img + '" alt=""><div class="t"><b>' + esc(i.title) + '</b><br><span style="color:#666">' + tl(i.price) + '</span><br><button class="dm-x" data-del="' + n + '">Kaldır</button></div>' +
          '<div class="dm-qty"><button data-dec="' + n + '">−</button>' + i.qty + '<button data-inc="' + n + '">+</button></div><b style="width:110px;text-align:right">' + tl(i.price * i.qty) + '</b></div>';
      }).join('') + '</div><div class="dm-box"><b style="font-size:18px">Sipariş özeti</b>' +
        '<div class="dm-row"><span>Ara toplam</span><span>' + tl(sub) + '</span></div>' +
        '<div class="dm-row"><span>Kargo</span><span>' + (freeShip ? 'Ücretsiz' : 'Ödeme adımında') + '</span></div>' +
        '<div class="dm-row"><span>KDV (%20, dahil)</span><span>' + tl(sub - sub / 1.2) + '</span></div>' +
        '<div class="dm-row b"><span>Toplam</span><span>' + tl(sub) + '</span></div>' +
        (freeShip ? '' : '<div class="dm-note">Ücretsiz kargo için ' + tl(750 - sub) + ' daha ekleyin.</div>') +
        '<button class="dm-btn" id="dm-pay">Ödemeye geç</button><a class="dm-btn l" href="' + BASE + '/store/">Alışverişe devam et</a></div></div></div>';
      main.querySelectorAll('[data-inc],[data-dec],[data-del]').forEach(function (b) {
        b.onclick = function () {
          var c = load(KEY), i;
          if ((i = b.getAttribute('data-inc')) !== null) c[i].qty++;
          if ((i = b.getAttribute('data-dec')) !== null) { c[i].qty--; if (!c[i].qty) c.splice(i, 1); }
          if ((i = b.getAttribute('data-del')) !== null) c.splice(i, 1);
          save(KEY, c); refreshNav(); render();
        };
      });
      document.getElementById('dm-pay').onclick = checkout;
    }
    function checkout() {
      var cart = load(KEY);
      var sub = cart.reduce(function (s, i) { return s + i.price * i.qty; }, 0);
      main.innerHTML = '<div class="dm-wrap"><h1>Ödeme</h1><div class="dm-grid"><form class="dm-f" id="dm-form">' +
        '<b style="font-size:18px">Teslimat bilgileri</b><div class="two"><div><label>Ad</label><input required value=""></div><div><label>Soyad</label><input required></div></div>' +
        '<label>Adres</label><input required placeholder="Mahalle, sokak, no"><div class="two"><div><label>İl</label><input required placeholder="İstanbul"></div><div><label>Telefon</label><input required type="tel" placeholder="05xx xxx xx xx"></div></div>' +
        '<label>E-posta</label><input required type="email" placeholder="ornek@mail.com">' +
        '<b style="font-size:18px;display:block;margin-top:24px">Kargo</b>' +
        '<label class="dm-ship"><input type="radio" name="k" value="0" checked style="width:auto;height:auto"> Ücretsiz Kargo <span style="margin-left:auto">' + (sub >= 750 ? '₺0' : '₺49,90') + '</span></label>' +
        '<label class="dm-ship"><input type="radio" name="k" value="120" style="width:auto;height:auto"> Hızlı Kargo (ertesi gün) <span style="margin-left:auto">₺120</span></label>' +
        '<b style="font-size:18px;display:block;margin-top:24px">Ödeme</b>' +
        '<label>Kart numarası</label><input value="4242 4242 4242 4242"><div class="two"><div><label>Son kullanma</label><input value="12/29"></div><div><label>CVC</label><input value="123"></div></div>' +
        '<div class="dm-note">Demo mağaza: kart bilgisi kaydedilmez, ödeme alınmaz. Canlı projede iyzico / PayTR / Stripe bağlanır.</div>' +
        '<button class="dm-btn" type="submit">Siparişi tamamla</button></form>' +
        '<div class="dm-box"><b style="font-size:18px">Sepetiniz</b>' + cart.map(function (i) {
          return '<div class="dm-row"><span>' + i.qty + ' × ' + esc(i.title) + '</span><span>' + tl(i.price * i.qty) + '</span></div>';
        }).join('') + '<div class="dm-row b"><span>Toplam</span><span id="dm-total">' + tl(sub) + '</span></div></div></div></div>';
      var form = document.getElementById('dm-form');
      function kargo() { var v = +form.querySelector('[name=k]:checked').value; return v || (sub >= 750 ? 0 : 49.9); }
      form.querySelectorAll('[name=k]').forEach(function (r) { r.onchange = function () { document.getElementById('dm-total').textContent = tl(sub + kargo()); }; });
      document.getElementById('dm-total').textContent = tl(sub + kargo());
      window.scrollTo(0, 0);
      form.onsubmit = function (e) {
        e.preventDefault();
        var no = 'AA' + Math.floor(100000 + Math.random() * 900000), total = sub + kargo();
        var o = load(ORDERS); o.push({ no: no, date: new Date().toLocaleDateString('tr-TR'), total: total, items: count() }); save(ORDERS, o);
        save(KEY, []); refreshNav(); window.scrollTo(0, 0);
        main.innerHTML = '<div class="dm-wrap"><div class="dm-ok"><div class="c">✓</div><h1>Siparişiniz alındı!</h1>' +
          '<p>Sipariş numaranız <b>#' + no + '</b> · Toplam <b>' + tl(total) + '</b></p><p style="color:#666">Onay e-postası gönderildi. Siparişiniz 1-3 iş günü içinde kargoya verilecek.</p>' +
          '<a class="dm-btn" style="max-width:260px;margin:24px auto 0" href="' + BASE + '/store/">Alışverişe devam et</a></div></div>';
      };
    }
    render();
  }
})();
