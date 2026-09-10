/* =========================================================
   DIENSTPLÄNE – gemeinsame Datenbasis
   ---------------------------------------------------------
   Diese Datei wird von "arbeitszeiten.html" (Kalender) und
   von "ueberstunden.html" (Überstunden-Konto) geladen. Neue
   Monate also nur hier eintragen – beide Seiten rechnen dann
   automatisch mit demselben Stand.

   Ein Eintrag ist entweder ein Dienst …
      { von:'07:00', bis:'15:00', pause:1, tags:['HW'] }
   … oder ein angerechneter Tag ohne Dienstzeit:
      { art:'feiertag', h:4.7833 }
   Fehlt ein Tag ganz, ist er dienstfrei.

   "pause" = unbezahlte Pause in Stunden. Bei geteilten Diensten
   (z. B. HW 07:00-12:00 / Pause / HW 13:00-15:00) wird die erste
   Zeit als "von", die letzte als "bis" und die Lücke als Pause
   eingetragen – das ergibt exakt die Tagesstunden des Aushangs.

   "wochenSoll" = vereinbarte Normalarbeitszeit pro Woche. Daraus
   errechnet der Überstunden-Rechner das Tages-Soll (Soll ÷ 5).
   ========================================================= */

window.NESSIE_DIENSTPLAN = {
  people: [
    {
      id: 'tobias',
      label: 'Tobias',
      lastName: 'Nesvadba',
      fullName: 'Tobias Nesvadba',
      meta: 'Pers.-Nr. 2137 · 37,00 Std. NAZ',
      tags: ['Klub', 'Seminar'],
      defaults: { von: '07:30', bis: '16:00', pause: 0.5 },
      // Normalarbeitszeit laut Dienstvertrag – Basis für die Überstunden
      wochenSoll: 37,
      // Eigene Auswertung – der Kalender verlinkt sein Konto-Feld dorthin
      kontoSeite: 'ueberstunden.html',
      // Monats-Soll aus dem Dienstplan ("fiktiv 5-Tage-Woche")
      soll: { '2026-08': 155.5, '2026-09': 163, '2026-10': 162.5 },
      plan: {
        // ---- August 2026 ----
        '2026-08-03': { von: '08:30', bis: '16:30', pause: 0.5, tags: ['Seminar'] },
        '2026-08-04': { von: '07:30', bis: '13:00', pause: 0,   tags: [] },
        '2026-08-05': { von: '07:30', bis: '16:00', pause: 0.5, tags: [] },
        '2026-08-06': { von: '08:00', bis: '16:30', pause: 0.5, tags: ['Seminar'] },
        '2026-08-07': { von: '08:00', bis: '16:30', pause: 0.5, tags: ['Seminar'] },

        '2026-08-10': { von: '07:30', bis: '13:00', pause: 0,   tags: [] },
        '2026-08-11': { von: '08:30', bis: '17:00', pause: 0.5, tags: ['Klub'] },
        '2026-08-12': { von: '07:30', bis: '18:00', pause: 0.5, tags: ['Klub'] },
        '2026-08-13': { von: '07:30', bis: '13:00', pause: 0,   tags: [] },
        '2026-08-14': { von: '09:00', bis: '17:00', pause: 0,   tags: ['Klub'] },

        '2026-08-17': { von: '07:30', bis: '15:00', pause: 0.5, tags: [] },
        '2026-08-18': { von: '07:30', bis: '15:00', pause: 0.5, tags: [] },
        '2026-08-19': { von: '07:30', bis: '18:00', pause: 0.5, tags: ['Klub'] },
        '2026-08-20': { von: '07:30', bis: '14:30', pause: 0.5, tags: [] },
        '2026-08-21': { von: '07:30', bis: '14:00', pause: 0,   tags: [] },

        '2026-08-24': { von: '07:30', bis: '13:00', pause: 0,   tags: [] },
        '2026-08-25': { von: '08:30', bis: '17:00', pause: 0.5, tags: ['Klub'] },
        '2026-08-26': { von: '07:30', bis: '18:00', pause: 0.5, tags: ['Klub'] },
        '2026-08-27': { von: '07:30', bis: '13:00', pause: 0,   tags: [] },
        '2026-08-28': { von: '09:00', bis: '17:00', pause: 0,   tags: ['Klub'] },
        '2026-08-31': { von: '07:30', bis: '16:00', pause: 0.5, tags: [] },

        // ---- September 2026 ----
        '2026-09-01': { von: '07:30', bis: '16:00', pause: 0.5, tags: [] },
        '2026-09-02': { von: '07:30', bis: '16:00', pause: 0.5, tags: [] },
        '2026-09-03': { von: '07:30', bis: '14:00', pause: 0.5, tags: [] },
        '2026-09-04': { von: '07:30', bis: '14:30', pause: 0,   tags: [] },

        '2026-09-07': { von: '07:30', bis: '13:00', pause: 0,   tags: [] },
        '2026-09-08': { von: '08:30', bis: '17:00', pause: 0.5, tags: [] },
        '2026-09-09': { von: '07:30', bis: '18:00', pause: 0.5, tags: ['Klub'] },
        '2026-09-10': { von: '07:30', bis: '13:00', pause: 0,   tags: [] },
        '2026-09-11': { von: '09:00', bis: '17:00', pause: 0,   tags: [] },

        '2026-09-14': { von: '07:30', bis: '15:00', pause: 0.5, tags: [] },
        '2026-09-15': { von: '07:30', bis: '15:00', pause: 0.5, tags: [] },
        '2026-09-16': { von: '07:30', bis: '16:00', pause: 0.5, tags: [] },
        '2026-09-17': { von: '07:30', bis: '16:00', pause: 0.5, tags: [] },
        '2026-09-18': { von: '07:30', bis: '14:30', pause: 0,   tags: [] },

        '2026-09-21': { von: '07:30', bis: '15:00', pause: 0.5, tags: [] },
        '2026-09-22': { von: '07:30', bis: '14:00', pause: 0.5, tags: [] },
        '2026-09-23': { von: '07:30', bis: '15:00', pause: 0.5, tags: [] },
        '2026-09-24': { von: '08:30', bis: '18:00', pause: 0.5, tags: ['Klub'] },
        '2026-09-25': { von: '09:00', bis: '17:00', pause: 0,   tags: ['Klub'] },

        '2026-09-28': { von: '07:30', bis: '13:00', pause: 0,   tags: [] },
        '2026-09-29': { von: '07:30', bis: '17:00', pause: 0.5, tags: [] },
        '2026-09-30': { von: '09:00', bis: '18:00', pause: 0.5, tags: ['Klub'] },

        // ---- Oktober 2026 (Monats-Soll 162,50) ----
        '2026-10-01': { von: '07:30', bis: '17:00', pause: 0.5, tags: ['Klub'] },  // 9,0
        '2026-10-02': { von: '07:30', bis: '14:00', pause: 0.5, tags: [] },        // 6,0

        '2026-10-05': { von: '07:30', bis: '16:00', pause: 0.5, tags: [] },        // 8,0
        '2026-10-06': { von: '07:30', bis: '15:00', pause: 0.5, tags: [] },        // 7,0
        '2026-10-07': { von: '07:30', bis: '16:00', pause: 0.5, tags: [] },        // 8,0
        '2026-10-08': { von: '07:30', bis: '16:00', pause: 0.5, tags: [] },        // 8,0
        '2026-10-09': { von: '07:30', bis: '14:00', pause: 0.5, tags: [] },        // 6,0

        '2026-10-12': { von: '07:30', bis: '15:00', pause: 0.5, tags: [] },        // 7,0
        '2026-10-13': { von: '07:30', bis: '15:00', pause: 0.5, tags: [] },        // 7,0
        '2026-10-14': { von: '07:30', bis: '15:00', pause: 0.5, tags: [] },        // 7,0
        '2026-10-15': { von: '07:30', bis: '15:00', pause: 0.5, tags: [] },        // 7,0
        '2026-10-16': { von: '09:00', bis: '17:00', pause: 0.5, tags: ['Klub'] },  // 7,5

        '2026-10-19': { von: '07:30', bis: '15:30', pause: 0.5, tags: [] },        // 7,5
        '2026-10-20': { von: '07:30', bis: '15:00', pause: 0.5, tags: [] },        // 7,0
        '2026-10-21': { von: '08:30', bis: '18:00', pause: 0.5, tags: ['Klub'] },  // 9,0
        '2026-10-22': { von: '07:30', bis: '15:00', pause: 0.5, tags: [] },        // 7,0
        '2026-10-23': { von: '07:30', bis: '14:00', pause: 0.5, tags: ['Klub'] },  // 6,0

        // Mo 26.10. Nationalfeiertag, im Plan mit 7,5 angerechnet
        '2026-10-26': { art: 'feiertag', h: 7.5 },
        '2026-10-27': { von: '07:30', bis: '16:00', pause: 0.5, tags: [] },        // 8,0
        '2026-10-28': { von: '08:30', bis: '18:00', pause: 0.5, tags: [] },        // 9,0
        '2026-10-29': { von: '07:30', bis: '16:00', pause: 0.5, tags: [] },        // 8,0
        '2026-10-30': { von: '07:30', bis: '14:00', pause: 0.5, tags: [] }         // 6,0
        // Sa 31.10. laut Plan dienstfrei
      }
    },

    {
      id: 'daniel',
      label: 'Daniel',
      lastName: 'Nesvadba',
      fullName: 'Daniel Nesvadba',
      meta: 'Pers.-Nr. 00295460 · Abteilung Spielware · IM75 Non Food',
      tags: ['HW', 'N1', 'N2', 'TX'],
      defaults: { von: '08:30', bis: '15:00', pause: 0.5 },
      // Der Aushang weist für Daniel nur die Planzeit je Woche aus,
      // kein Monats-Soll – deshalb bleibt "soll" leer und die vierte
      // Kachel zeigt stattdessen den Schnitt voller Wochen.
      soll: {},
      plan: {
        /* ---- KW 33 · 10.08. – 16.08.2026 (Planzeit 35:47) ---- */
        // Mo 10.08. frei
        '2026-08-11': { von: '07:00', bis: '15:00', pause: 1,   tags: ['HW'] },   // 7:00
        '2026-08-12': { von: '07:00', bis: '15:00', pause: 1,   tags: ['HW'] },   // 7:00
        '2026-08-13': { von: '11:00', bis: '20:00', pause: 1,   tags: ['HW'] },   // 8:00
        '2026-08-14': { von: '08:30', bis: '18:30', pause: 1,   tags: ['HW'] },   // 9:00
        '2026-08-15': { art: 'feiertag', h: 4 + 47 / 60 },                        // 4:47
        // So 16.08. frei

        /* ---- KW 34 · 17.08. – 23.08.2026 (Planzeit 36:00) ---- */
        '2026-08-17': { von: '08:30', bis: '15:00', pause: 0.5, tags: ['N1'] },   // 6:00
        '2026-08-18': { von: '08:30', bis: '15:00', pause: 0.5, tags: ['N1'] },   // 6:00
        '2026-08-19': { von: '08:30', bis: '15:00', pause: 0.5, tags: ['N1'] },   // 6:00
        '2026-08-20': { von: '10:00', bis: '20:00', pause: 1,   tags: ['HW'] },   // 9:00
        '2026-08-21': { von: '08:30', bis: '18:30', pause: 1,   tags: ['HW'] },   // 9:00
        // Sa 22.08. + So 23.08. frei

        /* ---- KW 35 · 24.08. – 30.08.2026 (Planzeit 35:00) ---- */
        '2026-08-24': { von: '07:00', bis: '14:00', pause: 0.5, tags: ['HW'] },   // 6:30
        '2026-08-25': { von: '07:00', bis: '15:00', pause: 0.5, tags: ['HW'] },   // 7:30
        // Mi 26.08. frei
        '2026-08-27': { von: '11:00', bis: '20:00', pause: 1,   tags: ['HW'] },   // 8:00
        '2026-08-28': { von: '08:30', bis: '15:00', pause: 0.5, tags: ['HW'] },   // 6:00
        '2026-08-29': { von: '09:00', bis: '17:00', pause: 1,   tags: ['HW'] },   // 7:00
        // So 30.08. frei

        /* ---- KW 36 · 31.08. – 06.09.2026 (Planzeit 35:00) ---- */
        '2026-08-31': { von: '07:00', bis: '15:00', pause: 1,   tags: ['HW'] },   // 7:00
        '2026-09-01': { von: '07:00', bis: '15:00', pause: 1,   tags: ['HW'] },   // 7:00
        '2026-09-02': { von: '08:30', bis: '18:30', pause: 1,   tags: ['HW'] },   // 9:00
        '2026-09-03': { von: '08:30', bis: '15:00', pause: 0.5, tags: ['N1'] },   // 6:00
        '2026-09-04': { von: '08:30', bis: '15:00', pause: 0.5, tags: ['N1'] },   // 6:00
        // Sa 05.09. + So 06.09. frei

        /* ---- KW 37 · 07.09. – 13.09.2026 (Planzeit 35:00) ---- */
        '2026-09-07': { von: '11:00', bis: '17:30', pause: 0.5, tags: ['HW'] },   // 6:00
        '2026-09-08': { von: '08:30', bis: '15:00', pause: 0.5, tags: ['HW'] },   // 6:00
        // Mi 09.09. frei
        '2026-09-10': { von: '08:30', bis: '17:00', pause: 1,   tags: ['HW'] },   // 7:30
        '2026-09-11': { von: '06:00', bis: '14:00', pause: 0.5, tags: ['HW'] },   // 7:30
        '2026-09-12': { von: '07:00', bis: '16:00', pause: 1,   tags: ['HW'] },   // 8:00
        // So 13.09. frei

        /* ---- KW 38 · 14.09. – 20.09.2026 (Planzeit 35:00) ---- */
        '2026-09-14': { von: '08:30', bis: '15:00', pause: 0.5, tags: ['TX'] },   // 6:00
        '2026-09-15': { von: '08:30', bis: '18:30', pause: 1,   tags: ['HW'] },   // 9:00
        '2026-09-16': { von: '06:00', bis: '15:00', pause: 1,   tags: ['HW'] },   // 8:00
        '2026-09-17': { von: '12:00', bis: '18:30', pause: 0.5, tags: ['HW'] },   // 6:00 (Änderung)
        '2026-09-18': { von: '08:30', bis: '15:00', pause: 0.5, tags: ['HW'] },   // 6:00
        // Sa 19.09. + So 20.09. frei

        /* ---- KW 39 · 21.09. – 27.09.2026 (Planzeit 35:00) ---- */
        '2026-09-21': { von: '10:00', bis: '16:30', pause: 0.5, tags: ['HW'] },   // 6:00
        '2026-09-22': { von: '10:00', bis: '16:30', pause: 0.5, tags: ['HW'] },   // 6:00
        '2026-09-23': { von: '08:30', bis: '18:30', pause: 1,   tags: ['HW'] },   // 9:00
        // Do 24.09. frei
        '2026-09-25': { von: '12:00', bis: '20:00', pause: 1,   tags: ['HW'] },   // 7:00
        '2026-09-26': { von: '09:00', bis: '17:00', pause: 1,   tags: ['HW'] },   // 7:00
        // So 27.09. frei

        /* ---- KW 40 · 28.09. – 04.10.2026 (Planzeit 35:00) ---- */
        '2026-09-28': { von: '12:00', bis: '18:30', pause: 0.5, tags: ['HW'] },   // 6:00
        '2026-09-29': { von: '07:00', bis: '15:00', pause: 1,   tags: ['HW'] },   // 7:00
        '2026-09-30': { von: '07:00', bis: '15:00', pause: 1,   tags: ['HW'] },   // 7:00
        '2026-10-01': { von: '12:00', bis: '20:00', pause: 1,   tags: ['HW'] },   // 7:00
        '2026-10-02': { von: '08:00', bis: '17:00', pause: 1,   tags: ['HW'] },   // 8:00
        // Sa 03.10. + So 04.10. frei

        /* ---- KW 41 · 05.10. – 11.10.2026 (Planzeit 34:50) ---- */
        // Mo 05.10. frei
        '2026-10-06': { art: 'zeitausgleich', h: 5 + 50 / 60 },                   // 5:50
        '2026-10-07': { von: '12:00', bis: '20:00', pause: 1,   tags: ['HW'] },   // 7:00
        '2026-10-08': { von: '08:30', bis: '17:00', pause: 1,   tags: ['HW'] },   // 7:30
        '2026-10-09': { von: '08:30', bis: '17:00', pause: 1,   tags: ['HW'] },   // 7:30
        '2026-10-10': { von: '10:00', bis: '18:00', pause: 1,   tags: ['HW'] },   // 7:00
        // So 11.10. frei

        /* ---- KW 42 · 12.10. – 18.10.2026 (Planzeit 35:00) ---- */
        // Mo 12.10. – Sa 17.10. Urlaub, je 5:50 angerechnet
        '2026-10-12': { art: 'urlaub', h: 5 + 50 / 60 },                          // 5:50
        '2026-10-13': { art: 'urlaub', h: 5 + 50 / 60 },                          // 5:50
        '2026-10-14': { art: 'urlaub', h: 5 + 50 / 60 },                          // 5:50
        '2026-10-15': { art: 'urlaub', h: 5 + 50 / 60 },                          // 5:50
        '2026-10-16': { art: 'urlaub', h: 5 + 50 / 60 },                          // 5:50
        '2026-10-17': { art: 'urlaub', h: 5 + 50 / 60 }                           // 5:50
        // So 18.10. frei
      }
    }
  ]
};
