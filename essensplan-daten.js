/* =========================================================
   ESSENSPLAN – Mittagessen im Haus (Häuser zum Leben)
   ---------------------------------------------------------
   Wird von "arbeitszeiten.html" geladen und erscheint dort
   nur bei Personen, die hier unter "plaene" stehen – also
   nur bei Tobias, nicht bei Daniel.

   Der Plan kommt in drei Formen:
     • „Menüplan“        – nur Mittagessen
     • „Wochenmenüplan“  – Mittagessen (ME) und Abendessen (AE)
     • „Menübesteller“   – Foto vom Bestell-Bildschirm, eine Woche
                           je Bild, mit ME, Weicher Kost und AE
   In allen Fällen kommen nur die drei oberen Mittagessen in
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
      },

      /* ---- Wochenmenüplan 28.09. – 04.10.2026 (mit Abendessen, nur ME übernommen) ---- */
      '2026-09-28': {
        hausmann:   ['Karottencremesuppe', 'Tiroler Knödel mit Schwein', 'Linsen', 'Zitronen-Topfencreme'],
        leicht:     ['Rindsuppe mit Sternchen', 'Kräuterrahmschnitzel vom Hühnerfilet', 'Gemüsereis', 'Häuptelsalat', 'Zitronen-Topfencreme'],
        diabetiker: ['Karottencremesuppe', 'Nussnudeln mit Kartoffelnudeln', 'Milch', 'Pfirsichkompott']
      },
      '2026-09-29': {
        hausmann:   ['Klare Gemüse-Kartoffelsuppe', 'Grüne Bandnudeln', 'Lachs-Weißweinsauce', 'Gemischter Blattsalat', 'Sauerkirschenkompott'],
        leicht:     ['Zucchinicremesuppe', 'Topfenscheiterhaufen', 'Himbeersauce', 'Sauerkirschenkompott'],
        diabetiker: ['Zucchinicremesuppe', 'Kümmelfleisch vom Schwein mit Gemüse', 'Petersilerdäpfel', 'Grießkoch']
      },
      '2026-09-30': {
        hausmann:   ['Knoblauchrahmsuppe', 'Gekochtes Beinfleisch', 'Wirsingkohl', 'Salzerdäpfel', 'Schokopudding'],
        leicht:     ['Klare Gemüsesuppe mit Profiteroles', 'Gebratenes Seehechtfilet', 'Glacierte Karotten', 'Salzerdäpfel', 'Schokopudding'],
        diabetiker: ['Klare Gemüsesuppe mit Profiteroles', 'Indonesische Nudelpfanne mit Tofu und Gemüse (Bami Goreng)', 'Chinakohlsalat', 'Apfelmus']
      },
      '2026-10-01': {
        hausmann:   ['Minestrone', 'Gebackene Apfelspalten', 'Zimt-Zucker', 'Vanillesauce', 'Erdbeerkompott'],
        leicht:     ['Haferflockensuppe', 'Gemüse-Frittata', 'Petersilerdäpfel', 'Bummerlsalat', 'Erdbeerkompott'],
        diabetiker: ['Haferflockensuppe', 'Paprikahendl', 'Vollkornnockerln', 'Bummerlsalat', 'Joghurt Vanille']
      },
      '2026-10-02': {
        hausmann:   ['Dinkelsuppe mit Gemüse', 'Cremespinat', 'Gekochtes Ei', 'Geröstete Erdäpfel', 'Kokoscreme'],
        leicht:     ['Dinkelsuppe mit Gemüse', 'Faschierte Laibchen mit Saft', 'Erdäpfelpüree', 'Rote Rübensalat', 'Kokoscreme'],
        diabetiker: ['Rindsuppe mit Fleischnockerln', 'Kabeljaufilet gebraten', 'Röstgemüse', 'Tomatenreis', 'Ananaskompott']
      },
      '2026-10-03': {
        hausmann:   ['Hühnersuppe mit Butternockerl', 'Spaghetti', 'Sauce Arrabiata mit Schweinsspeck', 'Geriebener Hartkäse', 'Chinakohlsalat', 'Mandarinenkompott'],
        leicht:     ['Hühnersuppe mit Butternockerl', 'Gemüseeintopf', 'Polentaschnitte', 'Mandarinenkompott'],
        diabetiker: ['Schwarzwurzelsuppe', 'Geröstete Schweinsnierndln', 'Zwiebelkartoffel', 'Chinakohlsalat', 'Erdbeerpudding']
      },
      '2026-10-04': {
        hausmann:   ['Champignoncremesuppe', 'Schweinsschnitzel gebacken', 'Erdäpfelsalat', 'Zitrone', 'Nougat-Pistazienschnitte'],
        leicht:     ['Rindsuppe mit Kräuterfrittaten', 'Putenragout mit Gemüse', 'Reis', 'Topfenschnitte gebacken'],
        diabetiker: ['Rindsuppe mit Kräuterfrittaten', 'Knödel mit Ei', 'Endiviensalat', 'Topfenschnitte gebacken']
      },

      /* ---- Menübesteller 05.10. – 11.10.2026 (Bildschirm, nur ME übernommen) ---- */
      '2026-10-05': {
        hausmann:   ['Klare Gemüsesuppe mit Backerbsen', 'Krautfleckerl', 'Schokopudding'],
        leicht:     ['Klare Gemüsesuppe mit Backerbsen', 'Heißer Leberkäse', 'Gemüse natur', 'Erdäpfelpüree', 'Schokopudding'],
        diabetiker: ['Zwiebelsuppe', 'Rotbarschfilet in Senf-Mehlkruste', 'Mangold', 'Petersilerdäpfel', 'Beerenragout mit Sauerrahm']
      },
      '2026-10-06': {
        hausmann:   ['Gelbe Rübencremesuppe', 'Zwetschkenknödel mit Butterbrösel', 'Fruchtkompott'],
        leicht:     ['Gelbe Rübencremesuppe', 'Gnocchi', 'Tomatensauce mit Basilikum', 'Gemischter Blattsalat', 'Honigjoghurt'],
        diabetiker: ['Rindsuppe mit Reibteig', 'Gebratene Hendlkeule mit Saft', 'Gemüsereis', 'Gemischter Blattsalat', 'Fruchtkompott']
      },
      '2026-10-07': {
        hausmann:   ['Maiscremesuppe', 'Hirschragout', 'Nockerln', 'Häuptelsalat', 'Birnenkompott'],
        leicht:     ['Maiscremesuppe', 'Welsfilet gebraten', 'Kräuterkartoffeln', 'Häuptelsalat', 'Birnenkompott'],
        diabetiker: ['Klare Gemüsesuppe mit Bröselknödel', 'Kohlgemüse', 'Stampfkartoffeln', 'Pfirsichcreme']
      },
      '2026-10-08': {
        hausmann:   ['Panadelsuppe', 'Champignonbällchen mit Rahmsauce', 'Reis', 'Chinakohlsalat', 'Polentacreme süß'],
        leicht:     ['Panadelsuppe', 'Eingemachtes Huhn mit Gemüse', 'Spiralen', 'Polentacreme süß'],
        diabetiker: ['Kohlrabicremesuppe', 'Haferflockenschmarren', 'Milch', 'Marillenröster']
      },
      '2026-10-09': {
        hausmann:   ['Broccolicremesuppe', 'Polardorsch paniert', 'Erdäpfelsalat', 'Zitrone', 'Kirschenkompott'],
        leicht:     ['Broccolicremesuppe', 'Apfelstrudel', 'Vanillesauce', 'Kirschenkompott'],
        diabetiker: ['Gemüsesuppe mit Hirse', 'Hascheehörnchen', 'Rote Rübensalat', 'Joghurt-Pannacotta mit Heidelbeersauce']
      },
      '2026-10-10': {
        hausmann:   ['Rindsuppe mit Lungenstrudel', 'Käsekrainer vom Schwein', 'Pommes frites', 'Estragonsenf', 'Bummerlsalat', 'Garnierter Pfirsich'],
        leicht:     ['Grießsuppe', 'Putenkeulenrollbraten Esterhazy', 'Bandnudeln', 'Bummerlsalat', 'Garnierter Pfirsich'],
        diabetiker: ['Rindsuppe mit Lungenstrudel', 'Linsen-Gemüsecurry', 'Basmatireis', 'Vanillepudding']
      },
      '2026-10-11': {
        hausmann:   ['Hühnersuppe mit Fadennudeln', 'Schweinsbraten', 'Sauerkraut', 'Semmelknödel', 'Schokolade-Birnenschnitte'],
        leicht:     ['Hühnersuppe mit Fadennudeln', 'Broccoliauflauf', 'Kräutersauce', 'Salzerdäpfel', 'Mandelkuchen'],
        diabetiker: ['Ungarische Kartoffelsuppe', 'Lammragout mit Zucchini', 'Couscous natur', 'Mandelkuchen']
      },

      /* ---- Menübesteller 12.10. – 18.10.2026 (Bildschirm, nur ME übernommen) ---- */
      '2026-10-12': {
        hausmann:   ['Rindsuppe mit Eintropf', 'Karfiol mit Butterbrösel und gehacktem Ei', 'Petersilerdäpfel', 'Topfencreme mit Marillenmus'],
        leicht:     ['Rindsuppe mit Eintropf', 'Bunte Spiralen', 'Putenschinken-Käsesauce', 'Bummerlsalat', 'Topfencreme mit Marillenmus'],
        diabetiker: ['Mais-Erbsensuppe', 'Birnen-Polentaauflauf', 'Milch', 'Obstsalat']
      },
      '2026-10-13': {
        hausmann:   ['Champignoncremesuppe', 'Gebratenes Tilapiafischfilet', 'Kräuterbutter', 'Zartweizen-Gemüsepfanne mit Broccoli', 'Apfelkompott'],
        leicht:     ['Champignoncremesuppe', 'Kaiserschmarren', 'Milch', 'Apfelkompott'],
        diabetiker: ['Klare Gemüsesuppe mit Frittaten', 'Putenreisfleisch', 'Chinakohlsalat', 'Kaffeepudding']
      },
      '2026-10-14': {
        hausmann:   ['Klare Gemüsesuppe mit Buchstaben', 'Wurstknödel mit Schwein', 'Warmer Krautsalat', 'Kümmelsaft', 'Grießkoch mit Himbeersauce'],
        leicht:     ['Gemüsesuppe gebunden', 'Gebratenes Pangasiusfilet', 'Blattspinat natur', 'Salzerdäpfel', 'Melonencocktail'],
        diabetiker: ['Klare Gemüsesuppe mit Buchstaben', 'Eingemachte Dillfisolen', 'Stampfkartoffeln', 'Grießkoch mit Himbeersauce']
      },
      '2026-10-15': {
        hausmann:   ['Schwarzwurzelsuppe', 'Scheiterhaufen mit Äpfeln', 'Vanillesauce', 'Zwetschkenkompott'],
        leicht:     ['Rindsuppe mit Sternchen', 'Eiernockerl', 'Rote Rübensalat', 'Zitronen-Topfencreme'],
        diabetiker: ['Schwarzwurzelsuppe', 'Selchroller vom Schwein', 'Linsengemüse', 'Semmelknödel', 'Zwetschkenkompott']
      },
      '2026-10-16': {
        hausmann:   ['Klare Gemüsesuppe mit Eistich', 'Kürbislasagne', 'Endiviensalat', 'Schokopudding'],
        leicht:     ['Klare Gemüsesuppe mit Eistich', 'Majoranfleisch vom Rind', 'Spiralen', 'Endiviensalat', 'Apfelmus'],
        diabetiker: ['Lauchcremesuppe', 'Gebratenes Schollenfilet', 'Kräutersauce', 'Buntes Gemüse', 'Petersilerdäpfel', 'Apfelmus']
      },
      '2026-10-17': {
        hausmann:   ['Selleriecremesuppe', 'Gebackene Hühnerleber', 'Sauce Remoulade', 'Erdäpfel-Gurkensalat', 'Zitrone', 'Pfirsichkompott'],
        leicht:     ['Selleriecremesuppe', 'Gemüselaibchen', 'Joghurt-Kräuterdip', 'Petersilerdäpfel', 'Häuptelsalat', 'Erdbeercreme'],
        diabetiker: ['Hühnersuppentopf', 'Fleischbällchen in Kapernsauce', 'Gedünsteter Reis', 'Häuptelsalat', 'Erdbeercreme']
      },
      '2026-10-18': {
        hausmann:   ['Rindsuppe mit Grießnockerl', 'Hühnergeschnetzeltes in Paprikasauce', 'Nockerln', 'Bummerlsalat', 'Joghurtschnitte mit Kirschgelee'],
        leicht:     ['Paradeissuppe', 'Naturschnitzerl vom Schwein', 'Gemüseallerlei', 'Reis', 'Apfel-Topfenschnitte'],
        diabetiker: ['Rindsuppe mit Grießnockerl', 'Kartoffel-Lauchstrudel', 'Knoblauchsauce', 'Bummerlsalat', 'Apfel-Topfenschnitte']
      },

      /* ---- Menübesteller 19.10. – 25.10.2026 (Bildschirm, nur ME übernommen) ---- */
      '2026-10-19': {
        hausmann:   ['Klare Gemüsesuppe mit Käsecroutons', 'Champignonsauce', 'Semmelknödel', 'Topfen-Orangencreme'],
        leicht:     ['Cremesuppe mit Wurzelgemüse', 'Mediterranes Hühnerragout', 'Penne', 'Bummerlsalat', 'Topfen-Orangencreme'],
        diabetiker: ['Cremesuppe mit Wurzelgemüse', 'Kabeljaufilet gebraten', 'Broccoli', 'Petersilerdäpfel', 'Ananaskompott']
      },
      '2026-10-20': {
        hausmann:   ['Zucchinicremesuppe', 'Dukatenbuchteln', 'Vanillesauce', 'Marillenkompott'],
        leicht:     ['Rindsuppe mit Biskuitschöberln', 'Kürbisragout', 'Stampfkartoffeln', 'Marillenkompott'],
        diabetiker: ['Rindsuppe mit Biskuitschöberln', 'Schweinsrahmragout mit Dille und Fisolen', 'Spiralen', 'Gemischter Blattsalat', 'Schokopudding']
      },
      '2026-10-21': {
        hausmann:   ['Klare Gemüsesuppe mit Dinkelreis', 'Szegediner Krautfleisch vom Schweinsbauchfleisch', 'Salzerdäpfel', 'Sauerrahm', 'Birnenkompott'],
        leicht:     ['Hühnercremesuppe', 'Gebratenes Tilapiafischfilet', 'Zucchinigemüse', 'Salzerdäpfel', 'Früchtereis'],
        diabetiker: ['Klare Gemüsesuppe mit Dinkelreis', 'Kichererbsen-Gemüse-Laibchen', 'Paprika-Tomatenragout', 'Bummerlsalat', 'Birnenkompott']
      },
      '2026-10-22': {
        hausmann:   ['Pastinakencremesuppe', 'Kartoffelpuffer', 'Joghurt-Kräuterdip', 'Chinakohlsalat', 'Vanillepudding'],
        leicht:     ['Rindsuppe mit Teigmuscheln', 'Kalbsbraten', 'Gemüse natur', 'Reis', 'Vanillepudding'],
        diabetiker: ['Pastinakencremesuppe', 'Apfelauflauf mit Haferflocken', 'Milch', 'Beerenragout']
      },
      '2026-10-23': {
        hausmann:   ['Altwiener Suppentopf', 'Gebratenes Seehechtfilet', 'Cremige Polenta', 'Gemischter Salat', 'Zitrone', 'Apfelmus'],
        leicht:     ['Karottencremesuppe', 'Topfenstrudel', 'Erdbeersauce', 'Apfelmus'],
        diabetiker: ['Altwiener Suppentopf', 'Putenknacker', 'Eingemachtes Mischgemüse', 'Kümmelkartoffeln', 'Pfirsichjoghurtcreme']
      },
      '2026-10-24': {
        hausmann:   ['Einbrennsuppe', 'Hendlkeulengeschnetzeltes süß-sauer', 'Basmatireis', 'Tomatensalat', 'Cappuccinocreme'],
        leicht:     ['Rindsuppe mit Gemüsestreifen', 'Faschierte Laibchen mit Saft', 'Erdäpfelpüree', 'Tomatensalat', 'Sauerkirschenkompott'],
        diabetiker: ['Rindsuppe mit Gemüsestreifen', 'Cremespinat', 'Gekochtes Ei', 'Erdäpfelschmarren', 'Sauerkirschenkompott']
      },
      '2026-10-25': {
        hausmann:   ['Rindsuppe mit Leberknödel', 'Schweinssurschnitzel gebacken', 'Petersilerdäpfel', 'Rahmgurkensalat', 'Zitrone', 'Weincremeschnitte'],
        leicht:     ['Rindsuppe mit Leberknödel', 'Gebratene Eiernudeln mit Gemüse und Sojasprossen', 'Gemischter Blattsalat', 'Joghurt-Ribiselschnitte'],
        diabetiker: ['Champignoncremesuppe', 'Kalbsrahmherz', 'Serviettenknödel', 'Joghurt-Ribiselschnitte']
      },

      /* ---- Menübesteller 26.10. – 01.11.2026 (Bildschirm, nur ME übernommen) ---- */
      '2026-10-26': {
        hausmann:   ['Kohlrabicremesuppe', 'Hirschragout', 'Broccoli', 'Kartoffelknödel', 'Preiselbeer-Moosbeeren', 'Garnierter Pfirsich'],
        leicht:     ['Rindsuppe mit Eintropf', 'Champignonschnitzel vom Schwein', 'Spiralen', 'Bummerlsalat', 'Garnierter Pfirsich'],
        diabetiker: ['Kohlrabicremesuppe', 'Spinatauflauf mit Schafskäse', 'Kräutersauce', 'Bummerlsalat', 'Erdbeerröster']
      },
      '2026-10-27': {
        hausmann:   ['Klare Gemüsesuppe mit Eistich', 'Penne', 'Thunfisch-Tomatensauce', 'Häuptelsalat', 'Mandarinenkompott'],
        leicht:     ['Broccolicremesuppe', 'Palatschinkenauflauf mit Kirschen', 'Milch', 'Mandarinenkompott'],
        diabetiker: ['Klare Gemüsesuppe mit Eistich', 'Kürbis-Hühnerragout', 'Vollkornnockerln', 'Häuptelsalat', 'Apfelcreme mit Topfen']
      },
      '2026-10-28': {
        hausmann:   ['Selchsuppe mit Rollgerste', 'Selchschopf vom Schwein', 'Erbsenpüree', 'Röstzwiebel', 'Rote Rübensalat', 'Kokoscreme'],
        leicht:     ['Petersilsuppe', 'Kartoffel-Zucchinilaibchen', 'Rahm-Joghurt-Dip', 'Rote Rübensalat', 'Kokoscreme'],
        diabetiker: ['Petersilsuppe', 'Buttermilch-Heidelbeerschmarren', 'Milch', 'Fruchtkompott']
      },
      '2026-10-29': {
        hausmann:   ['Schwarzwurzelsuppe', 'Mannheimer Apfelauflauf', 'Vanillesauce', 'Birnenkompott'],
        leicht:     ['Klare Gemüsesuppe mit Backerbsen', 'Eierhörnchen', 'Häuptelsalat', 'Birnenkompott'],
        diabetiker: ['Schwarzwurzelsuppe', 'Gedünsteter Rindsbraten', 'Knoblauchfisolen', 'Kartoffelnudeln', 'Vanillepudding']
      },
      '2026-10-30': {
        hausmann:   ['Gelbe Rübencremesuppe', 'Kärntner Kasnudel mit brauner Butter', 'Warmer Krautsalat', 'Karamellpudding'],
        leicht:     ['Gelbe Rübencremesuppe', 'Hühnersaftschnitzel natur', 'Gemüsereis', 'Zellersalat', 'Karamellpudding'],
        diabetiker: ['Rindsuppe mit Fleischstrudel', 'Gebratenes Tilapiafischfilet', 'Feine Gemüsemischung', 'Dillerdäpfel natur', 'Zwetschkenkompott']
      },
      '2026-10-31': {
        hausmann:   ['Hühnersuppe mit Sternchen', 'Linsen-Gemüsecurry', 'Basmatireis', 'Apfel-Holunderkompott'],
        leicht:     ['Dinkelsuppe mit Gemüse', 'Gebratenes Schollenfilet', 'Romanescogemüse', 'Salzerdäpfel', 'Apfel-Holunderkompott'],
        diabetiker: ['Hühnersuppe mit Sternchen', 'Geröstete Hühnerleber', 'Reis', 'Gemischter Blattsalat', 'Buttermilch-Erdbeer-Smoothie']
      },
      '2026-11-01': {
        hausmann:   ['Rindsuppe mit Frittaten', 'Gebackene Hühnerkeule', 'Gedünsteter Pilawreis', 'Gurkensalat', 'Amarenaschnitte'],
        leicht:     ['Rindsuppe mit Frittaten', 'Nudelauflauf mit Faschiertem', 'Bummerlsalat', 'Birnenkuchen'],
        diabetiker: ['Kümmelcremesuppe', 'Gemüse-Frittata', 'Petersilerdäpfel', 'Bummerlsalat', 'Birnenkuchen']
      }
    }
  }
};
