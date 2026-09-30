/*
 * Nessie-Hub · Design-Auswahl
 *
 * Wird auf jeder Seite ganz oben im <head> geladen. Liest das gewählte
 * Design aus dem lokalen Speicher und setzt es auf <html data-design="…">,
 * bevor die Seite gezeichnet wird – so blitzt nie das falsche Design auf.
 * Ausgewählt wird das Design nur auf der Startseite (index.html).
 *
 * Außerdem: die passenden Schriften laden und beim Wechsel zwischen
 * Startseite und App das App-Icon mitwandern lassen (View Transitions).
 */
(function () {
  'use strict';

  var KEY = 'nessie-design';
  var FALLBACK = 'loch';
  var DESIGNS = {
    loch: {
      name: 'Loch Ness',
      sub: 'Dunkel & redaktionell',
      color: '#0b1411',
      light: false,
      fonts: 'family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..700&family=Geist:wght@300..700&family=Geist+Mono:wght@400;500'
    },
    papier: {
      name: 'Papier & Farbe',
      sub: 'Hell, verspielt, bunt',
      color: '#f1ece2',
      light: true,
      fonts: 'family=Bricolage+Grotesque:opsz,wght@12..96,300..800'
    },
    raster: {
      name: 'Raster',
      sub: 'Dunkel, technisch, Schweizer Stil',
      color: '#0d0d0c',
      light: false,
      fonts: 'family=Archivo:wdth,wght@62..125,400..900&family=IBM+Plex+Mono:wght@400;500;600'
    },
    schlicht: {
      name: 'Schlicht',
      sub: 'Hell, ruhig, viel Luft',
      color: '#f6f6f3',
      light: true,
      fonts: 'family=Manrope:wght@300..800'
    },
    nachtpapier: {
      name: 'Nachtpapier',
      sub: 'Papier & Farbe, nur dunkel',
      color: '#191815',
      light: false,
      fonts: 'family=Bricolage+Grotesque:opsz,wght@12..96,300..800'
    },
    kalligraphie: {
      name: 'Kalligraphie',
      sub: 'Tusche, Feder & rotes Siegel',
      color: '#f6f2ea',
      light: true,
      fonts: 'family=Alegreya:ital,wght@0,400..900;1,400..900&family=Cormorant+Upright:wght@400;500;600;700&family=Pinyon+Script'
    }
  };

  var root = document.documentElement;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function read() {
    var v = null;
    try { v = window.localStorage.getItem(KEY); } catch (e) { /* privater Modus o. ä. */ }
    return DESIGNS[v] ? v : FALLBACK;
  }

  function fontHref(id) {
    return 'https://fonts.googleapis.com/css2?' + DESIGNS[id].fonts + '&display=swap';
  }

  function loadFonts(id) {
    var href = fontHref(id);
    if (document.querySelector('link[data-n-fonts="' + id + '"]')) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.setAttribute('data-n-fonts', id);
    (document.head || root).appendChild(link);
  }

  function apply(id) {
    root.setAttribute('data-design', id);
    loadFonts(id);

    // Browserleiste & iOS-Statusleiste nur auf Seiten, die das ausdrücklich wollen
    var meta = document.querySelector('meta[name="theme-color"][data-design]');
    if (meta) meta.setAttribute('content', DESIGNS[id].color);
    var bar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"][data-design]');
    if (bar) bar.setAttribute('content', DESIGNS[id].light ? 'default' : 'black-translucent');

    var ev;
    try { ev = new CustomEvent('nessie-design', { detail: id }); } catch (e) { ev = null; }
    if (ev) document.dispatchEvent(ev);
  }

  function save(id) {
    try { window.localStorage.setItem(KEY, id); } catch (e) { /* dann eben nur für diesen Besuch */ }
  }

  // Sofort setzen – das Skript läuft noch während der <head> gelesen wird.
  if (!document.querySelector('link[rel="preconnect"][href="https://fonts.gstatic.com"]')) {
    var pc = document.createElement('link');
    pc.rel = 'preconnect';
    pc.href = 'https://fonts.gstatic.com';
    pc.crossOrigin = '';
    (document.head || root).appendChild(pc);
  }
  apply(read());

  // Zurück-Knopf des Browsers (Seite aus dem Cache) oder anderer Tab:
  // immer das zuletzt gewählte Design zeigen.
  window.addEventListener('pageshow', function () { apply(read()); });
  window.addEventListener('storage', function (e) { if (e.key === KEY) apply(read()); });

  /* ---------- Design wechseln (nur Startseite) ---------- */

  function waitForFonts(id, ms) {
    loadFonts(id);
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    var fam = {
      loch: ['300 1em Fraunces', '400 1em Geist', '400 1em "Geist Mono"'],
      papier: ['800 1em "Bricolage Grotesque"', '500 1em "Bricolage Grotesque"'],
      raster: ['900 1em Archivo', '400 1em "IBM Plex Mono"'],
      schlicht: ['400 1em Manrope', '600 1em Manrope'],
      nachtpapier: ['800 1em "Bricolage Grotesque"', '500 1em "Bricolage Grotesque"'],
      kalligraphie: ['400 1em Alegreya', '600 1em "Cormorant Upright"', '400 1em "Pinyon Script"']
    }[id];
    var all = Promise.all(fam.map(function (f) { return document.fonts.load(f).catch(function () {}); }));
    var timeout = new Promise(function (r) { setTimeout(r, ms); });
    return Promise.race([all, timeout]);
  }

  // origin: {x, y} in Pixeln – von dort breitet sich das neue Design kreisförmig aus
  function set(id, origin) {
    if (!DESIGNS[id]) return Promise.resolve();
    save(id);
    if (id === root.getAttribute('data-design')) return Promise.resolve();

    return waitForFonts(id, 900).then(function () {
      if (reduceMotion || !document.startViewTransition) { apply(id); return; }

      root.classList.add('n-switching');
      var t = document.startViewTransition(function () { apply(id); });
      t.ready.then(function () {
        var x = origin ? origin.x : window.innerWidth / 2;
        var y = origin ? origin.y : 0;
        var r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
        root.animate(
          { clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)', 'circle(' + r + 'px at ' + x + 'px ' + y + 'px)'] },
          { duration: 700, easing: 'cubic-bezier(.7,0,.2,1)', pseudoElement: '::view-transition-new(root)' }
        );
      }).catch(function () {});
      return t.finished.then(
        function () { root.classList.remove('n-switching'); },
        function () { root.classList.remove('n-switching'); }
      );
    });
  }

  /* ---------- App-Icon wandert zwischen Startseite und App ---------- */

  var ICON_NAME = 'n-app-icon';
  var LAST_KEY = 'nessie-last-app';

  function clearIconNames() {
    var named = document.querySelectorAll('[data-n-icon]');
    for (var i = 0; i < named.length; i++) named[i].style.viewTransitionName = '';
  }

  // Startseite: Kachel angetippt → genau dieses Icon bekommt den Namen
  document.addEventListener('click', function (e) {
    var link = e.target.closest && e.target.closest('a[data-n-app]');
    if (!link) return;
    clearIconNames();
    var icon = link.querySelector('[data-n-icon]');
    if (icon) icon.style.viewTransitionName = ICON_NAME;
    try { sessionStorage.setItem(LAST_KEY, link.getAttribute('data-n-app')); } catch (err) { /* egal */ }
  });

  // Zurück auf der Startseite: das Icon der App, von der man kommt, fängt den Übergang auf
  window.addEventListener('pagereveal', function (e) {
    if (!e.viewTransition) return;
    var last = null;
    try { last = sessionStorage.getItem(LAST_KEY); } catch (err) { /* egal */ }
    if (!last) return;
    var icon = document.querySelector('a[data-n-app="' + last + '"] [data-n-icon]');
    if (!icon) return;
    clearIconNames();
    icon.style.viewTransitionName = ICON_NAME;
    e.viewTransition.finished.then(clearIconNames, clearIconNames);
  });

  // Aus dem Browser-Cache zurück: keine alten Namen stehen lassen
  window.addEventListener('pageshow', function (e) { if (e.persisted) clearIconNames(); });

  /* ---------- Spielereien beim Tippen (Schlicht, Nachtpapier, Kalligraphie) ---------- */
  // Nur auf Seiten, die ganz im gewählten Design gezeichnet werden (class="n-themed").
  // Die Teilchen liegen in einer eigenen Ebene ohne Maus-Ereignisse – die Apps merken nichts davon.

  var fxLayer = null;
  function fxRoot() {
    if (fxLayer && fxLayer.isConnected) return fxLayer;
    fxLayer = document.createElement('div');
    fxLayer.className = 'n-fx';
    fxLayer.setAttribute('aria-hidden', 'true');
    document.body.appendChild(fxLayer);
    return fxLayer;
  }
  function rand(a, b) { return a + Math.random() * (b - a); }
  function at(x, y, rest) { return 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) ' + (rest || ''); }
  function spawn(css, frames, opts) {
    var el = document.createElement('i');
    el.style.cssText = css;
    fxRoot().appendChild(el);
    if (!el.animate) { el.remove(); return; }
    var a = el.animate(frames, opts);
    a.onfinish = a.oncancel = function () { el.remove(); };
  }
  function box(w, h) { return 'width:' + w + 'px;height:' + h + 'px;margin:' + (-h / 2) + 'px 0 0 ' + (-w / 2) + 'px;'; }

  var FX = {
    // Ein feiner Ring, der sich ausbreitet
    schlicht: function (x, y) {
      spawn(box(46, 46) + 'border-radius:50%;border:1.5px solid var(--n-accent);',
        [{ transform: at(x, y, 'scale(.15)'), opacity: 0.9 }, { transform: at(x, y, 'scale(1.3)'), opacity: 0 }],
        { duration: 560, easing: 'cubic-bezier(.16,1,.3,1)' });
      spawn(box(6, 6) + 'border-radius:50%;background:var(--n-accent);',
        [{ transform: at(x, y, 'scale(1)'), opacity: 1 }, { transform: at(x, y, 'scale(0)'), opacity: 0 }],
        { duration: 380, easing: 'ease-out' });
    },
    // Bunte Papierschnipsel, die leuchten und herunterfallen
    nachtpapier: function (x, y) {
      var cols = ['#ffd400', '#ff8a7a', '#7aa2ff', '#5ef0c0', '#b18cff', '#ffb070'];
      var n = 9, start = rand(0, Math.PI * 2);
      for (var i = 0; i < n; i++) {
        var ang = start + (i / n) * Math.PI * 2 + rand(-0.3, 0.3);
        var dist = rand(24, 58);
        var dx = Math.cos(ang) * dist, dy = Math.sin(ang) * dist - 12;
        var w = rand(5, 9), h = rand(3, 6), rot = rand(-300, 300), c = cols[i % cols.length];
        spawn(box(w, h) + 'border-radius:1.5px;background:' + c + ';box-shadow:0 0 9px ' + c + '88;',
          [{ transform: at(x, y, 'rotate(0deg) scale(.3)'), opacity: 1 },
           { transform: at(x + dx, y + dy, 'rotate(' + (rot / 2) + 'deg) scale(1)'), opacity: 1, offset: 0.5 },
           { transform: at(x + dx * 1.2, y + dy + 30, 'rotate(' + rot + 'deg) scale(.7)'), opacity: 0 }],
          { duration: rand(650, 950), easing: 'cubic-bezier(.2,.7,.3,1)' });
      }
    },
    // Ein Tropfen Tusche, der ins Papier sickert – selten auch Siegelrot
    kalligraphie: function (x, y) {
      var ink = Math.random() < 0.18 ? '192,67,46' : '31,27,22';
      function blob(size, px, py, delay, dur, strength) {
        var b = function () { return Math.round(rand(38, 62)) + '%'; };
        var shape = b() + ' ' + b() + ' ' + b() + ' ' + b() + ' / ' + b() + ' ' + b() + ' ' + b() + ' ' + b();
        var r = rand(0, 360).toFixed(0) + 'deg';
        spawn(box(size, size) + 'border-radius:' + shape + ';background:radial-gradient(circle at 45% 42%, rgba(' + ink + ',' + strength + ') 0 42%, rgba(' + ink + ',' + (strength * 0.55) + ') 68%, rgba(' + ink + ',0) 100%);',
          [{ transform: at(px, py, 'rotate(' + r + ') scale(.1)'), opacity: 1 },
           { transform: at(px, py, 'rotate(' + r + ') scale(1)'), opacity: 0.9, offset: 0.16 },
           { transform: at(px, py, 'rotate(' + r + ') scale(1.4)'), opacity: 0 }],
          { duration: dur, delay: delay, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' });
      }
      blob(rand(26, 38), x, y, 0, 1500, 0.85);
      for (var i = 0; i < 3; i++) {
        var a = rand(0, Math.PI * 2), d = rand(18, 34);
        blob(rand(4, 8), x + Math.cos(a) * d, y + Math.sin(a) * d, 60 + i * 40, 1100, 0.8);
      }
    }
  };

  document.addEventListener('click', function (e) {
    if (reduceMotion || !e.detail) return;              // Tastatur: kein Effekt
    if (!root.classList.contains('n-themed')) return;
    var fn = FX[root.getAttribute('data-design')];
    if (fn) fn(e.clientX, e.clientY);
  }, true);

  // Für Seiten, die ihr ganzes Dokument austauschen (Wohnungsplaner):
  // Design-Stylesheet und Einstellung im neuen Dokument wieder anbringen.
  function reattach() {
    root = document.documentElement;
    if (!document.querySelector('link[rel="stylesheet"][href$="design.css"]')) {
      var l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = 'design.css';
      (document.head || root).appendChild(l);
    }
    apply(read());
  }

  window.NessieDesign = {
    list: DESIGNS,
    get: function () { return root.getAttribute('data-design') || read(); },
    set: set,
    preload: function () { Object.keys(DESIGNS).forEach(loadFonts); },
    reattach: reattach
  };
})();
