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
     Konto = Übertrag + Summe der Tagesdifferenzen + Korrekturen –
             bis eine Abrechnung den Stand am Ende eines Monats festlegt;
             ab dann: Stand laut Abrechnung + alles, was danach kommt

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
     2. Über "anpassungen" wird der Kontostand am Ende eines Monats so
        gesetzt, wie er auf der Abrechnung steht (siehe weiter unten).

   Ein "ctx" ist dabei immer ein Objekt mit:
     plan        die gedruckten Dienste der Person
     entries     die Änderungen aus dem Kalender
     settings    { wochenSoll, startSaldo, startDatum, zaAbzug }
     korrekturen die von Hand erfassten Korrekturen
     anpassungen der Stand laut Abrechnung je Monat
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

  /* ---------- Stand laut Abrechnung ----------
     Jeden Monat kommt aus dem Betrieb eine Abrechnung für den Vormonat,
     z. B. "Ende Oktober: 10,75 Überstunden". Genau diese Zahl wird beim
     Monat eingetragen. "anpassungen" sieht dafür so aus:

       { monate: { '2026-10': { h: 10.75 } } }

     Bedeutung: Am letzten Tag dieses Monats steht das Konto auf GENAU
     dieser Zahl – es wird nichts dazu- oder abgerechnet. Alles davor
     (Übertrag, Dienstplan, Korrekturen, ältere Abrechnungen) ist damit
     erledigt; was danach im Dienstplan passiert, kommt ganz normal dazu.

     Ältere Einträge haben noch ein Feld "modus" ('delta' = dazurechnen,
     'fix' = nur das Ergebnis dieses einen Monats setzen). Gemeint war
     damit aber immer die Zahl aus der Abrechnung, deshalb gilt jetzt jeder
     Eintrag als Stand am Monatsende. Nur ein altes "±0" (entstand schon
     beim Antippen einer leeren Zeile) heißt weiterhin "nichts".
     Das frühere "Gesamtkonto von Hand" hielt die große Zahl an jedem Tag
     auf demselben Wert fest, neue Dienste wären so nie dazugekommen –
     das wird nicht mehr mitgerechnet.

     Die Funktion darf gefahrlos auf schon geprüfte Daten angewendet
     werden – sie liefert dann dasselbe zurück.                       */

  function normAnpassungen(raw) {
    var src = (raw && raw.monate) || {};
    var monate = {};

    Object.keys(src).forEach(function (mk) {
      if (!/^\d{4}-\d{2}$/.test(mk)) return;
      var x = src[mk] || {};
      var h = parseFloat(x.h);
      if (isNaN(h)) return;
      if (x.modus === 'delta' && Math.abs(h) < 0.005) return;   // altes "±0" ist nichts
      monate[mk] = { h: h, by: x.by || '', ts: x.ts || 0 };
    });

    return { monate: monate };
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

  /* Die Abrechnungen in zeitlicher Reihenfolge. Jede greift am letzten
     Tag ihres Monats, für den es Daten gibt ("tag"). Dazu steht drin,
     wo das Konto an diesem Tag ohne sie stünde ("roh"), und die eine
     Buchung, die es genau auf die Zahl aus der Abrechnung bringt
     ("wirkung" = Abrechnung − roh). Nur Monate, für die es auch Tage
     gibt, zählen mit – sonst hinge die Zahl in der Luft.            */
  function abrechnungen(days, korr, settings, anpassungen) {
    var a = normAnpassungen(anpassungen);
    var out = [];
    monatsBloecke(days, korr).forEach(function (m) {
      var x = a.monate[m.key];
      if (!x) return;
      var tag = m.days[m.days.length - 1].key;
      // Ältere Abrechnungen sind hier schon drin, spätere noch nicht
      var roh = saldoUntil(days, korr, settings, tag, { monate: out.slice() }).saldo;
      out.push({ key: m.key, tag: tag, h: x.h, roh: roh, wirkung: x.h - roh, by: x.by, ts: x.ts });
    });
    return out;
  }

  /* Alles, was von Hand dazukommt, in einem Rutsch – das sind die
     Abrechnungen. Ein fünfter Wert (früher der Stichtag fürs
     Gesamtkonto) wird nicht mehr gebraucht und schadet auch nicht.  */
  function extrasOf(days, korr, settings, anpassungen) {
    return { monate: abrechnungen(days, korr, settings, anpassungen) };
  }

  // Konto-Stand bis einschließlich Datum "bisKey".
  // "extra" ist das Ergebnis von extrasOf() – fehlt es, wird schlicht
  // ohne die Abrechnungen gerechnet.
  // Hat bis dahin eine Abrechnung gegriffen, steht sie in "abrechnung",
  // und "seit" sagt, was danach aus dem Plan und aus Korrekturen dazukam.
  // Der Stand ist dann genau: Abrechnung + seit.plan + seit.korr.
  function saldoUntil(days, korr, settings, bisKey, extra) {
    var e = extra || {};
    var letzte = null, anp = 0;
    (e.monate || []).forEach(function (x) {
      if (x.tag > bisKey) return;
      anp += x.wirkung;
      letzte = x;
    });
    var ab = letzte ? letzte.tag : null;

    var plan = 0, za = 0, ist = 0, soll = 0, seitPlan = 0;
    days.forEach(function (x) {
      if (x.key > bisKey) return;
      plan += x.diff; za += x.za; ist += x.ist; soll += x.soll;
      if (ab && x.key > ab) seitPlan += x.diff;
    });
    var k = 0, seitKorr = 0;
    (korr || []).forEach(function (x) {
      if (x.datum && x.datum > bisKey) return;
      k += x.h;
      if (ab && x.datum && x.datum > ab) seitKorr += x.h;
    });

    return {
      plan: plan, korr: k, za: za, ist: ist, soll: soll, anp: anp,
      abrechnung: letzte,
      seit: letzte ? { plan: seitPlan, korr: seitKorr } : null,
      // Mit Abrechnung direkt von deren Zahl aus gerechnet – so steht am
      // Stichtag wirklich exakt die Zahl da, ohne Rundungsrest.
      saldo: letzte
        ? letzte.h + seitPlan + seitKorr
        : settings.startSaldo + plan + k
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
    var extra = extrasOf(days, korr, ctx.settings, ctx.anpassungen);
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
    abrechnungen: abrechnungen,
    extrasOf: extrasOf,
    saldoUntil: saldoUntil,
    stand: stand
  };

})();
