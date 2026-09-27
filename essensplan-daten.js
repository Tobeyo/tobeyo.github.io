/* =========================================================
   ESSENSPLAN – Mittagessen im Haus (Häuser zum Leben)
   ---------------------------------------------------------
   Wird von "arbeitszeiten.html" geladen und erscheint dort
   nur bei Personen, die hier unter "plaene" stehen – also
   nur bei Tobias, nicht bei Daniel.

   Der Aushang kommt in zwei Formen:
     • „Menüplan“        – nur Mittagessen
     • „Wochenmenüplan“  – Mittagessen (ME) und Abendessen (AE)
   In beiden Fällen kommen nur die drei oberen Mittagessen in
   die App: Hausmannskost, Leichte Vollkost und Diabetiker
   geeignet. Abendessen und Weiche Kost bleiben draußen.

   Ein Menü ist eine Liste in der Reihenfolge des Aushangs:
   zuerst die Suppe, dann Hauptgang samt Beilagen, zuletzt die
   Nachspeise. Was am Aushang nur umbrochen ist (z. B.
   „Klare Gemüse-“ / „Kartoffelsuppe“), wird ein Eintrag.
   ========================================================= */

window.NESSIE_ESSENSPLAN = {
  menues: [
    { id: 'hausmann',   label: 'Hausmannskost',       kurz: 'Hausmannskost' },
    { id: 'leicht',     label: 'Leichte Vollkost',    kurz: 'Leichte Vollkost' },
    { id: 'diabetiker', label: 'Diabetiker geeignet', kurz: 'Diabetiker' }
  ],

  plaene: {
    tobias: {
      /* ---- Wochenmenüplan 07.09. – 13.09.2026 (mit Abendessen, nur ME übernommen) ---- */
      '2026-09-07': {
        hausmann:   ['Klare Gemüsesuppe mit Vollkornnockerln', 'Eingebrannte Kartoffeln', 'Keimkraftsemmel', 'Grießflammerie'],
        leicht:     ['Schwarzwurzelsuppe', 'Kümmelfleisch vom Schwein mit Gemüse', 'Reis', 'Grießflammerie'],
        diabetiker: ['Klare Gemüsesuppe mit Vollkornnockerln', 'Gebratene Fischstreifen', 'Paprika-Tomatenragout', 'Couscous natur', 'Pfirsichkompott']
      },
      '2026-09-08': {
        hausmann:   ['Kürbiscremesuppe', 'Topfenstrudel', 'Eierlikörsauce', 'Apfelmus'],
        leicht:     ['Klare Gemüsesuppe mit Backerbsen', 'Knödel mit Ei', 'Endiviensalat', 'Apfelmus'],
        diabetiker: ['Kürbiscremesuppe', 'Hühnercurry mit Gemüse', 'Basmatireis', 'Joghurt mit Birnenstücken']
      },
      '2026-09-09': {
        hausmann:   ['Rindsuppe mit Frittaten', 'Leberkäse gebraten', 'Erdäpfelpüree', 'Rahmgurkensalat', 'Schokopudding'],
        leicht:     ['Cremesuppe mit Wurzelgemüse', 'Gebratenes Tilapiafischfilet', 'Broccoli', 'Salzerdäpfel', 'Schokopudding'],
        diabetiker: ['Rindsuppe mit Frittaten', 'Linsengemüse vegetarisch', 'Serviettenknödel', 'Erdbeerkompott']
      },
      '2026-09-10': {
        hausmann:   ['Champignoncremesuppe', 'Käsespätzle mit Röstzwiebel', 'Chinakohlsalat', 'Joghurt-Pannacotta mit Heidelbeersauce'],
        leicht:     ['Klare Gemüsesuppe mit Sternchen', 'Faschierter Braten', 'Petersilerdäpfel', 'Rote Rübensalat', 'Joghurt-Pannacotta mit Heidelbeersauce'],
        diabetiker: ['Champignoncremesuppe', 'Apfelauflauf mit Haferflocken', 'Vanillesauce', 'Fruchtkompott']
      },
      '2026-09-11': {
        hausmann:   ['Karottencremesuppe', 'Fischstäbchen', 'Gemüsemayonnaise-Salat', 'Zitrone', 'Melonencocktail'],
        leicht:     ['Karottencremesuppe', 'Grießschmarren', 'Milch', 'Melonencocktail'],
        diabetiker: ['Rindsuppe mit Teigmuscheln', 'Lammragout mit Kichererbsen', 'Pilavreis', 'Zitronen-Topfencreme']
      },
      '2026-09-12': {
        hausmann:   ['Rindsuppe mit Leberknödel', 'Bratwürstel vom Schwein', 'Sauerkraut', 'Braterdäpfel', 'Zwiebelsenf', 'Erdbeercreme'],
        leicht:     ['Zucchinicremesuppe', 'Putenragout mit Gemüse', 'Makkaroni', 'Erdbeercreme'],
        diabetiker: ['Rindsuppe mit Leberknödel', 'Kartoffel-Lauchstrudel', 'Joghurt-Kräuterdip', 'Gemischter Blattsalat', 'Apfelkompott']
      },
      '2026-09-13': {
        hausmann:   ['Klare Gemüsesuppe mit Grießstrudel', 'Gebratene Hühnerflügerl', 'Broccoli', 'Reis', 'Beerenmousseschnitte'],
        leicht:     ['Klare Gemüsesuppe mit Grießstrudel', 'Gemüseplatte mit Champignons', 'Erdäpfel mit Kräuterdip', 'Zitronencremeschnitte'],
        diabetiker: ['Hühnercremesuppe', 'Schweinsgulasch', 'Bunte Spiralen', 'Chinakohlsalat', 'Zitronencremeschnitte']
      },

      /* ---- Menüplan 21.09. – 27.09.2026 (nur Mittagessen) ---- */
      '2026-09-21': {
        hausmann:   ['Klare Gemüse-Kartoffelsuppe', 'Eintopf mit Rind, Rollgerste und Bohnen (Tscholent)', 'Orangenjoghurt'],
        leicht:     ['Selleriecremesuppe', 'Putenkeulen-Geschnetzeltes in Gemüserahmsauce', 'Hörnchen', 'Gemischter Blattsalat', 'Apfelkompott'],
        diabetiker: ['Klare Gemüse-Kartoffelsuppe', 'Gemüselasagne', 'Tomatensauce', 'Gemischter Blattsalat', 'Orangenjoghurt']
      },
      '2026-09-22': {
        hausmann:   ['Lauchcremesuppe', 'Topfen-Heidelbeerschmarren', 'Milch', 'Zwetschkenkompott'],
        leicht:     ['Klare Gemüsesuppe mit Backerbsen', 'Kräuteromelette mit Frischkäse', 'Salzerdäpfel', 'Endiviensalat', 'Polentacreme süß'],
        diabetiker: ['Lauchcremesuppe', 'Hühnerkeule in Rotweinsauce', 'Broccoli', 'Bandnudeln', 'Zwetschkenkompott']
      },
      '2026-09-23': {
        hausmann:   ['Spinatcremesuppe', 'Blunzenradln gebacken', 'Warmer Krautsalat', 'Geröstete Erdäpfel', 'Apfelcreme mit Topfen'],
        leicht:     ['Spinatcremesuppe', 'Fischragout', 'Bunte Spiralen', 'Bummerlsalat', 'Beerenragout'],
        diabetiker: ['Rindsuppe mit Fleischstrudel', 'Kichererbsen-Gemüse-Laibchen', 'Currydip', 'Bummerlsalat', 'Apfelcreme mit Topfen']
      },
      '2026-09-24': {
        hausmann:   ['Klare Gemüsesuppe mit Dinkelnockerl', 'Eiernudeln mit Asia-Gemüse', 'Chinakohlsalat', 'Obstsalat'],
        leicht:     ['Klare Gemüsesuppe mit Dinkelnockerl', 'Faschierter Braten vom Kalb', 'Glacierte Karotten', 'Erdäpfel-Zellerpüree', 'Joghurt mit Moosbeer-Preiselbeeren'],
        diabetiker: ['Rote Linsensuppe', 'Apfelstrudel mit Nüssen', 'Vanillesauce', 'Obstsalat']
      },
      '2026-09-25': {
        hausmann:   ['Paradeissuppe', 'Gebratenes Tilapiafischfilet', 'Knoblauchdip', 'Petersilerdäpfel', 'Gemischter Salat', 'Karamellpudding'],
        leicht:     ['Paradeissuppe', 'Milchreis', 'Zimt-Zucker', 'Marillenröster'],
        diabetiker: ['Klare Gemüsesuppe mit Eistich', 'Reisfleisch vom Schwein mit Saft', 'Gemischter Salat', 'Marillenröster']
      },
      '2026-09-26': {
        hausmann:   ['Hühnersuppe mit Fadennudeln', 'Eingemachte Dillfisolen', 'Geröstete Erdäpfel', 'Rhabarberkompott'],
        leicht:     ['Kräutersuppe', 'Mediterranes Hendlfilet', 'Zucchinigemüse', 'Couscous natur', 'Vanillepudding'],
        diabetiker: ['Kräutersuppe', 'Gebratenes Pangasiusfilet', 'Feine Gemüsemischung', 'Petersilerdäpfel', 'Vanillepudding']
      },
      '2026-09-27': {
        hausmann:   ['Gebundene Gemüsesuppe', 'Surschopfbraten', 'Letscho', 'Reis', 'Himbeer-Vanilleschnitte'],
        leicht:     ['Rindsuppe mit Grießnockerl', 'Kürbisstrudel', 'Dillsauce', 'Salzerdäpfel', 'Nusskuchen'],
        diabetiker: ['Rindsuppe mit Grießnockerl', 'Putenschinkenknödel', 'Natursaftl', 'Rahmsauerkraut', 'Nusskuchen']
      }
    }
  }
};
