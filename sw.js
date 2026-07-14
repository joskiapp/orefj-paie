// Service worker : ne sert que si l'app est un jour hébergée en http(s) — pas de rôle
// pour l'usage local (fichier ouvert directement), qui fonctionne déjà 100% hors ligne
// puisque toutes les données restent dans le localStorage du téléphone.
const CACHE_NAME = "orefj-paie-v4";
const CORE_FILES = [
  "./3Outil_Recompense_App.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-512-maskable.png",
  "./apple-touch-icon.png",
  "./favicon-48.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_FILES)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Réseau d'abord, secours par le cache : garantit que les utilisateurs en ligne reçoivent
// toujours la dernière version publiée (contrairement à une stratégie "cache d'abord", qui
// resterait bloquée sur une ancienne version tant que CACHE_NAME n'est pas changé), tout en
// conservant le fonctionnement hors ligne via le cache en cas d'échec réseau.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
