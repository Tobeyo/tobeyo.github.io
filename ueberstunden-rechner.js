/* =========================================================
   ÜBERSTUNDEN – gemeinsamer Rechenkern
   ---------------------------------------------------------
   Diese Datei wird von "ueberstunden.html" (die ausführliche
   Auswertung) und von "arbeitszeiten.html" (das kleine Konto-
   Feld über dem Kalender) geladen. Beide Seiten rechnen damit
   garantiert dasselbe Ergebnis – die Logik steht nur hier.

   Die Regeln in Kurzform:
     Soll eines Tages:  Mo–Fr = Wochen-Soll ÷ 5, Sa/So und
                        Feiertage = 0
     Ist eines Tages:   Dienst        → Netto-Arbeitszeit
                        Feiertag      → 0 (Soll ist ja auch 0)
                        Urlaub etc.   → angerechnete Stunden,
                                        mindestens das Tages-Soll
                        Zeitausgleich → Soll minus genommene
                                        Stunden (Konto sinkt)
     Konto = Übertrag + Summe der Tagesdifferenzen + Korrekturen

   Ein "ctx" ist dabei immer ein Objekt mit:
     plan        die gedruckten Dienste der Person
     entries     die Änderungen aus dem Kalender
     settings    { wochenSoll, startSaldo, startDatum, zaAbzug }
     korrekturen die von Hand erfassten Korrekturen
     getEntry    Funktion(key) → Eintrag des Tages oder null
   ========================================================= */

(function () {

  /* ---------- Kleine Helfer ---------- */

  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function keyOf(y, m, d) { return y + '-' + pad(m + 1) + '-' + pad(d); }
  function keyOfDate(d) { return keyOf(d.getFullYear(), d.getMonth(), d.getDate()); }
  function dateOfKey(k) { return new Date(+k.slice(0, 4), +k.slice(5, 7) - 1, +k.slice(8, 10)); }
  function addDays(d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); }

  function toMinutes(t) {
    var p = String(t).split(':');
    return parseInt(p[0], 10) * 60 + parseInt(p[1], 10);
  }

  // Netto-Stunden eines Eintrags (Dienst über Mitternacht wird mitgerechnet)
  function hoursOf(e) {
    if (!e) return 0;
    if (e.art) return Math.max(0, parseFloat(e.h) || 0);
    if (!e.von || !e.bis) return 0;
    var diff = toMinutes(e.bis) - toMinutes(e.von);
    if (diff < 0) diff += 24 * 60;
    return Math.max(0, diff / 60 - (parseFloat(e.pause) || 0));
  }

  /* ---------- Feiertage (Österreich) ---------- */

  // Ostersonntag nach der Gaußschen Osterformel
  function easter(y) {
    var a = y % 19, b = Math.floor(y / 100), c = y % 100;
    var d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
    var g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
    var j = Math.floor(c / 4), k = c % 4;
    var l = (32 + 2 * e + 2 * j - h - k) % 7;
    var m = Math.floor((a + 11 * h + 22 * l) / 451);
    var month = Math.floor((h + l - 7 * m + 114) / 31);
    var day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(y, month - 1, day);
  }

  var holidayCache = {};
  function holidaysOf(y) {
    if (holidayCache[y]) return holidayCache[y];
    var o = {};
    function put(d, name) { o[keyOfDate(d)] = name; }
    put(new Date(y, 0, 1), 'Neujahr');
    put(new Date(y, 0, 6), 'Heilige Drei Könige');
    var os = easter(y);
    put(addDays(os, 1), 'Ostermontag');
    put(addDays(os, 39), 'Christi Himmelfahrt');
    put(addDays(os, 50), 'Pfingstmontag');
    put(addDays(os, 60), 'Fronleichnam');
    put(new Date(y, 4, 1), 'Staatsfeiertag');
    put(new Date(y, 7, 15), 'Mariä Himmelfahrt');
    put(new Date(y, 9, 26), 'Nationalfeiertag');
    put(new Date(y, 10, 1), 'Allerheiligen');
    put(new Date(y, 11, 8), 'Mariä Empfängnis');
    put(new Date(y, 11, 25), 'Christtag');
    put(new Date(y, 11, 26), 'Stefanitag');
    holidayCache[y] = o;
    return o;
  }

  function holidayName(key) {
    return holidaysOf(+key.slice(0, 4))[key] || null;
  }

  /* ---------- Einstellungen & Korrekturen ---------- */

  // Rohdaten aus der Datenbank in saubere Zahlen umwandeln.
  // "defaults" liefert das Wochen-Soll, falls keines gespeichert ist.
  function normSettings(s, defaults) {
    var d = defaults || {};
    var fallback = parseFloat(d.wochenSoll);
    if (!(fallback > 0)) fallback = 0;
    s = s || {};

    var woche = s.wochenSoll != null ? parseFloat(s.wochenSoll) : fallback;
    if (!(woche > 0)) woche = fallback;

    var start = s.startSaldo != null ? parseFloat(s.startSaldo) : 0;
    if (isNaN(start)) start = 0;

    return {
      wochenSoll: woche,
      startSaldo: start,
      startDatum: s.startDatum || '',
      zaAbzug: s.zaAbzug !== false
    };
  }

  function korrList(korrekturen) {
    var k = korrekturen || {};
    return Object.keys(k).map(function (id) {
      var x = k[id];
      return {
        id: id,
        datum: x.datum || '',
        text: x.text || 'Korrektur',
        h: parseFloat(x.h) || 0,
        by: x.by || '',
        ts: x.ts || 0
      };
    }).sort(function (a, b) { return a.datum < b.datum ? -1 : a.datum > b.datum ? 1 : 0; });
  }

  /* ---------- Der eigentliche Rechenkern ---------- */

  function tagesSoll(settings) { return settings.wochenSoll / 5; }

  function dayInfo(date, ctx) {
    var settings = ctx.settings;
    var key = keyOfDate(date);
    var dow = date.getDay();
    var entry = ctx.getEntry(key);
    var art = entry && entry.art ? entry.art : null;
    var feiertag = holidayName(key) || (art === 'feiertag' ? 'Feiertag' : null);

    var soll = (dow === 0 || dow === 6 || feiertag) ? 0 : tagesSoll(settings);
    var ist = 0, za = 0;

    if (entry) {
      if (!art) {
        ist = hoursOf(entry);
      } else if (art === 'feiertag') {
        ist = 0;
      } else if (art === 'zeitausgleich') {
        za = Math.min(hoursOf(entry) > 0 ? hoursOf(entry) : soll, soll);
        ist = settings.zaAbzug ? soll - za : soll;
        if (!settings.zaAbzug) za = 0;
      } else {
        ist = hoursOf(entry) > 0 ? hoursOf(entry) : soll;
      }
    }

    return {
      key: key, date: date, dow: dow, entry: entry, art: art,
      feiertag: feiertag, soll: soll, ist: ist, za: za, diff: ist - soll
    };
  }

  // Zeitraum, für den überhaupt Daten vorliegen
  function dataRange(ctx) {
    var entries = ctx.entries || {};
    var keys = Object.keys(ctx.plan || {});
    Object.keys(entries).forEach(function (k) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(k) && entries[k] && !entries[k].frei) keys.push(k);
    });
    if (!keys.length) return null;
    keys.sort();
    var von = keys[0], bis = keys[keys.length - 1];
    var ab = ctx.settings.startDatum;
    if (ab && ab > von) von = ab;
    if (von > bis) return null;
    return { von: von, bis: bis };
  }

  function allDays(ctx) {
    var r = dataRange(ctx);
    if (!r) return [];
    var out = [], d = dateOfKey(r.von), end = dateOfKey(r.bis);
    while (d <= end) {
      out.push(dayInfo(d, ctx));
      d = addDays(d, 1);
    }
    return out;
  }

  // Konto-Stand bis einschließlich Datum "bisKey"
  function saldoUntil(days, korr, settings, bisKey) {
    var plan = 0, za = 0, ist = 0, soll = 0;
    days.forEach(function (x) {
      if (x.key > bisKey) return;
      plan += x.diff; za += x.za; ist += x.ist; soll += x.soll;
    });
    var k = 0;
    (korr || []).forEach(function (x) { if (!x.datum || x.datum <= bisKey) k += x.h; });
    return {
      plan: plan, korr: k, za: za, ist: ist, soll: soll,
      saldo: settings.startSaldo + plan + k
    };
  }

  /* Bequemer Einzelaufruf: der Stand "heute" – genau die Zahl, die
     der Überstunden-Rechner oben groß anzeigt. Liegt heute nach dem
     letzten Plantag, wird bis zum Planende gerechnet.              */
  function stand(ctx, todayKey) {
    if (!(ctx.settings.wochenSoll > 0)) return null;
    var r = dataRange(ctx);
    if (!r) return null;
    var days = allDays(ctx);
    if (!days.length) return null;
    var nowKey = todayKey > r.bis ? r.bis : todayKey;
    var res = saldoUntil(days, korrList(ctx.korrekturen), ctx.settings, nowKey);
    res.nowKey = nowKey;
    res.range = r;
    return res;
  }

  window.NESSIE_UESTD = {
    toMinutes: toMinutes,
    hoursOf: hoursOf,
    easter: easter,
    holidaysOf: holidaysOf,
    holidayName: holidayName,
    normSettings: normSettings,
    korrList: korrList,
    tagesSoll: tagesSoll,
    dayInfo: dayInfo,
    dataRange: dataRange,
    allDays: allDays,
    saldoUntil: saldoUntil,
    stand: stand
  };

})();
