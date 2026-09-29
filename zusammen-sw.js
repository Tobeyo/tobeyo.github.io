/*
 * Zusammen · Service Worker
 *
 * Nur für die Benachrichtigungen der App "Zusammen": Android und iOS
 * zeigen eine Meldung nur über einen Service Worker an. Er gilt nur
 * für zusammen.html (Scope "./zusammen") und fasst sonst nichts an –
 * kein Zwischenspeicher, keine anderen Seiten.
 */
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });

// Auf die Meldung getippt: offene App nach vorne holen, sonst öffnen
self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  var ziel = (e.notification.data && e.notification.data.url) ||
    new URL('zusammen.html', self.registration.scope).href;
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
      for (var i = 0; i < list.length; i++) {
        if (list[i].url.indexOf('zusammen.html') > -1 && 'focus' in list[i]) {
          if ('navigate' in list[i]) list[i].navigate(ziel).catch(function () {});
          return list[i].focus();
        }
      }
      return self.clients.openWindow(ziel);
    })
  );
});
