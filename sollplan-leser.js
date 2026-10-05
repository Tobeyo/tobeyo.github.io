/* =========================================================
   SOLLPLAN-LESER – liest ein Foto des CGM-ON-DUTY-Sollplans
   ---------------------------------------------------------
   Wird von "dienstplan-ics.html" geladen. Alles passiert im
   Browser, das Foto verlässt das Gerät nie.

   So wird gelesen:
     0. Finden      Die dicken blauen Linien um jedes Wochen-
                    ende verraten, wo das Tage-Gitter liegt
                    (autoGrid). Der Nutzer kann die vier Ecken
                    danach noch verschieben.
     1. Entzerren   Die vier Ecken des Tage-Gitters ergeben
                    eine Perspektiv-Abbildung. Damit lässt sich
                    jede Zelle (Person × Tag) gerade heraus-
                    schneiden – auch wenn das Foto schräg ist.
     2. Zellen      Grünes Feld → Urlaub. Sonst Rasterlinien
                    und Staub weg; zwei breite Textzeilen →
                    Dienstzeit, ein kurzes Wort → Code (SP …),
                    nichts bzw. nur „-“ → frei.
     3. Gruppen     Gleiche Einträge sehen gleich aus. Die
                    Zeit-Zellen werden nach Aussehen gruppiert;
                    das Mittel einer Gruppe ist viel schärfer
                    als jede einzelne Zelle.
     4. Lesen       Jede Zeile des Gruppenbilds wird mit
                    gezeichneten Vorlagen aller Viertelstunden
                    (00:00 … 23:45) verglichen; die ähnlichste
                    gewinnt. Die Schrift wird dabei aus einer
                    kleinen Auswahl automatisch bestimmt.
     5. Kalender    Aus den Einträgen wird eine .ics-Datei.

   Der Nutzer bestätigt am Ende nur noch die paar Gruppen
   („07:00–17:30, 25×“) statt jeder einzelnen Zelle.
   ========================================================= */

(function (root) {
  'use strict';

  var CELL_PX = 90;          // Zellen werden auf ~90 Pixel Breite hochgerechnet
  var MIN_FLECK = 0.0045;    // kleinere Tintenflecken (Anteil der Zellfläche) sind Staub

  /* ---------- Geometrie: Perspektive aus vier Punkten ---------- */

  // 3×3-Matrix, die src[i] → dst[i] abbildet (je vier [x, y])
  function homography(src, dst) {
    var A = [], b = [], i, r, c, k;
    for (i = 0; i < 4; i++) {
      var x = src[i][0], y = src[i][1], X = dst[i][0], Y = dst[i][1];
      A.push([x, y, 1, 0, 0, 0, -x * X, -y * X]); b.push(X);
      A.push([0, 0, 0, x, y, 1, -x * Y, -y * Y]); b.push(Y);
    }
    for (c = 0; c < 8; c++) {
      var p = c;
      for (r = c + 1; r < 8; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
      var t = A[c]; A[c] = A[p]; A[p] = t;
      t = b[c]; b[c] = b[p]; b[p] = t;
      if (Math.abs(A[c][c]) < 1e-12) return null;      // Punkte liegen auf einer Linie
      for (r = 0; r < 8; r++) {
        if (r === c) continue;
        var f = A[r][c] / A[c][c];
        for (k = c; k < 8; k++) A[r][k] -= f * A[c][k];
        b[r] -= f * b[c];
      }
    }
    var h = b.map(function (v, j) { return v / A[j][j]; });
    return [h[0], h[1], h[2], h[3], h[4], h[5], h[6], h[7], 1];
  }

  function project(H, x, y) {
    var w = H[6] * x + H[7] * y + H[8];
    return [(H[0] * x + H[1] * y + H[2]) / w, (H[3] * x + H[4] * y + H[5]) / w];
  }

  // Abbildung vom Einheitsquadrat (u, v ∈ 0…1) auf das Viereck im Foto
  function gridMap(quad) {
    return homography([[0, 0], [1, 0], [1, 1], [0, 1]], quad);
  }

  // Ausschnitt u0…u1 × v0…v1 als gerades Bild mit w × h Pixeln (bilinear)
  function warp(img, H, u0, v0, u1, v1, w, h) {
    var out = new Uint8ClampedArray(w * h * 4), W = img.width, Hh = img.height, d = img.data;
    for (var j = 0; j < h; j++) {
      for (var i = 0; i < w; i++) {
        var p = project(H, u0 + (u1 - u0) * (i + 0.5) / w, v0 + (v1 - v0) * (j + 0.5) / h);
        var x = p[0] - 0.5, y = p[1] - 0.5;
        var x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0;
        var xa = x0 < 0 ? 0 : x0 >= W ? W - 1 : x0, xb = x0 + 1 < 0 ? 0 : x0 + 1 >= W ? W - 1 : x0 + 1;
        var ya = y0 < 0 ? 0 : y0 >= Hh ? Hh - 1 : y0, yb = y0 + 1 < 0 ? 0 : y0 + 1 >= Hh ? Hh - 1 : y0 + 1;
        var o = (j * w + i) * 4, a = (ya * W + xa) * 4, bq = (ya * W + xb) * 4, cq = (yb * W + xa) * 4, dq = (yb * W + xb) * 4;
        var w00 = (1 - fx) * (1 - fy), w10 = fx * (1 - fy), w01 = (1 - fx) * fy, w11 = fx * fy;
        out[o] = d[a] * w00 + d[bq] * w10 + d[cq] * w01 + d[dq] * w11;
        out[o + 1] = d[a + 1] * w00 + d[bq + 1] * w10 + d[cq + 1] * w01 + d[dq + 1] * w11;
        out[o + 2] = d[a + 2] * w00 + d[bq + 2] * w10 + d[cq + 2] * w01 + d[dq + 2] * w11;
        out[o + 3] = 255;
      }
    }
    return { width: w, height: h, data: out };
  }

  // Wie groß eine Zelle im Foto ungefähr ist (Pixel)
  function cellSize(quad, days, rows) {
    function len(a, b) { return Math.hypot(a[0] - b[0], a[1] - b[1]); }
    var wpx = (len(quad[0], quad[1]) + len(quad[3], quad[2])) / 2;
    var hpx = (len(quad[0], quad[3]) + len(quad[1], quad[2])) / 2;
    return { w: wpx / days, h: hpx / rows };
  }

  /* ---------- Eine Zelle verstehen ---------- */

  function rgbToHue(r, g, b) {
    var mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
    if (!d) return 0;
    var h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return (h * 60 + 360) % 360;
  }

  // Farbiges Feld? → { farbe: 'gruen' | 'gelb' | …, anteil, rgb }
  // Nur kräftige Farben zählen (wie das Urlaubs-Grün). Blasse Hinterlegungen –
  // etwa farbige Wochenenden in einem Screenshot – sind kein Eintrag.
  function fieldColor(c) {
    var d = c.data, n = c.width * c.height, sat = 0, sr = 0, sg = 0, sb = 0;
    for (var i = 0; i < n; i++) {
      var r = d[i * 4], g = d[i * 4 + 1], b = d[i * 4 + 2];
      var mx = Math.max(r, g, b), mn = Math.min(r, g, b);
      if (mx > 40 && (mx - mn) / mx > 0.16 && mx - mn > 22) { sat++; sr += r; sg += g; sb += b; }
    }
    if (sat / n < 0.33) return null;
    sr /= sat; sg /= sat; sb /= sat;
    var smx = Math.max(sr, sg, sb), smn = Math.min(sr, sg, sb);
    if (smx > 185 && (smx - smn) / smx < 0.45) return null;    // hell & blass = nur hinterlegt
    var hue = rgbToHue(sr, sg, sb);
    var name = hue < 20 || hue >= 330 ? 'rot' : hue < 45 ? 'orange' : hue < 70 ? 'gelb' : hue < 170 ? 'gruen'
      : hue < 200 ? 'tuerkis' : hue < 260 ? 'blau' : 'lila';
    return { farbe: name, anteil: sat / n, rgb: [Math.round(sr), Math.round(sg), Math.round(sb)] };
  }

  // „Tinte“: wie viel dunkler als das Papier (0 … 1). Rasterlinien und
  // kleine Flecken (Staub, Linienreste, der „-“, Doppelpunkte) fallen weg.
  function inkMap(c) {
    var w = c.width, h = c.height, n = w * h, d = c.data, i;
    var gray = new Float32Array(n);
    for (i = 0; i < n; i++) gray[i] = 0.3 * d[i * 4] + 0.55 * d[i * 4 + 1] + 0.15 * d[i * 4 + 2];
    var sorted = Array.prototype.slice.call(gray).sort(function (a, b) { return a - b; });
    var paper = sorted[Math.floor(n * 0.75)];
    // Farbstich des Papiers (Blau minus Rot), damit warmes/kaltes Licht nicht stört
    var tint = 0, tn = 0;
    for (i = 0; i < n; i++) if (gray[i] >= paper - 8) { tint += d[i * 4 + 2] - d[i * 4]; tn++; }
    tint = tn ? tint / tn : 0;
    var ink = new Float32Array(n), blue = new Uint8Array(n);
    for (i = 0; i < n; i++) {
      ink[i] = Math.max(0, Math.min(1, (paper - gray[i]) / 110));
      // Die Schrift ist grau, die dicken Wochenlinien sind dunkelblau
      if (ink[i] > 0.2 && d[i * 4 + 2] - d[i * 4] - tint >= 9 && d[i * 4 + 2] - d[i * 4 + 1] >= 4) blue[i] = 1;
    }
    for (i = 0; i < n; i++) {
      if (!blue[i]) continue;
      var bx = i % w;
      ink[i] = 0;
      if (bx > 0) ink[i - 1] = 0;
      if (bx < w - 1 && !blue[i + 1]) ink[i + 1] = 0;
    }

    // Rasterlinien = lange waagrechte bzw. senkrechte Läufe
    function runs(len, step, count, stride, maxRun) {
      for (var a = 0; a < count; a++) {
        var start = -1;
        for (var b = 0; b <= len; b++) {
          var on = b < len && ink[a * stride + b * step] > 0.25;
          if (on && start < 0) start = b;
          if (!on && start >= 0) {
            if (b - start > maxRun) for (var k = start; k < b; k++) ink[a * stride + k * step] = 0;
            start = -1;
          }
        }
      }
    }
    runs(w, 1, h, w, w * 0.34);
    runs(h, w, w, 1, h * 0.42);

    // Zusammenhängende Flecken: zu kleine weg
    var lab = new Int32Array(n), out = new Float32Array(n), minArea = n * MIN_FLECK;
    var stack = [], id = 0;
    for (var p = 0; p < n; p++) {
      if (lab[p] || ink[p] <= 0.3) continue;
      id++;
      var px = [];
      stack.push(p); lab[p] = id;
      while (stack.length) {
        var q = stack.pop(); px.push(q);
        var qx = q % w, qy = (q - qx) / w;
        for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) {
          var nx = qx + dx, ny = qy + dy;
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          var nq = ny * w + nx;
          if (!lab[nq] && ink[nq] > 0.3) { lab[nq] = id; stack.push(nq); }
        }
      }
      if (px.length < minArea) continue;
      // schmale Reste am Zellrand (Linienstücke) weglassen
      var lx = w, hx = -1, ly = h, hy = -1;
      for (var t = 0; t < px.length; t++) {
        var ppx = px[t] % w, ppy = (px[t] - ppx) / w;
        if (ppx < lx) lx = ppx; if (ppx > hx) hx = ppx; if (ppy < ly) ly = ppy; if (ppy > hy) hy = ppy;
      }
      if ((lx === 0 || hx === w - 1) && hx - lx + 1 < w * 0.06) continue;
      if ((ly === 0 || hy === h - 1) && hy - ly + 1 < h * 0.06) continue;
      for (var t2 = 0; t2 < px.length; t2++) out[px[t2]] = ink[px[t2]];
    }
    return { w: w, h: h, ink: out };
  }

  // Größter zusammenhängender Bereich in einem Profil (Lücken bis maxGap zählen mit)
  function mainSpan(prof, minVal, maxGap) {
    var spans = [], cur = null;
    for (var i = 0; i < prof.length; i++) {
      if (prof[i] < minVal) continue;
      if (cur && i - cur.b - 1 <= maxGap) { cur.b = i; cur.mass += prof[i]; }
      else { cur = { a: i, b: i, mass: prof[i] }; spans.push(cur); }
    }
    var best = null;
    spans.forEach(function (sp) { if (!best || sp.mass > best.mass) best = sp; });
    return best;
  }

  // Rahmen um den Text im Bereich x0…x1 × y0…y1 – einzelne Ausreißer
  // (Reste von Rasterlinien, Text der Nachbarzelle) bleiben draußen.
  function bbox(m, x0, y0, x1, y1) {
    var w = m.w, x, y, s, col = [], row = [];
    for (x = x0; x < x1; x++) { s = 0; for (y = y0; y < y1; y++) if (m.ink[y * w + x] > 0.3) s++; col.push(s); }
    var sx = mainSpan(col, 1, Math.max(2, Math.round(m.w * 0.15)));
    if (!sx) return null;
    for (y = y0; y < y1; y++) { s = 0; for (x = x0 + sx.a; x <= x0 + sx.b; x++) if (m.ink[y * w + x] > 0.3) s++; row.push(s); }
    var sy = mainSpan(row, 1, Math.max(1, Math.round(m.h * 0.04)));
    if (!sy) return null;
    return { x0: x0 + sx.a, x1: x0 + sx.b + 1, y0: y0 + sy.a, y1: y0 + sy.b + 1 };
  }

  // Trennlinie zwischen den zwei Textzeilen (Minimum im Tinten-Profil)
  function splitLines(m) {
    var w = m.w, h = m.h, prof = [], y, x;
    for (y = 0; y < h; y++) { var s = 0; for (x = 0; x < w; x++) s += m.ink[y * w + x]; prof.push(s); }
    var best = Math.round(h / 2), bv = Infinity;
    for (y = Math.max(1, Math.round(h * 0.35)); y < Math.min(h - 1, Math.round(h * 0.65)); y++) {
      var v = prof[y - 1] + prof[y] + prof[y + 1];
      if (v < bv) { bv = v; best = y; }
    }
    return best;
  }

  // Ausschnitt b der Tinten-Karte auf FW × FH Felder mitteln
  function resample(m, b, FW, FH) {
    var v = new Float32Array(FW * FH), bw = b.x1 - b.x0, bh = b.y1 - b.y0;
    for (var j = 0; j < FH; j++) for (var i = 0; i < FW; i++) {
      var xa = b.x0 + bw * i / FW, xb = b.x0 + bw * (i + 1) / FW, ya = b.y0 + bh * j / FH, yb = b.y0 + bh * (j + 1) / FH;
      var s = 0, wsum = 0;
      for (var y = Math.floor(ya); y < Math.ceil(yb); y++) {
        var wy = Math.min(yb, y + 1) - Math.max(ya, y);
        for (var x = Math.floor(xa); x < Math.ceil(xb); x++) {
          var wx = Math.min(xb, x + 1) - Math.max(xa, x), ww = wx * wy;
          s += m.ink[y * m.w + x] * ww; wsum += ww;
        }
      }
      v[j * FW + i] = wsum ? s / wsum : 0;
    }
    return v;
  }

  // Mittelwert weg, Länge 1 – dann ist das Skalarprodukt die Korrelation
  function normalize(v, mean) {
    var out = new Float32Array(v.length), k, m = 0, nn = 0;
    if (mean) for (k = 0; k < v.length; k++) out[k] = v[k] - mean[k];
    else {
      for (k = 0; k < v.length; k++) m += v[k];
      m /= v.length;
      for (k = 0; k < v.length; k++) out[k] = v[k] - m;
    }
    for (k = 0; k < v.length; k++) nn += out[k] * out[k];
    nn = Math.sqrt(nn) || 1;
    for (k = 0; k < v.length; k++) out[k] /= nn;
    return out;
  }

  function dot(a, b) { var s = 0; for (var i = 0; i < a.length; i++) s += a[i] * b[i]; return s; }

  var FEAT_W = 30, FEAT_H = 9;

  // Eine Zelle einordnen: zeit | farbe | code | leer
  function analyseCell(c) {
    var col = fieldColor(c);
    var m = inkMap(c), mid = splitLines(m);
    var top = bbox(m, 0, 0, m.w, mid), bot = bbox(m, 0, mid, m.w, m.h), all = bbox(m, 0, 0, m.w, m.h);
    var wt = top ? (top.x1 - top.x0) / m.w : 0, wb = bot ? (bot.x1 - bot.x0) / m.w : 0;
    var r = { kind: 'leer', m: m, top: top, bot: bot, all: all };
    // Zwei breite Textzeilen sind eine Dienstzeit – auch auf farbigem Grund
    // (manche Ansichten hinterlegen z. B. Wochenenden farbig)
    if (wt > 0.45 && wb > 0.45 && (top.y1 - top.y0) > m.h * 0.12 && (bot.y1 - bot.y0) > m.h * 0.12) {
      r.kind = 'zeit';               // Merkmal kommt später (features), wenn alle Zellen bekannt sind
    } else if (col) {
      r.kind = 'farbe'; r.farbe = col.farbe; r.rgb = col.rgb;
    } else if (all && (all.x1 - all.x0) / m.w > 0.18 && (all.y1 - all.y0) / m.h > 0.12) {
      r.kind = 'code';
      r.f = normalize(resample(m, all, 20, 10));
    }
    return r;
  }

  // Merkmale der Zeit-Zellen: beide Textzeilen auf ein festes Raster gemittelt
  function features(cells) {
    var zeit = cells.filter(function (c) { return c.kind === 'zeit'; });
    zeit.forEach(function (c) {
      var f1 = normalize(resample(c.m, c.top, FEAT_W, FEAT_H)), f2 = normalize(resample(c.m, c.bot, FEAT_W, FEAT_H));
      c.f = new Float32Array(f1.length * 2);
      c.f.set(f1); c.f.set(f2, f1.length);
    });
  }

  // Ganzes Gitter lesen. onProgress(anteil) optional.
  function readGrid(img, quad, days, rows, onProgress) {
    var H = gridMap(quad);
    if (!H) throw new Error('Die vier Ecken liegen auf einer Linie.');
    var cs = cellSize(quad, days, rows);
    // Zellen etwas hochrechnen, aber nicht unnötig groß
    var scale = Math.max(1, Math.min(3, CELL_PX / cs.w));
    var CW = Math.round(Math.max(48, Math.min(180, cs.w * scale)));
    var RH = Math.round(Math.max(36, Math.min(180, cs.h * scale)));
    var cells = [];
    for (var r = 0; r < rows; r++) {
      for (var d = 0; d < days; d++) {
        var c = warp(img, H, d / days, r / rows, (d + 1) / days, (r + 1) / rows, CW, RH);
        var a = analyseCell(c);
        a.r = r; a.d = d;
        cells.push(a);
      }
      if (onProgress) onProgress((r + 1) / rows);
    }
    features(cells);
    return { cells: cells, H: H, cw: CW, rh: RH };
  }

  /* ---------- Gruppen gleich aussehender Zellen ---------- */

  function centroid(members) {
    var s = new Float32Array(members[0].g.length);
    members.forEach(function (c) { for (var i = 0; i < s.length; i++) s[i] += c.g[i]; });
    return normalize(s, new Float32Array(s.length));
  }

  // Zellen mit Merkmal .f gruppieren. Vorher den gemeinsamen Anteil
  // abziehen – sonst sehen alle „HH:MM“-Zellen gleich aus.
  function cluster(items, threshold) {
    if (!items.length) return [];
    var n = items[0].f.length, mean = new Float32Array(n);
    items.forEach(function (c) { for (var i = 0; i < n; i++) mean[i] += c.f[i] / items.length; });
    items.forEach(function (c) { c.g = items.length > 2 ? normalize(c.f, mean) : c.f; });
    var cl = [];
    items.forEach(function (c) {
      var best = null, bs = -9;
      cl.forEach(function (k) { var s = dot(c.g, k.c); if (s > bs) { bs = s; best = k; } });
      if (best && bs > threshold) { best.m.push(c); best.c = centroid(best.m); }
      else cl.push({ m: [c], c: Float32Array.from(c.g) });
    });
    for (var it = 0; it < 6; it++) {
      cl.forEach(function (k) { k.m = []; });
      items.forEach(function (c) {
        var best = null, bs = -9;
        cl.forEach(function (k) { var s = dot(c.g, k.c); if (s > bs) { bs = s; best = k; } });
        best.m.push(c); c.sim = bs;
      });
      cl = cl.filter(function (k) { return k.m.length; });
      cl.forEach(function (k) { k.c = centroid(k.m); });
    }
    return cl.sort(function (a, b) { return b.m.length - a.m.length; });
  }

  // Gemitteltes Bild einer Textzeile (which = 'top' | 'bot' | 'all')
  function composite(members, which, LW, LH) {
    var acc = new Float32Array(LW * LH);
    members.forEach(function (c) {
      var v = resample(c.m, c[which], LW, LH);
      for (var i = 0; i < acc.length; i++) acc[i] += v[i] / members.length;
    });
    return acc;
  }

  /* ---------- Vorlagen: alle Viertelstunden, gezeichnet ---------- */

  var MATCH_W = 48, MATCH_H = 14;
  var FONTS = [
    'Arial, "Liberation Sans", Helvetica, sans-serif',
    'bold Arial, "Liberation Sans", Helvetica, sans-serif',
    'Verdana, "DejaVu Sans", sans-serif',
    'bold Verdana, "DejaVu Sans", sans-serif',
    'Tahoma, Geneva, sans-serif',
    '"Segoe UI", Roboto, sans-serif',
    '"Courier New", monospace'
  ];

  function two(n) { return (n < 10 ? '0' : '') + n; }

  var TIMES = [];
  for (var hh = 0; hh < 24; hh++) for (var mm = 0; mm < 60; mm += 15) TIMES.push(two(hh) + ':' + two(mm));

  // Zeichnet "HH:MM" ohne Doppelpunkt (der fällt im Foto als Fleck weg)
  function renderTime(ctx, text, font, size) {
    var bold = /^bold /.test(font);
    ctx.font = (bold ? 'bold ' : '') + size + 'px ' + font.replace(/^bold /, '');
    var cw = ctx.canvas.width, ch = ctx.canvas.height;
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cw, ch);
    ctx.fillStyle = '#000'; ctx.textBaseline = 'middle';
    var left = text.slice(0, 2), right = text.slice(3);
    var x = size * 0.3;
    ctx.fillText(left, x, ch / 2);
    ctx.fillText(right, x + ctx.measureText(text.slice(0, 3)).width, ch / 2);
    var id = ctx.getImageData(0, 0, cw, ch), n = cw * ch, ink = new Float32Array(n);
    for (var i = 0; i < n; i++) ink[i] = 1 - id.data[i * 4] / 255;
    var m = { w: cw, h: ch, ink: ink };
    var b = bbox(m, 0, 0, cw, ch);
    return b ? normalize(blur(resample(m, b, MATCH_W, MATCH_H), MATCH_W, MATCH_H)) : null;
  }

  var templateCache = {};
  function templates(font) {
    if (templateCache[font]) return templateCache[font];
    var cv = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(220, 80) : document.createElement('canvas');
    cv.width = 220; cv.height = 80;
    var ctx = cv.getContext('2d', { willReadFrequently: true });
    var list = [];
    TIMES.forEach(function (t) {
      var v = renderTime(ctx, t, font, 48);
      if (v) list.push({ text: t, v: v });
    });
    templateCache[font] = list;
    return list;
  }

  // Weichzeichnen (Binomial 1-2-1, zweimal) – Foto und Vorlage werden so
  // gleich „verwaschen“ und kleine Verschiebungen stören weniger.
  function blur(v, W, H) {
    var a = Float32Array.from(v), b = new Float32Array(v.length), x, y, pass;
    for (pass = 0; pass < 2; pass++) {
      for (y = 0; y < H; y++) for (x = 0; x < W; x++) {
        var l = a[y * W + Math.max(0, x - 1)], r = a[y * W + Math.min(W - 1, x + 1)];
        b[y * W + x] = (l + 2 * a[y * W + x] + r) / 4;
      }
      for (y = 0; y < H; y++) for (x = 0; x < W; x++) {
        var u = b[Math.max(0, y - 1) * W + x], dn = b[Math.min(H - 1, y + 1) * W + x];
        a[y * W + x] = (u + 2 * b[y * W + x] + dn) / 4;
      }
    }
    return a;
  }

  // Beste Vorlagen für ein Zeilenbild (bereits MATCH_W × MATCH_H)
  function matchLine(vec, font) {
    var v = normalize(blur(vec, MATCH_W, MATCH_H));
    return templates(font).map(function (t) { return { text: t.text, score: dot(v, t.v) }; })
      .sort(function (a, b) { return b.score - a.score; });
  }

  // Schrift wählen, die über alle Gruppen am besten passt
  function pickFont(lines) {
    var best = FONTS[0], bs = -9;
    FONTS.forEach(function (f) {
      var s = 0;
      lines.forEach(function (l) { s += matchLine(l, f)[0].score; });
      if (s > bs) { bs = s; best = f; }
    });
    return best;
  }

  /* ---------- Alles zusammen ---------- */

  function scoreOf(list, text) {
    for (var i = 0; i < list.length; i++) if (list[i].text === text) return list[i].score;
    return -1;
  }

  // Die Zelle einer Gruppe, die dem Gruppenmittel am nächsten ist (fürs Vorschaubild)
  function medoid(members) {
    var best = members[0];
    members.forEach(function (c) { if ((c.sim || 0) > (best.sim || 0)) best = c; });
    return best;
  }

  var PRIOR = 0.08;   // Bonus für Beschriftungen, die eine größere Gruppe schon hat
  var ZWEIFEL = 0.03; // so viel besser muss ein anderer Dienst zu einer Zelle passen

  // Abzug für unwahrscheinliche Dienste (sehr kurz, sehr lang, über Mitternacht, mitten in der Nacht)
  function implausible(von, bis) {
    var a = +von.slice(0, 2) * 60 + +von.slice(3), b = +bis.slice(0, 2) * 60 + +bis.slice(3), p = 0;
    var dur = b - a;
    if (dur <= 0) { p += 0.06; dur += 1440; }
    if (dur < 60 || dur > 13 * 60) p += 0.1;
    if (a < 4 * 60) p += 0.05;
    return p;
  }

  /*
   * Liefert { gruppen, font }. Jede Gruppe:
   *   { id, typ: 'dienst' | 'code' | 'farbe', eintrag, zellen, beispiel, unsicher, vorschlaege }
   * eintrag = { art: 'dienst', von, bis } | { art: 'code', text } | { art: 'frei' }
   * Jede Zelle bekommt .gruppe (Index) – leere Zellen haben keine.
   */
  function interpret(grid) {
    var cells = grid.cells;
    var zeit = cells.filter(function (c) { return c.kind === 'zeit'; });
    var code = cells.filter(function (c) { return c.kind === 'code'; });
    var farbe = cells.filter(function (c) { return c.kind === 'farbe'; });
    var gruppen = [];

    var zc = cluster(zeit, 0.3), lines = [];
    zc.forEach(function (k) {
      k.top = composite(k.m, 'top', MATCH_W, MATCH_H);
      k.bot = composite(k.m, 'bot', MATCH_W, MATCH_H);
      lines.push(k.top, k.bot);
    });
    var font = lines.length ? pickFont(lines) : FONTS[0];
    var known = [];
    zc.forEach(function (k) {
      var a = matchLine(k.top, font), b = matchLine(k.bot, font);
      var own = { von: a[0].text, bis: b[0].text, s: a[0].score + b[0].score };
      // Kombinationen der besten Lesarten, dazu die Beschriftungen größerer Gruppen
      var cands = [];
      for (var i = 0; i < 5; i++) for (var j = 0; j < 5; j++) cands.push({ von: a[i].text, bis: b[j].text, s: a[i].score + b[j].score });
      known.forEach(function (l) { cands.push({ von: l.von, bis: l.bis, s: scoreOf(a, l.von) + scoreOf(b, l.bis) + PRIOR }); });
      var pick = null;
      cands.forEach(function (c) {
        c.s -= implausible(c.von, c.bis);
        if (!pick || c.s > pick.s) pick = c;
      });
      var margin = Math.min(a[0].score - a[1].score, b[0].score - b[1].score);
      var schwach = Math.min(a[0].score, b[0].score) < 0.45;
      var unsicher = pick.von !== own.von || pick.bis !== own.bis || margin < 0.01 || schwach || k.m.length < 2 || implausible(pick.von, pick.bis) > 0;
      var tragend = !schwach && k.m.length >= 3 && !implausible(pick.von, pick.bis);   // taugt als Vorbild für kleinere Gruppen
      if (tragend && !known.some(function (l) { return l.von === pick.von && l.bis === pick.bis; })) known.push(pick);
      var vorschlaege = [];
      [[0, 0], [1, 0], [0, 1], [1, 1]].forEach(function (ij) {
        var v = a[ij[0]].text, bis = b[ij[1]].text;
        if (!implausible(v, bis) && !vorschlaege.some(function (x) { return x.von === v && x.bis === bis; })) vorschlaege.push({ von: v, bis: bis });
      });
      gruppen.push({
        typ: 'dienst',
        eintrag: { art: 'dienst', von: pick.von, bis: pick.bis },
        zellen: k.m,
        beispiel: medoid(k.m),
        unsicher: unsicher,
        tragend: tragend,
        vorschlaege: vorschlaege,
        lesung: { von: a.slice(0, 5), bis: b.slice(0, 5) }
      });
    });
    // Beschriftungen der sicheren Gruppen überall als Vorschlag anbieten
    gruppen.forEach(function (g) {
      var list = known.map(function (l) { return { von: l.von, bis: l.bis }; }).concat(g.vorschlaege);
      var out = [];
      list.forEach(function (x) {
        if ((x.von !== g.eintrag.von || x.bis !== g.eintrag.bis) && !out.some(function (y) { return y.von === x.von && y.bis === x.bis; })) out.push(x);
      });
      g.vorschlaege = out.slice(0, 5);
    });

    cluster(code, 0.25).forEach(function (k) {
      gruppen.push({ typ: 'code', eintrag: { art: 'code', text: '' }, zellen: k.m, beispiel: medoid(k.m), unsicher: true, vorschlaege: [] });
    });

    // Farbfelder nach Farbe; grün heißt im CGM-Plan Urlaub
    var byColor = {};
    farbe.forEach(function (c) { (byColor[c.farbe] = byColor[c.farbe] || []).push(c); });
    Object.keys(byColor).forEach(function (f) {
      var gruen = f === 'gruen';
      gruppen.push({
        typ: 'farbe', farbe: f, rgb: byColor[f][0].rgb,
        eintrag: gruen ? { art: 'code', text: 'U' } : { art: 'code', text: '' },
        zellen: byColor[f], beispiel: byColor[f][0], unsicher: !gruen, vorschlaege: []
      });
    });

    // Gruppen mit gleichem Eintrag zusammenlegen (die größte gibt Bild und Vorschläge vor)
    var merged = [];
    gruppen.forEach(function (g) {
      var e = g.eintrag, twin = null;
      if (g.typ === 'dienst' || (g.typ === 'code' && e.text)) {
        merged.forEach(function (h) {
          if (h.typ === g.typ && h.eintrag.art === e.art && h.eintrag.von === e.von && h.eintrag.bis === e.bis && h.eintrag.text === e.text) twin = h;
        });
      }
      if (!twin) { merged.push(g); return; }
      if (g.zellen.length > twin.zellen.length) {
        g.zellen = g.zellen.concat(twin.zellen);
        g.unsicher = g.unsicher || twin.unsicher;
        g.tragend = g.tragend || twin.tragend;
        merged[merged.indexOf(twin)] = g;
      } else {
        twin.zellen = twin.zellen.concat(g.zellen);
        twin.unsicher = twin.unsicher || g.unsicher;
        twin.tragend = twin.tragend || g.tragend;
      }
    });
    gruppen = merged;
    gruppen.forEach(function (g, i) { g.id = i; g.zellen.forEach(function (c) { c.gruppe = i; }); });

    // Jede Zeit-Zelle einzeln gegenprüfen: Passt ein anderer (sicher gelesener)
    // Dienst deutlich besser zu ihr als der ihrer Gruppe, wird sie als Zweifel
    // markiert – so bleibt kein Ausreißer still in einer Gruppe.
    var labels = gruppen.filter(function (g) { return g.typ === 'dienst' && g.tragend; }).map(function (g) { return g.eintrag; });
    if (labels.length > 1) {
      var byText = {};
      templates(font).forEach(function (t) { byText[t.text] = t.v; });
      zeit.forEach(function (c) {
        var g = gruppen[c.gruppe];
        if (!g || g.eintrag.art !== 'dienst') return;
        var tv = normalize(blur(resample(c.m, c.top, MATCH_W, MATCH_H), MATCH_W, MATCH_H));
        var bv = normalize(blur(resample(c.m, c.bot, MATCH_W, MATCH_H), MATCH_W, MATCH_H));
        function sc(l) { return byText[l.von] && byText[l.bis] ? dot(tv, byText[l.von]) + dot(bv, byText[l.bis]) : -9; }
        var own = sc(g.eintrag), best = null;
        labels.forEach(function (l) {
          if (l.von === g.eintrag.von && l.bis === g.eintrag.bis) return;
          var v = sc(l);
          if (v > own + ZWEIFEL && (!best || v > best.s)) best = { l: l, s: v };
        });
        if (best) { c.zweifel = { art: 'dienst', von: best.l.von, bis: best.l.bis }; g.unsicher = true; }
      });
    }
    return { gruppen: gruppen, font: font };
  }

  /* ---------- Gitter automatisch finden ---------- */

  /*
   * Im CGM-Sollplan rahmen dicke dunkelblaue Linien jedes Wochenende ein
   * (vor jedem Samstag und vor jedem Montag). Kennt man den Monat, weiß
   * man, hinter welchem Tag jede dieser Linien liegen muss – daraus
   * ergeben sich Spaltenbreite, linker und rechter Rand. Oben und unten
   * enden die Linien genau am Rand der Personen-Zeilen.
   * Liefert die vier Ecken [[x,y] oben links, oben rechts, unten rechts,
   * unten links] oder null.
   */
  function autoGrid(img, jahr, monat) {
    var W = img.width, Hh = img.height, d = img.data;
    var step = Math.max(1, Math.round(Math.max(W, Hh) / 1400));
    var pts = [], x, y, o;
    // Farbstich des Papiers
    var tint = 0, tn = 0;
    for (y = 0; y < Hh; y += step * 4) for (x = 0; x < W; x += step * 4) {
      o = (y * W + x) * 4;
      if (0.3 * d[o] + 0.55 * d[o + 1] + 0.15 * d[o + 2] > 150) { tint += d[o + 2] - d[o]; tn++; }
    }
    tint = tn ? tint / tn : 0;
    for (y = 0; y < Hh; y += step) for (x = 0; x < W; x += step) {
      o = (y * W + x) * 4;
      var r = d[o], g = d[o + 1], b = d[o + 2];
      if (0.3 * r + 0.55 * g + 0.15 * b < 150 && b - r - tint >= 9 && b - g >= 3) pts.push(x, y);
    }
    var n = pts.length / 2;
    if (n < 30) return null;
    var cy = Hh / 2, nb = Math.ceil(W / step) + 1;

    // Neigung der Linien: der Winkel mit den schärfsten Spitzen
    function histFor(t) {
      var h = new Float32Array(nb);
      for (var i = 0; i < n; i++) {
        var xx = Math.round((pts[2 * i] - (pts[2 * i + 1] - cy) * t) / step);
        if (xx >= 0 && xx < nb) h[xx]++;
      }
      return h;
    }
    var bestT = 0, bestS = -1, bestH = null;
    for (var deg = -12; deg <= 12; deg += 0.5) {
      var t = Math.tan(deg * Math.PI / 180), h = histFor(t), sc = 0;
      for (var k = 1; k < nb - 1; k++) { var v = h[k - 1] + h[k] + h[k + 1]; sc += v * v; }
      if (sc > bestS) { bestS = sc; bestT = t; bestH = h; }
    }
    var hs = new Float32Array(nb), mx = 0;
    for (var k2 = 1; k2 < nb - 1; k2++) { hs[k2] = bestH[k2 - 1] + bestH[k2] + bestH[k2 + 1]; mx = Math.max(mx, hs[k2]); }
    var minSep = Math.max(2, Math.round(nb * 0.008)), peaks = [];
    for (var k3 = 1; k3 < nb - 1; k3++) {
      if (hs[k3] < mx * 0.25 || hs[k3] < hs[k3 - 1] || hs[k3] < hs[k3 + 1]) continue;
      var isMax = true;
      for (var q = Math.max(0, k3 - minSep); q <= Math.min(nb - 1, k3 + minSep); q++) if (hs[q] > hs[k3] || (hs[q] === hs[k3] && q < k3)) { isMax = false; break; }
      if (isMax) peaks.push(k3);
    }
    if (peaks.length < 2) return null;

    // Je Linie: oberes und unteres Ende (längster zusammenhängender Abschnitt)
    var lines = [];
    peaks.forEach(function (pk) {
      var ys = [];
      for (var i = 0; i < n; i++) {
        var xx = (pts[2 * i] - (pts[2 * i + 1] - cy) * bestT) / step;
        if (Math.abs(xx - pk) <= 1.6) ys.push(pts[2 * i + 1]);
      }
      ys.sort(function (a, b2) { return a - b2; });
      var gap = Hh * 0.1, best = null, cur = null;
      ys.forEach(function (yy) {
        if (cur && yy - cur.b <= gap) { cur.b = yy; cur.n++; }
        else { cur = { a: yy, b: yy, n: 1 }; if (!best) best = cur; }
        if (cur.n > best.n) best = cur;
      });
      if (!best || best.b - best.a < Hh * 0.04) return;
      var xc = pk * step;
      lines.push({
        x: xc,
        top: [xc + (best.a - cy) * bestT, best.a],
        bot: [xc + (best.b - cy) * bestT, best.b],
        len: best.b - best.a
      });
    });
    if (lines.length < 2) return null;

    // Welche Tagesgrenzen haben eine blaue Linie? (vor Sa und vor Mo)
    var days = new Date(Date.UTC(jahr, monat, 0)).getUTCDate(), B = [];
    for (var dd = 2; dd <= days; dd++) {
      var wd = new Date(Date.UTC(jahr, monat - 1, dd)).getUTCDay();
      if (wd === 6 || wd === 1) B.push(dd - 1);
    }
    if (B.length < 2) return null;

    // Zuordnung Linie ↔ Grenze: jedes Paar als Annahme, die mit den meisten Treffern gewinnt
    function matchAll(predictB) {
      var match = [], err = 0, used = {};
      lines.forEach(function (l) {
        var bb = predictB(l.x), near = null;
        B.forEach(function (cand) { if (near === null || Math.abs(cand - bb) < Math.abs(near - bb)) near = cand; });
        if (Math.abs(near - bb) < 0.3 && !used[near]) { used[near] = 1; match.push({ l: l, b: near }); err += Math.abs(near - bb); }
      });
      return { m: match, err: err };
    }
    var best2 = null;
    for (var i1 = 0; i1 < lines.length; i1++) for (var i2 = i1 + 1; i2 < lines.length; i2++) {
      for (var p1 = 0; p1 < B.length; p1++) for (var p2 = p1 + 1; p2 < B.length; p2++) {
        var col = (lines[i2].x - lines[i1].x) / (B[p2] - B[p1]);
        if (col < W * 0.004 || col > W * 0.08) continue;
        var x1 = lines[i1].x, b1 = B[p1];
        var res = matchAll(function (x) { return b1 + (x - x1) / col; });
        if (!best2 || res.m.length > best2.m.length || (res.m.length === best2.m.length && res.err < best2.err)) best2 = res;
      }
    }
    if (!best2 || best2.m.length < 2) return null;

    // Perspektive: Abstände der Tage wachsen gleichmäßig zur Kamera hin.
    // Modell x(b) = (a·b + c) / (e·b + 1), als lineares Problem a·b + c − e·b·x = x.
    function solve3(rows) {
      // Kleinste Quadrate für [a, c, e]
      var M = [[0, 0, 0], [0, 0, 0], [0, 0, 0]], v = [0, 0, 0];
      rows.forEach(function (r) {
        for (var i = 0; i < 3; i++) { v[i] += r[0][i] * r[1]; for (var j = 0; j < 3; j++) M[i][j] += r[0][i] * r[0][j]; }
      });
      var det = function (m) { return m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]); };
      var D = det(M);
      if (Math.abs(D) < 1e-9) return null;
      return [0, 1, 2].map(function (k) {
        var Mk = M.map(function (row, i) { return row.map(function (x, j) { return j === k ? v[i] : x; }); });
        return det(Mk) / D;
      });
    }
    function fitPersp(pts) {           // pts: [{b, x}]
      if (pts.length < 3) return null;
      var sol = solve3(pts.map(function (q) { return [[q.b, 1, -q.b * q.x], q.x]; }));
      if (!sol || !isFinite(sol[2]) || Math.abs(sol[2]) * days > 0.8) return null;
      return { a: sol[0], c: sol[1], e: sol[2] };
    }
    var model = null;
    for (var it = 0; it < 3; it++) {
      var mdl = fitPersp(best2.m.map(function (mm) { return { b: mm.b, x: mm.l.x }; }));
      if (!mdl) break;
      model = mdl;
      var again = matchAll(function (x) { return (x - mdl.c) / (mdl.a - mdl.e * x); });
      if (again.m.length < best2.m.length) break;
      best2 = again;
    }
    var e = model ? model.e : 0;

    // Ober- und Unterkante: Grüne Urlaubsfelder lassen eine Linie im Foto
    // grünlich wirken und „abreißen“ – ihre Enden liegen dann zu weit
    // innen. Deshalb die äußere Hüllkurve suchen: eine Gerade, über die kaum
    // ein Ende hinausragt und an der möglichst viele Enden liegen.
    // (Mit Perspektive: y·(e·b + 1) ist linear in b.)
    var maxLen = 0;
    best2.m.forEach(function (mm) { maxLen = Math.max(maxLen, mm.l.len); });
    var tol = Math.max(2, maxLen * 0.025);
    function envelopeY(key, sign) {
      var P = best2.m.map(function (mm) { return { b: mm.b, y: mm.l[key][1], w: e * mm.b + 1 }; }), best = null;
      if (P.length === 1) return function () { return P[0].y; };
      function edgeThrough(a, c) {
        var k = (c.y * c.w - a.y * a.w) / (c.b - a.b), y0 = a.y * a.w - k * a.b;
        return function (b2) { return (y0 + k * b2) / (e * b2 + 1); };
      }
      for (var i = 0; i < P.length; i++) for (var j = i + 1; j < P.length; j++) {
        var f = edgeThrough(P[i], P[j]);
        var on = 0, out = 0, sum = 0;
        P.forEach(function (q) { var dy = (q.y - f(q.b)) * sign; if (Math.abs(dy) <= tol) on++; else if (dy < -tol) out++; sum += Math.abs(dy); });
        var val = on - 2 * out;
        if (!best || val > best.val || (val === best.val && sum < best.sum)) best = { f: f, val: val, sum: sum };
      }
      return best.f;
    }
    // x der Linien-Enden: mit fester Perspektive (e) linear fitten
    function fitX(key) {
      var sb = 0, sbb = 0, sx = 0, sbx = 0, m = best2.m.length;
      best2.m.forEach(function (mm) { var b2 = mm.b, xw = mm.l[key][0] * (e * b2 + 1); sb += b2; sbb += b2 * b2; sx += xw; sbx += b2 * xw; });
      var den = m * sbb - sb * sb, ax = (m * sbx - sb * sx) / den, cx = (sx - ax * sb) / m;
      return function (b2) { return (cx + ax * b2) / (e * b2 + 1); };
    }
    var TY = envelopeY('top', 1), BY = envelopeY('bot', -1), TX = fitX('top'), BX = fitX('bot');
    // Das Ende einer Linie liegt auf der (schrägen) Linie: x passend zur Höhe nachziehen
    function corner(FX, FY, key, b2) {
      var yFit = FY(b2), xs = FX(b2);
      // mittlere Höhe der Linien-Enden an dieser Stelle als Bezug für die Neigung
      var yRef = 0;
      best2.m.forEach(function (mm) { yRef += mm.l[key][1]; });
      yRef /= best2.m.length;
      return [xs + (yFit - yRef) * bestT, yFit];
    }
    var quad = [corner(TX, TY, 'top', 0), corner(TX, TY, 'top', days), corner(BX, BY, 'bot', days), corner(BX, BY, 'bot', 0)];
    return { quad: refineEdges(img, quad, days), linien: best2.m.length };
  }

  /*
   * Ober- und Unterkante nachschärfen: In jeder Tages-Spalte nahe der
   * geschätzten Kante die deutlichste waagrechte Linie suchen (Rand der
   * Tabelle bzw. Trennlinie über der ersten Person) und durch diese Punkte
   * robust eine Gerade legen.
   */
  function refineEdges(img, quad, days) {
    var H = gridMap(quad);
    if (!H) return quad;
    var cs = cellSize(quad, days, 1), W = img.width, Hh = img.height, d = img.data;
    var hpx = cs.h;                                   // Höhe des ganzen Gitters in Pixeln
    var rowGuess = hpx / 7;                           // grobe Zeilenhöhe – nur für das Suchfenster
    var win = Math.min(0.5 * rowGuess, 0.12 * hpx) / hpx;   // ± in v
    var steps = Math.max(12, Math.round(2 * win * hpx));      // ~1 Pixel je Schritt
    function dark(x, y) {
      var xi = Math.round(x), yi = Math.round(y);
      if (xi < 0 || yi < 0 || xi >= W || yi >= Hh) return -1;
      var o = (yi * W + xi) * 4, r = d[o], g = d[o + 1], b = d[o + 2];
      if (Math.max(r, g, b) - Math.min(r, g, b) > 40) return -1;     // Farbfeld
      return 255 - (0.3 * r + 0.55 * g + 0.15 * b);
    }
    function edgeAt(v0) {
      var pts = [];
      for (var c = 0; c < days; c++) {
        var prof = [], bad = false;
        for (var k = 0; k <= steps; k++) {
          var v = v0 - win + 2 * win * k / steps, sum = 0, n = 0;
          for (var t = 0; t < 7; t++) {
            var u = (c + 0.2 + 0.6 * t / 6) / days, p = project(H, u, v), dk = dark(p[0], p[1]);
            if (dk < 0) { bad = true; break; }
            sum += dk; n++;
          }
          if (bad) break;
          prof.push(sum / n);
        }
        if (bad) continue;
        var best = -1, bv = 0;
        for (var k2 = 2; k2 < prof.length - 2; k2++) {
          var resp = prof[k2] - (prof[k2 - 2] + prof[k2 + 2]) / 2;
          if (resp > bv) { bv = resp; best = k2; }
        }
        if (best > 0 && bv > 12) pts.push({ u: (c + 0.5) / days, v: v0 - win + 2 * win * best / steps });
      }
      if (pts.length < Math.max(4, days * 0.3)) return null;
      // Theil-Sen: Median aller Steigungen, dann Median-Achsenabschnitt
      var slopes = [];
      for (var i = 0; i < pts.length; i++) for (var j = i + 1; j < pts.length; j++) slopes.push((pts[j].v - pts[i].v) / (pts[j].u - pts[i].u));
      slopes.sort(function (a, b) { return a - b; });
      var m = slopes[Math.floor(slopes.length / 2)];
      var icp = pts.map(function (q) { return q.v - m * q.u; }).sort(function (a, b) { return a - b; });
      var c0 = icp[Math.floor(icp.length / 2)];
      // nur übernehmen, wenn die Punkte gut auf der Geraden liegen
      var good = pts.filter(function (q) { return Math.abs(q.v - (c0 + m * q.u)) < win * 0.25; }).length;
      if (good < pts.length * 0.6) return null;
      return function (u) { return c0 + m * u; };
    }
    var top = edgeAt(0), bot = edgeAt(1);
    function at(u, f, fallback) { var p = project(H, u, f ? f(u) : fallback); return [p[0], p[1]]; }
    return [at(0, top, 0), at(1, top, 0), at(1, bot, 1), at(0, bot, 1)];
  }

  /*
   * Wie viele Personen-Zeilen? Zwischen zwei Personen läuft eine dünne
   * waagrechte Linie über (fast) alle Tage, Text dagegen deckt eine
   * Pixelzeile nur stellenweise. Pro Höhe zählt daher ein niedriges
   * Perzentil der Dunkelheit – es ist nur auf den Trennlinien hoch.
   * Die passende Zeilenzahl hat Trennlinien an ihren Grenzen und Papier
   * in der Mitte jeder Zeile.
   */
  function guessRows(img, quad) {
    var H = gridMap(quad);
    if (!H) return null;
    var N = 480, w = 31 * 10;
    var c = warp(img, H, 0, 0, 1, 1, w, N), prof = new Float32Array(N);
    for (var y = 0; y < N; y++) {
      var vals = [];
      for (var x = 0; x < w; x++) {
        var o = (y * w + x) * 4, r = c.data[o], g = c.data[o + 1], b = c.data[o + 2];
        var mx = Math.max(r, g, b), mn = Math.min(r, g, b);
        if (mx - mn > 28) continue;                      // Farbfelder zählen nicht
        vals.push(255 - (0.3 * r + 0.55 * g + 0.15 * b));
      }
      vals.sort(function (a, b2) { return a - b2; });
      prof[y] = vals.length > w * 0.2 ? vals[Math.floor(vals.length * 0.25)] : 0;
    }
    function at(pos, rad) {
      var m = 0;
      for (var k = Math.max(0, Math.round(pos - rad)); k <= Math.min(N - 1, Math.round(pos + rad)); k++) m = Math.max(m, prof[k]);
      return m;
    }
    var best = null;
    for (var rows = 1; rows <= 20; rows++) {
      var per = N / rows, rad = Math.max(1, per * 0.06), sep = 0, mid = 0;
      for (var k2 = 1; k2 < rows; k2++) sep += at(k2 * per, rad);
      for (var k3 = 0; k3 < rows; k3++) mid += at((k3 + 0.5) * per, rad);
      var sc = (rows > 1 ? sep / (rows - 1) : 0) - mid / rows;
      if (!best || sc > best.sc) best = { rows: rows, sc: sc };
    }
    return best && best.rows > 1 && best.sc > 4 ? best.rows : null;
  }

  /* ---------- Texte aus der Texterkennung (Monat, Namen) ---------- */

  function invert(H) {
    var a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7], i = H[8];
    var A = e * i - f * h, B = -(d * i - f * g), C = d * h - e * g;
    var det = a * A + b * B + c * C;
    if (!det) return null;
    return [A / det, -(b * i - c * h) / det, (b * f - c * e) / det,
            B / det, (a * i - c * g) / det, -(a * f - c * d) / det,
            C / det, -(a * h - b * g) / det, (a * e - b * d) / det];
  }

  // "01.10.2026 - 31.10.2026" → { jahr: 2026, monat: 10 }
  function monthFromText(text) {
    var m = String(text || '').match(/(\d{1,2})[.,](\d{1,2})[.,](20\d\d)\s*[-–—]\s*(\d{1,2})[.,](\d{1,2})[.,](20\d\d)/);
    if (m && +m[2] >= 1 && +m[2] <= 12) return { jahr: +m[3], monat: +m[2] };
    m = String(text || '').match(/\b01[.,](\d{1,2})[.,](20\d\d)\b/);
    if (m && +m[1] >= 1 && +m[1] <= 12) return { jahr: +m[2], monat: +m[1] };
    return null;
  }

  /*
   * Namen den Zeilen zuordnen. words = [{ text, x0, y0, x1, y1 }] (Bildpixel).
   * Ein Name steht links vom Gitter, in der oberen Hälfte seiner Zeile,
   * z. B. „Cardeloni T., (29027/37,00)“ → „Cardeloni T.“
   */
  function namesFromWords(words, quad, rows) {
    var Hinv = invert(gridMap(quad)), perRow = [];
    for (var r = 0; r < rows; r++) perRow.push([]);
    if (!Hinv) return perRow.map(function () { return ''; });
    words.forEach(function (w) {
      var p = project(Hinv, (w.x0 + w.x1) / 2, (w.y0 + w.y1) / 2);
      if (p[0] >= -0.02 || p[0] < -1.5 || p[1] < 0 || p[1] >= 1) return;
      var r = Math.floor(p[1] * rows);
      perRow[r].push({ text: w.text, u: p[0], v: p[1] * rows - r });
    });
    return perRow.map(function (list) {
      list.sort(function (a, b) { return a.v < 0.5 && b.v >= 0.5 ? -1 : a.v >= 0.5 && b.v < 0.5 ? 1 : a.u - b.u; });
      var line = list.map(function (x) { return x.text; }).join(' ');
      var m = line.match(/([A-ZÄÖÜ][a-zäöüß]+(?:-[A-ZÄÖÜ][a-zäöüß]+)?)\s*,?\s+([A-ZÄÖÜ])\s*[.,]/);
      if (m) return m[1] + ' ' + m[2] + '.';
      m = line.match(/[A-ZÄÖÜ][a-zäöüß]{2,}/);
      return m && !/^(DV|Status|Soll|Tag|Familie|Name|Aktiv)$/i.test(m[0]) ? m[0] : '';
    });
  }

  /* ---------- Zeiten ---------- */

  // "7.30", "0730", "07:30" → "07:30"; sonst null
  function normTime(s) {
    var m = String(s || '').trim().match(/^(\d{1,2})\s*[:.,h]?\s*(\d{2})$/);
    if (!m) return null;
    var h = +m[1], mi = +m[2];
    if (h > 24 || mi > 59 || (h === 24 && mi)) return null;
    return two(h) + ':' + two(mi);
  }

  function minutes(t) { return +t.slice(0, 2) * 60 + +t.slice(3); }

  /* ---------- Kalender-Datei (.ics) ---------- */

  function icsEscape(s) {
    return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
  }

  // Zeilen über 75 Bytes umbrechen (RFC 5545)
  function fold(line) {
    var out = [], cur = '', bytes = 0;
    for (var i = 0; i < line.length; i++) {
      var ch = line[i], code = line.charCodeAt(i), len;
      if (code >= 0xd800 && code <= 0xdbff && i + 1 < line.length) { ch += line[++i]; len = 4; }
      else len = code < 0x80 ? 1 : code < 0x800 ? 2 : 3;
      if (bytes + len > (out.length ? 74 : 75)) { out.push(cur); cur = ''; bytes = 0; }
      cur += ch; bytes += len;
    }
    out.push(cur);
    return out.join('\r\n ');
  }

  function slug(s) {
    return String(s).toLowerCase()
      .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'person';
  }

  function ymd(y, m, d) { return '' + y + two(m) + two(d); }
  function addDays(y, m, d, n) {
    var t = new Date(Date.UTC(y, m - 1, d + n));
    return [t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate()];
  }
  function stamp(date) {
    return date.getUTCFullYear() + two(date.getUTCMonth() + 1) + two(date.getUTCDate()) + 'T' +
      two(date.getUTCHours()) + two(date.getUTCMinutes()) + two(date.getUTCSeconds()) + 'Z';
  }

  var VTIMEZONE = [
    'BEGIN:VTIMEZONE',
    'TZID:Europe/Vienna',
    'BEGIN:DAYLIGHT',
    'TZOFFSETFROM:+0100',
    'TZOFFSETTO:+0200',
    'TZNAME:CEST',
    'DTSTART:19700329T020000',
    'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU',
    'END:DAYLIGHT',
    'BEGIN:STANDARD',
    'TZOFFSETFROM:+0200',
    'TZOFFSETTO:+0100',
    'TZNAME:CET',
    'DTSTART:19701025T030000',
    'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU',
    'END:STANDARD',
    'END:VTIMEZONE'
  ];

  /*
   * opts = {
   *   jahr, monat,                       z. B. 2026, 10
   *   personen: [{ name, tage: { 1: eintrag, … } }],
   *   titel: 'Dienst',                   Titel der Dienst-Termine
   *   nameImTitel: true|false,
   *   ganztags: { U: 'Urlaub', SP: 'SP', … }   welche Codes als Ganztags-Termin (Titel)
   *   erinnerung: Minuten vorher oder 0,
   *   kalenderName: 'Dienstplan Oktober 2026',
   *   jetzt: Date (für Tests)
   * }
   * eintrag = { art: 'dienst', von: '07:00', bis: '17:30' } | { art: 'code', text: 'U' } | leer
   */
  function buildIcs(opts) {
    var now = opts.jetzt || new Date();
    var dtstamp = stamp(now);
    // jede neue Datei hat eine höhere Nummer → Kalender übernehmen Änderungen
    var seq = Math.max(0, Math.floor((now.getTime() - Date.UTC(2026, 0, 1)) / 60000));
    var y = opts.jahr, mo = opts.monat;
    var lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Nessie-Hub//Dienstplan zu Kalender//DE',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:' + icsEscape(opts.kalenderName || 'Dienstplan'),
      'X-WR-TIMEZONE:Europe/Vienna'
    ].concat(VTIMEZONE);
    var count = 0;

    function alarm(text) {
      if (!opts.erinnerung) return [];
      return ['BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + icsEscape(text), 'TRIGGER:-PT' + opts.erinnerung + 'M', 'END:VALARM'];
    }

    opts.personen.forEach(function (p) {
      var who = slug(p.name);
      var prefix = opts.nameImTitel ? p.name + ': ' : '';
      var last = new Date(Date.UTC(y, mo, 0)).getUTCDate();
      for (var d = 1; d <= last; d++) {
        var e = p.tage[d];
        if (!e || e.art === 'frei') continue;
        if (e.art === 'dienst') {
          var von = normTime(e.von), bis = normTime(e.bis);
          if (!von || !bis) continue;
          var endDay = minutes(bis) <= minutes(von) ? addDays(y, mo, d, 1) : [y, mo, d];
          var titel = prefix + (opts.titel || 'Dienst') + ' ' + von + '–' + bis;
          lines.push('BEGIN:VEVENT',
            'UID:' + ymd(y, mo, d) + '-' + who + '-dienst@nessie-hub',
            'DTSTAMP:' + dtstamp,
            'SEQUENCE:' + seq,
            'DTSTART;TZID=Europe/Vienna:' + ymd(y, mo, d) + 'T' + von.replace(':', '') + '00',
            'DTEND;TZID=Europe/Vienna:' + ymd(endDay[0], endDay[1], endDay[2]) + 'T' + (bis === '24:00' ? '2359' : bis.replace(':', '')) + '00',
            'SUMMARY:' + icsEscape(titel),
            'DESCRIPTION:' + icsEscape(p.name + ' · Sollplan'),
            'TRANSP:OPAQUE');
          lines = lines.concat(alarm(titel));
          lines.push('END:VEVENT');
          count++;
        } else if (e.art === 'code') {
          var code = String(e.text || '').trim();
          if (!code || !opts.ganztags || !(code in opts.ganztags)) continue;
          // gleiche Codes an Folgetagen zu einem Termin zusammenfassen
          var end = d;
          while (end + 1 <= last && p.tage[end + 1] && p.tage[end + 1].art === 'code' && String(p.tage[end + 1].text).trim() === code) end++;
          var to = addDays(y, mo, end, 1);
          var t2 = prefix + (opts.ganztags[code] || code);
          lines.push('BEGIN:VEVENT',
            'UID:' + ymd(y, mo, d) + '-' + who + '-' + slug(code) + '@nessie-hub',
            'DTSTAMP:' + dtstamp,
            'SEQUENCE:' + seq,
            'DTSTART;VALUE=DATE:' + ymd(y, mo, d),
            'DTEND;VALUE=DATE:' + ymd(to[0], to[1], to[2]),
            'SUMMARY:' + icsEscape(t2),
            'DESCRIPTION:' + icsEscape(p.name + ' · Sollplan'),
            'TRANSP:TRANSPARENT',
            'END:VEVENT');
          count++;
          d = end;
        }
      }
    });
    lines.push('END:VCALENDAR');
    return { text: lines.map(fold).join('\r\n') + '\r\n', termine: count };
  }

  var api = {
    homography: homography,
    project: project,
    gridMap: gridMap,
    warp: warp,
    cellSize: cellSize,
    fieldColor: fieldColor,
    inkMap: inkMap,
    analyseCell: analyseCell,
    readGrid: readGrid,
    cluster: cluster,
    composite: composite,
    templates: templates,
    matchLine: matchLine,
    interpret: interpret,
    autoGrid: autoGrid,
    refineEdges: refineEdges,
    guessRows: guessRows,
    invert: invert,
    monthFromText: monthFromText,
    namesFromWords: namesFromWords,
    normTime: normTime,
    buildIcs: buildIcs,
    slug: slug,
    TIMES: TIMES,
    MATCH_W: MATCH_W,
    MATCH_H: MATCH_H
  };
  root.SollplanLeser = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
