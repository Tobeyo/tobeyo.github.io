/* =========================================================
   ZUSAMMEN – Startrezepte
   ---------------------------------------------------------
   Wird von "zusammen.html" geladen. Beim ersten Öffnen nach
   einer neuen "version" legt die App diese Rezepte unter
   "Essen → Unsere Rezepte" an – einmal, nicht bei jedem Start.

     • Was es unter dem Namen schon gibt, bleibt unangetastet.
     • Was ihr später löscht oder ändert, kommt nicht zurück.
     • Neue Rezepte: unten anhängen und "version" um 1 erhöhen.

   "portionen" ist die Personenzahl, für die die Mengen gelten
   (die App rechnet von dort auf jede andere Zahl um).
   Die "id" muss je Rezept eindeutig und für immer gleich sein.
   ========================================================= */

window.ZUSAMMEN_REZEPTE = {
  version: 1,

  rezepte: [
    {
      id: 'rz-tofu-wraps',
      name: 'Tofu-Wraps',
      portionen: 2,
      zutaten: ['4 Wraps', '200 g Tofu', '1 Gurke', '2 Tomaten', '4 EL Tzatziki', 'Öl', 'Salz'],
      anleitung: 'Dauer: ca. 10 Min.\n\n' +
        'Tofu würfeln und in Öl 6-8 Min. knusprig braten, salzen.\n' +
        'Gurke und Tomaten schneiden.\n' +
        'Wraps kurz in der Pfanne erwärmen, mit Tzatziki bestreichen, belegen und einrollen.'
    },
    {
      id: 'rz-tofu-reis-pfanne',
      name: 'Tofu-Reis-Pfanne',
      portionen: 2,
      zutaten: ['160 g Reis (roh)', '200 g Tofu', '150 g Erbsen (TK)', '½ Dose Mais', '3 EL Sojasauce', 'Öl'],
      anleitung: 'Dauer: ca. 20 Min.\n\n' +
        'Reis nach Packung kochen.\n' +
        'Tofu würfeln und 6-8 Min. anbraten, Erbsen und Mais 3-4 Min. mitbraten.\n' +
        'Reis und Sojasauce dazugeben und 2-3 Min. weiterbraten.'
    },
    {
      id: 'rz-nudelsalat',
      name: 'Nudelsalat',
      portionen: 2,
      zutaten: ['200 g Nudeln', '2 Tomaten', '1 Gurke', '½ Dose Mais', '100 g Sauerrahm', 'Salz', 'Pfeffer'],
      anleitung: 'Dauer: ca. 15 Min.\n\n' +
        'Nudeln kochen und kalt abspülen.\n' +
        'Tomaten und Gurke würfeln, alles mit Sauerrahm mischen und abschmecken.\n' +
        'Hält im Kühlschrank 2-3 Tage.'
    },
    {
      id: 'rz-cremige-erbsen-nudeln',
      name: 'Cremige Erbsen-Nudeln',
      portionen: 2,
      zutaten: ['250 g Nudeln', '200 g Erbsen (TK)', '150 g Sauerrahm', '2 Knoblauchzehen', 'Öl', 'Salz', 'Pfeffer'],
      anleitung: 'Dauer: ca. 15 Min.\n\n' +
        'Nudeln kochen, in den letzten 3 Min. die Erbsen mitkochen.\n' +
        'Knoblauch in Öl 1 Min. anbraten, Nudeln und Erbsen dazugeben, Sauerrahm einrühren und nur kurz erwärmen (nicht kochen, sonst flockt er).'
    },
    {
      id: 'rz-laibchen-wraps',
      name: 'Laibchen-Wraps',
      portionen: 2,
      zutaten: ['4 Wraps', '4 vegetarische Laibchen', '1 Gurke', '2 Tomaten', '4 EL Tzatziki'],
      anleitung: 'Dauer: ca. 15 Min.\n\n' +
        'Laibchen nach Packung braten (ca. 8 Min.) und in Streifen schneiden.\n' +
        'Wraps wie bei Tofu-Wraps erwärmen, bestreichen, belegen und einrollen.'
    },
    {
      id: 'rz-veggie-burger',
      name: 'Veggie-Burger',
      portionen: 2,
      zutaten: ['4 Semmeln', '4 Laibchen', '2 Tomaten', '½ Gurke', '4 EL Tzatziki'],
      anleitung: 'Dauer: ca. 15 Min.\n\n' +
        'Laibchen braten.\n' +
        'Semmeln halbieren und kurz anrösten.\n' +
        'Mit Tzatziki, Tomaten- und Gurkenscheiben und Laibchen belegen.'
    },
    {
      id: 'rz-veggie-hotdogs',
      name: 'Veggie-Hotdogs',
      portionen: 2,
      zutaten: ['4 Hotdog-Brötchen', '4 vegetarische Würstel', '1 Gurke', 'Ketchup'],
      anleitung: 'Dauer: ca. 10 Min.\n\n' +
        'Würstel nach Packung erhitzen oder braten, Brötchen kurz aufwärmen.\n' +
        'Würstel ins Brötchen legen, Gurkenscheiben und Ketchup dazu.'
    },
    {
      id: 'rz-tofu-bolognese-lasagne',
      name: 'Tofu-Bolognese-Lasagne mit Wraps',
      portionen: 2,
      zutaten: ['6 Wraps', '250 g Tofu', '500 g passierte Tomaten', '2 Knoblauchzehen', '150 g Sauerrahm', '80 g Reibkäse', 'Öl', 'Salz', 'Pfeffer'],
      anleitung: 'Dauer: ca. 40 Min.\n\n' +
        'Tofu zerbröseln und 6-8 Min. anbraten, Knoblauch 1 Min. mitbraten, Tomaten dazugeben und 10 Min. köcheln, würzen.\n' +
        'In einer Form abwechselnd Sauce und Wraps schichten (3 Lagen, oben Sauce).\n' +
        'Mit Sauerrahm bestreichen, Reibkäse darüber, bei 200 °C ca. 20 Min. backen.'
    },
    {
      id: 'rz-nudelauflauf',
      name: 'Nudelauflauf',
      portionen: 2,
      zutaten: ['250 g Nudeln', '500 g passierte Tomaten', '150 g Erbsen (TK)', '150 g Sauerrahm', '80 g Reibkäse', 'Salz', 'Pfeffer'],
      anleitung: 'Dauer: ca. 35 Min.\n\n' +
        'Nudeln 2 Min. kürzer als auf der Packung kochen.\n' +
        'Mit Tomaten, Erbsen und Sauerrahm mischen, würzen, in eine Form geben, Reibkäse darüber.\n' +
        'Bei 200 °C ca. 20 Min. backen.'
    },
    {
      id: 'rz-ueberbackene-wrap-rollen',
      name: 'Überbackene Wrap-Rollen',
      portionen: 2,
      zutaten: ['4 Wraps', '200 g Tofu', '½ Dose Mais', '400 g passierte Tomaten', '60 g Reibkäse', 'Salz', 'Pfeffer'],
      anleitung: 'Dauer: ca. 35 Min.\n\n' +
        'Tofu zerbröseln und anbraten (statt Tofu geht auch: 4 Laibchen braten und zerkleinern), mit Mais mischen und würzen.\n' +
        'Auf die Wraps verteilen, einrollen, in eine Form legen.\n' +
        'Tomaten darübergießen, Reibkäse darauf, bei 200 °C 15-20 Min. backen.'
    }
  ]
};
