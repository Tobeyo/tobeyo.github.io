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
      raster: ['900 1em Archivo', '400 1em "IBM Plex Mono"']
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
