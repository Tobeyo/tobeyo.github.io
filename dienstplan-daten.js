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
      // Monats-Soll aus dem Dienstplan ("fiktiv 5-Tage-Woche")
      soll: { '2026-08': 155.5, '2026-09': 163 },
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
        // 31.08. laut Plan dienstfrei

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
        '2026-09-30': { von: '09:00', bis: '18:00', pause: 0.5, tags: ['Klub'] }
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
        '2026-09-04': { von: '08:30', bis: '15:00', pause: 0.5, tags: ['N1'] }    // 6:00
        // Sa 05.09. + So 06.09. frei
      }
    }
  ]
};
