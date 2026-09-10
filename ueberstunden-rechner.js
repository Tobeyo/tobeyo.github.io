/* =========================================================
   ÜBERSTUNDEN – gemeinsamer Rechenkern
   ---------------------------------------------------------
   Diese Datei wird von "ueberstunden.html" (die ausführliche
   Auswertung) und von "arbeitszeiten.html" (das kleine Konto-
   Feld über dem Kalender) geladen. Beide Seiten rechnen damit
   garantiert dasselbe Ergebnis – die Logik steht nur hier.

   Die Regeln in Kurzform:
     Soll eines Tages:  normaler Werktag → das, was der Aushang für
                        GENAU DIESEN Tag vorsieht (nicht der Wochen-
                        durchschnitt!). Sa/So und Feiertage = 0.
                        Zeitausgleich = Wochen-Soll ÷ 5 (siehe unten).
     Ist eines Tages:   Dienst        → Netto-Arbeitszeit
                        Feiertag      → 0 (Soll ist ja auch 0)
                        Urlaub etc.   → angerechnete Stunden,
                                        mindestens das Tages-Soll
                        Zeitausgleich → Soll minus genommene
                                        Stunden (Konto sinkt)
     Konto = Übertrag + Summe der Tagesdifferenzen + Korrekturen

     Wichtig: Weil Soll und Ist an normalen Werktagen beide aus
     demselben Aushang stammen, heben sie sich gegenseitig auf,
     solange im Kalender nichts geändert wurde – ein neuer (kürzerer
     oder längerer) Plantag lässt das Konto also NICHT von selbst
     schwanken. Es bewegt sich nur, wenn die tatsächliche Zeit im
     Kalender von der gedruckten abweicht (oder an Sa/So/Feiertagen
     gearbeitet bzw. Zeitausgleich genommen wird).

   Von Hand übersteuern lässt sich das an zwei Stellen:
     1. Ein einzelner Tag kann im Kalender als "zählt nicht aufs Konto"
        markiert werden (Feld "neutral"). Dann ist sein Soll gleich
        seinem Ist – der Tag darf also beliebig vom Aushang abweichen,
        ohne dass daraus Plus- oder Minusstunden werden.
     2. Über "anpassungen" wird das Ergebnis pro Monat und fürs
        Gesamtkonto von Hand gesetzt (siehe weiter unten).

   Ein "ctx" ist dabei immer ein Objekt mit:
     plan        die gedruckten Dienste der Person
     entries     die Änderungen aus dem Kalender
     settings    { wochenSoll, startSaldo, startDatum, zaAbzug }
     korrekturen die von Hand erfassten Korrekturen
     anpassungen die Anpassungen pro Monat / fürs Gesamtkonto
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

  /* ---------- Anpassungen von Hand ----------
     "anpassungen" sieht so aus:

       {
         monate: { '2026-09': { modus: 'delta'|'fix', h: 3.5 } },
         gesamt: { aktiv: true, modus: 'delta'|'fix', h: 12 }
       }

     modus 'delta' = die Stunden kommen zum Ergebnis dazu (mit Minus
                     gehen sie ab).
     modus 'fix'   = das Ergebnis IST genau diese Zahl; gerechnet wird
                     die Differenz zum Wert, der sich aus dem Plan ergibt.

     Bei den Monaten meint "das Ergebnis" die Überstunden dieses Monats,
     beim Gesamtkonto der Kontostand am Stichtag (normalerweise heute).
     Die Funktion darf gefahrlos auf schon geprüfte Daten angewendet
     werden – sie liefert dann dasselbe zurück.                       */

  function normAnpassungen(raw) {
    var a = raw || {};
    var srcM = a.monate || {};
    var monate = {};

    Object.keys(srcM).forEach(function (mk) {
      if (!/^\d{4}-\d{2}$/.test(mk)) return;
      var x = srcM[mk] || {};
      var h = parseFloat(x.h);
      if (isNaN(h)) return;
      var modus = x.modus === 'fix' ? 'fix' : 'delta';
      if (modus === 'delta' && Math.abs(h) < 0.005) return;   // "+0 dazu" ist nichts
      monate[mk] = { modus: modus, h: h, by: x.by || '', ts: x.ts || 0 };
    });

    var g = a.gesamt || {};
    var gh = parseFloat(g.h);
    var gesamt = null;
    if (g.aktiv && !isNaN(gh)) {
      gesamt = {
        aktiv: true,
        modus: g.modus === 'delta' ? 'delta' : 'fix',
        h: gh, by: g.by || '', ts: g.ts || 0
      };
    }

    return { monate: monate, gesamt: gesamt };
  }

  /* ---------- Der eigentliche Rechenkern ---------- */

  function tagesSoll(settings) { return settings.wochenSoll / 5; }

  // Wie viele Stunden ein Eintrag zählt (Dienst, Urlaub, Feiertag,
  // Zeitausgleich) – dieselbe Regel für den gedruckten Plan-Eintrag wie
  // für den tatsächlichen, damit man beide direkt vergleichen kann.
  function tagesWert(entry, flatSoll, zaAbzug) {
    if (!entry) return { ist: 0, za: 0 };
    var art = entry.art || null;
    if (!art) return { ist: hoursOf(entry), za: 0 };
    if (art === 'feiertag') return { ist: 0, za: 0 };
    if (art === 'zeitausgleich') {
      var za = Math.min(hoursOf(entry) > 0 ? hoursOf(entry) : flatSoll, flatSoll);
      var ist = zaAbzug ? flatSoll - za : flatSoll;
      return { ist: ist, za: zaAbzug ? za : 0 };
    }
    return { ist: hoursOf(entry) > 0 ? hoursOf(entry) : flatSoll, za: 0 };
  }

  function planEntryOf(ctx, key) {
    var p = ctx.plan && ctx.plan[key];
    if (!p) return null;
    if (p.art) return { art: p.art, h: p.h };
    return { von: p.von, bis: p.bis, pause: p.pause };
  }

  // Ist ein Tag als "zählt nicht aufs Konto" markiert? Die Markierung
  // steht am Kalender-Eintrag – auch an einem, der den Tag freistellt
  // (der kommt als "kein Eintrag" an, deshalb der Blick in die Rohdaten).
  function neutralOf(ctx, key, entry) {
    if (entry && entry.neutral) return true;
    var raw = ctx.entries && ctx.entries[key];
    return !!(raw && raw.neutral);
  }

  function dayInfo(date, ctx) {
    var settings = ctx.settings;
    var key = keyOfDate(date);
    var dow = date.getDay();
    var entry = ctx.getEntry(key);
    var art = entry && entry.art ? entry.art : null;
    var feiertag = holidayName(key) || (art === 'feiertag' ? 'Feiertag' : null);
    var frei = dow === 0 || dow === 6 || !!feiertag;
    var neutral = neutralOf(ctx, key, entry);

    var flatSoll = frei ? 0 : tagesSoll(settings);
    // An einem neutralen Tag wird auch der Zeitausgleich nicht abgezogen –
    // der Tag soll das Konto ja in keine Richtung bewegen.
    var actual = tagesWert(entry, flatSoll, neutral ? false : settings.zaAbzug);
    var ist = actual.ist, za = actual.za;

    // Sa/So, Feiertage und Zeitausgleich rechnen unabhängig vom gedruckten
    // Plan (Wochenend-/Feiertagsarbeit ist grundsätzlich "extra", ein
    // ZA-Tag baut bewusst Stunden ab). An normalen Werktagen ist das Soll
    // dagegen das, was der Aushang für GENAU DIESEN Tag vorsieht – nicht
    // der Wochendurchschnitt. So bewegt sich das Konto nur dann, wenn im
    // Kalender wirklich etwas anderes steht als im Aushang – nicht schon
    // dadurch, dass ein neuer (kürzerer oder längerer) Plantag "heute" wird.
    // Ein von Hand als "zählt nicht" markierter Tag bekommt genau das
    // Soll, das er auch tatsächlich hat – seine Differenz ist also 0,
    // egal wie stark er vom gedruckten Plan abweicht.
    var soll = neutral
      ? ist
      : (frei || art === 'zeitausgleich')
        ? flatSoll
        : tagesWert(planEntryOf(ctx, key), flatSoll, settings.zaAbzug).ist;

    return {
      key: key, date: date, dow: dow, entry: entry, art: art,
      feiertag: feiertag, neutral: neutral,
      soll: soll, ist: ist, za: za, diff: ist - soll
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

  /* ---------- Monate ---------- */

  // Alle Monate mit ihren Summen. Die Korrekturen werden dem Monat
  // zugeschlagen, in den ihr Datum fällt – was davor bzw. danach liegt,
  // landet im ersten bzw. letzten Monat, damit keine verloren geht.
  // "roh" ist das, was der Monat ohne Anpassung von Hand ergibt.
  function monatsBloecke(days, korr) {
    var out = [], by = {};

    (days || []).forEach(function (x) {
      var mk = x.key.slice(0, 7);
      if (!by[mk]) {
        by[mk] = { key: mk, days: [], ist: 0, soll: 0, za: 0, diff: 0, korr: 0 };
        out.push(by[mk]);
      }
      var m = by[mk];
      m.days.push(x);
      m.ist += x.ist; m.soll += x.soll; m.za += x.za; m.diff += x.diff;
    });

    if (out.length) {
      (korr || []).forEach(function (k) {
        var mk = k.datum ? k.datum.slice(0, 7) : '';
        var ziel = by[mk] || ((!mk || mk < out[0].key) ? out[0] : out[out.length - 1]);
        ziel.korr += k.h;
      });
    }

    out.forEach(function (m) { m.roh = m.diff + m.korr; });
    return out;
  }

  // Was die Monats-Anpassungen tatsächlich bewirken. Nur Monate, für die
  // es auch Tage gibt, zählen mit – sonst hinge eine Anpassung in der Luft.
  function monatsAnpassungen(days, korr, anpassungen) {
    var a = normAnpassungen(anpassungen);
    var out = [];
    monatsBloecke(days, korr).forEach(function (m) {
      var x = a.monate[m.key];
      if (!x) return;
      out.push({
        key: m.key, modus: x.modus, h: x.h, roh: m.roh,
        wirkung: x.modus === 'fix' ? x.h - m.roh : x.h
      });
    });
    return out;
  }

  /* Alles Zusätzliche in einem Rutsch: die Monats-Anpassungen und der
     Ausgleich fürs Gesamtkonto. Der Ausgleich ist die eine Buchung, die
     das Konto am Stichtag ("refKey", normalerweise heute) auf den von
     Hand gewünschten Stand hebt – davor bleibt alles, wie es war.     */
  function extrasOf(days, korr, settings, anpassungen, refKey) {
    var a = normAnpassungen(anpassungen);
    var monate = monatsAnpassungen(days, korr, a);
    var extra = { monate: monate, ausgleich: null };

    if (a.gesamt && refKey) {
      var ohne = saldoUntil(days, korr, settings, refKey, { monate: monate });
      extra.ausgleich = {
        key: refKey,
        modus: a.gesamt.modus,
        ziel: a.gesamt.h,
        roh: ohne.saldo,
        h: a.gesamt.modus === 'fix' ? a.gesamt.h - ohne.saldo : a.gesamt.h
      };
    }
    return extra;
  }

  // Konto-Stand bis einschließlich Datum "bisKey".
  // "extra" ist das Ergebnis von extrasOf() – fehlt es, wird schlicht
  // ohne die Anpassungen von Hand gerechnet.
  function saldoUntil(days, korr, settings, bisKey, extra) {
    var plan = 0, za = 0, ist = 0, soll = 0;
    days.forEach(function (x) {
      if (x.key > bisKey) return;
      plan += x.diff; za += x.za; ist += x.ist; soll += x.soll;
    });
    var k = 0;
    (korr || []).forEach(function (x) { if (!x.datum || x.datum <= bisKey) k += x.h; });

    var e = extra || {};
    var bisMonat = String(bisKey).slice(0, 7);
    var mAnp = 0;
    // Eine Monats-Anpassung zählt, sobald der Monat begonnen hat –
    // sonst würde sich das Konto im laufenden Monat nicht rühren.
    (e.monate || []).forEach(function (x) { if (x.key <= bisMonat) mAnp += x.wirkung; });
    var aus = (e.ausgleich && bisKey >= e.ausgleich.key) ? e.ausgleich.h : 0;

    return {
      plan: plan, korr: k, za: za, ist: ist, soll: soll,
      monatsAnp: mAnp, ausgleich: aus, anp: mAnp + aus,
      saldo: settings.startSaldo + plan + k + mAnp + aus
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
    var korr = korrList(ctx.korrekturen);
    var extra = extrasOf(days, korr, ctx.settings, ctx.anpassungen, nowKey);
    var res = saldoUntil(days, korr, ctx.settings, nowKey, extra);
    res.nowKey = nowKey;
    res.range = r;
    res.extra = extra;
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
    normAnpassungen: normAnpassungen,
    tagesSoll: tagesSoll,
    dayInfo: dayInfo,
    dataRange: dataRange,
    allDays: allDays,
    monatsBloecke: monatsBloecke,
    monatsAnpassungen: monatsAnpassungen,
    extrasOf: extrasOf,
    saldoUntil: saldoUntil,
    stand: stand
  };

})();
