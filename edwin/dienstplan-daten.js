/* =========================================================
   DIENSTPLAN EDWIN – eigene Datenbasis
   ---------------------------------------------------------
   Wird nur von den Seiten unter /edwin geladen:
     edwin/index.html         (Kalender)
     edwin/ueberstunden.html  (Überstunden-Konto)
   Der Hub und Tobias' Kalender kennen Edwin nicht – deshalb
   steht er bewusst NICHT in "dienstplan-daten.js".

   Quelle ist derselbe Aushang wie bei Tobias (Haus BRI/ZDL,
   Zivildiener) – Edwin ist dort die oberste Zeile („NN“).

   Aufbau wie in "dienstplan-daten.js":
      { von:'07:30', bis:'16:00', pause:0.5, tags:['Klub'] }
   oder ein angerechneter Tag ohne Dienstzeit:
      { art:'feiertag', h:7.5 }
   Fehlt ein Tag ganz, ist er dienstfrei.

   "plan"        = die GEDRUCKTEN Zeiten des Aushangs. Das ist das
                   Soll für das Überstunden-Konto.
   "aenderungen" = was am Aushang mit der Hand ausgebessert wurde
                   (durchgestrichene Zeit, neue Zeit darunter). Die
                   Seiten zeigen dann die neue Zeit als „geändert“,
                   und die Abweichung zum gedruckten Plan landet als
                   Plus oder Minus im Überstunden-Konto. Was Edwin
                   selbst im Kalender ändert, geht noch darüber.

   Essen und Kollegen kommen aus denselben Dateien wie bei
   Tobias – gleiches Haus, gleiche Menüs, gleiches Team:
     essen    → Schlüssel in essensplan-daten.js (plaene.tobias)
     kollegen → Schlüssel in kollegen-daten.js   (teams.tobias)
   ========================================================= */

window.NESSIE_DIENSTPLAN = {
  people: [
    {
      id: 'edwin',
      label: 'Edwin',
      lastName: '',
      fullName: 'Edwin',
      meta: 'Zivildiener · BRI/ZDL · 37,00 Std. NAZ',
      tags: ['Klub', 'Seminar'],
      defaults: { von: '07:30', bis: '16:00', pause: 0.5 },
      // Normalarbeitszeit laut Aushang – Basis für die Überstunden
      wochenSoll: 37,
      // Eigene Auswertung (relativ zu /edwin)
      kontoSeite: 'ueberstunden.html',
      // Mittagsmenüs und Kollegen wie bei Tobias
      essen: 'tobias',
      kollegen: 'tobias',
      // Monats-Soll aus dem Dienstplan ("fiktiv 5-Tage-Woche")
      soll: { '2026-11': 155.5 },

      plan: {
        // ---- November 2026 (Monats-Soll 155,50, Übertrag 0) ----
        // So 01.11. Allerheiligen – fällt auf einen Sonntag, nichts angerechnet
        '2026-11-02': { von: '07:30', bis: '16:00', pause: 0.5, tags: [] },          // 8,0
        '2026-11-03': { von: '08:30', bis: '17:00', pause: 0.5, tags: ['Klub'] },    // 8,0
        '2026-11-04': { von: '07:30', bis: '16:00', pause: 0.5, tags: [] },          // 8,0
        '2026-11-05': { von: '07:30', bis: '15:00', pause: 0.5, tags: [] },          // 7,0
        '2026-11-06': { von: '07:30', bis: '14:00', pause: 0.5, tags: [] },          // 6,0

        '2026-11-09': { von: '07:30', bis: '15:00', pause: 0.5, tags: [] },          // 7,0
        '2026-11-10': { von: '07:30', bis: '15:30', pause: 0.5, tags: [] },          // 7,5
        '2026-11-11': { von: '07:30', bis: '16:00', pause: 0.5, tags: [] },          // 8,0
        // Do 12. + Fr 13.11. Seminar Erste-Hilfe-Kurs (handschriftlich),
        // Zeiten wie gedruckt – am 13. damit kein Klub
        '2026-11-12': { von: '07:30', bis: '15:00', pause: 0.5, tags: ['Seminar'] }, // 7,0
        '2026-11-13': { von: '09:00', bis: '17:00', pause: 0.5, tags: ['Seminar'] }, // 7,5

        '2026-11-16': { von: '07:30', bis: '15:30', pause: 0.5, tags: [] },          // 7,5
        '2026-11-17': { von: '07:30', bis: '15:00', pause: 0.5, tags: [] },          // 7,0
        '2026-11-18': { von: '08:30', bis: '18:00', pause: 0.5, tags: ['Klub'] },    // 9,0
        '2026-11-19': { von: '07:30', bis: '15:30', pause: 0.5, tags: [] },          // 7,5
        '2026-11-20': { von: '07:30', bis: '14:00', pause: 0.5, tags: [] },          // 6,0

        '2026-11-23': { von: '07:30', bis: '15:00', pause: 0.5, tags: [] },          // 7,0
        '2026-11-24': { von: '07:30', bis: '15:30', pause: 0.5, tags: [] },          // 7,5
        '2026-11-25': { von: '07:30', bis: '16:00', pause: 0.5, tags: [] },          // 8,0
        '2026-11-26': { von: '07:30', bis: '15:00', pause: 0.5, tags: [] },          // 7,0
        '2026-11-27': { von: '09:00', bis: '17:00', pause: 0.5, tags: ['Klub'] },    // 7,5

        '2026-11-30': { von: '07:30', bis: '15:30', pause: 0.5, tags: [] }           // 7,5
      },

      aenderungen: {
        // ---- November 2026: handschriftlich am Aushang, zusammen +4,5 ----
        '2026-11-11': { von: '07:30', bis: '16:30', pause: 0.5, tags: [] },          // Ende 16:00 → 16:30  (+0,5)
        '2026-11-16': { von: '08:30', bis: '15:30', pause: 0.5, tags: [] },          // Beginn 7:30 → 8:30  (−1,0)
        '2026-11-17': { von: '07:30', bis: '16:00', pause: 0.5, tags: [] },          // Ende 15:00 → 16:00  (+1,0)
        '2026-11-18': { von: '07:30', bis: '18:00', pause: 0.5, tags: ['Klub'] },    // Beginn 8:30 → 7:30  (+1,0)
        '2026-11-20': { von: '07:30', bis: '17:00', pause: 0.5, tags: [] }           // Ende 14:00 → 17:00  (+3,0)
      }
    }
  ]
};
