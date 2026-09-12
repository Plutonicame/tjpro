// Service Worker TJP — uniquement pour les notifications push (aucun cache
// offline volontairement, ce n'est pas le sujet).

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Un message arrive côté serveur (Edge Function send-push) -> on affiche une
// vraie notification système ET on pose un badge sur l'icône. Le badge est
// volontairement posé SANS chiffre (juste un point) : voir fcUpdateNavBadge
// côté app pour la même règle appliquée pendant que l'app est ouverte.
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = {title: 'TJP', body: event.data ? event.data.text() : 'Nouveau message'};
  }
  const title = data.title || 'TJP';
  const options = {
    body: data.body || 'Nouveau message',
    tag: data.tag || 'tjp-message',
    renotify: true,
    data: {url: data.url || './'},
  };
  event.waitUntil(
    (async () => {
      await self.registration.showNotification(title, options);
      if (self.navigator && 'setAppBadge' in self.navigator) {
        try {
          await self.navigator.setAppBadge();
        } catch (e) {}
      }
    })(),
  );
});

// Clic sur la notification -> on ramène l'app au premier plan (sans essayer
// de deviner sur quelle conversation ouvrir : l'app recalculera elle-même
// les non-lus dès qu'elle sera au premier plan).
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || './';
  event.waitUntil(
    (async () => {
      const allClients = await clients.matchAll({type: 'window', includeUncontrolled: true});
      for (const c of allClients) {
        if ('focus' in c) return c.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })(),
  );
});
