// sw.js — LongeViver FQ5C
// Correção: agora com um "plano B" para quando não há internet e o arquivo
// pedido não bate exatamente com o que foi salvo no cache.

const CACHE_NAME = "longeviver-v2"; // mude esse número sempre que atualizar o app

const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/apple-touch-icon.png"
];

// INSTALAÇÃO: guarda cada arquivo individualmente.
// Se um único arquivo falhar (nome errado, caminho errado), os outros
// continuam sendo salvos — antes, uma falha travava o cache inteiro.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(
        ASSETS.map((url) =>
          cache.add(url).catch((err) => console.warn("Não consegui guardar:", url, err))
        )
      )
    )
  );
  self.skipWaiting();
});

// ATIVAÇÃO: descarta versões antigas do cache
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// BUSCA: cache primeiro (rápido); se não achar, tenta a internet;
// se não houver internet, devolve a página principal salva — em vez de travar.
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request).catch(() => {
        if (event.request.mode === "navigate") {
          return caches.match("./index.html");
        }
      });
    })
  );
});
