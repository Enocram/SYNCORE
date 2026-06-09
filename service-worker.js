// ============================================================
// SERVICE WORKER - SYNCORE (VERSÃO COMPLETA COM TODOS OS ARQUIVOS)
// Estratégia: Cache First com fallback para rede
// ============================================================

const CACHE_NAME = 'syncore-cache-v2';

// Lista de arquivos essenciais (todos os módulos do sistema)
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/icons/favicon.ico',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png',
  '/css/design-system.css',
  '/css/themes.css',
  '/css/animations.css',
  '/css/style.css',
  '/js/app.js',
  '/js/storage.js',
  '/js/ux-engine.js',
  '/js/visual-engine.js',
  '/js/modules/router.js',
  '/js/modules/renderer.js',
  '/js/modules/pages/dashboard.js',
  '/js/modules/pages/projetos.js',
  '/js/modules/pages/mapa-neural.js',
  '/js/modules/pages/configuracoes.js',
  '/js/modules/pages/ai-hub.js',
  '/js/modules/pages/roadmap.js',
  '/js/modules/pages/login.js',
  '/js/modules/pages/profile.js',
  '/js/modules/pages/sync-status.js',
  '/js/modules/components/project-list.js',
  '/js/modules/components/project-form.js',
  '/js/modules/components/project-details.js',
  '/js/modules/components/project-preview.js',
  '/js/modules/components/preview-panel.js',
  '/js/modules/components/dashboard-stats.js',
  '/js/modules/components/dashboard-activity.js',
  '/js/modules/components/dashboard-widgets.js',
  '/js/modules/utils/url-validator.js',
  '/js/modules/ai/ai-registry.js',
  '/js/modules/ai/prompt-registry.js',
  '/js/modules/ai/ai-metrics.js',
  '/js/modules/ai/ai-network.js',
  '/js/modules/roadmap/roadmap-engine.js',
  '/js/modules/roadmap/roadmap-manager.js',
  '/js/modules/roadmap/roadmap-metrics.js',
  '/js/modules/roadmap/roadmap-alerts.js',
  '/js/modules/roadmap/roadmap-templates.js',
  '/js/modules/neural/neural-map.js',
  '/js/modules/neural/neural-map-v2.js',
  '/js/modules/neural/node-engine.js',
  '/js/modules/neural/graph-engine.js',
  '/js/modules/neural/layout-engine.js',
  '/js/modules/neural/interaction-engine.js',
  '/js/modules/knowledge/knowledge-center.js',
  '/js/modules/knowledge/research-hub.js',
  '/js/modules/knowledge/prompt-vault.js',
  '/js/modules/knowledge/decision-log.js',
  '/js/modules/knowledge/knowledge-search.js',
  '/js/modules/knowledge/notes-section.js',
  '/js/db/repository.js',
  '/js/boot/boot-engine.js',
  '/js/boot/boot-messages.js',
  '/js/boot/boot-animation.js',
  '/js/boot/boot-progress.js',
  '/js/boot/splash-screen.js',
  '/js/services/supabase.js',
  '/js/services/auth.js',
  '/js/services/sync-engine.js',
  '/js/services/conflict-engine.js',
  '/js/services/backup-engine.js',
  '/js/services/profile-service.js'
];

// Instalação: cacheia cada arquivo individualmente, sem interromper o processo se algum falhar
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Cacheando arquivos individualmente...');
      return Promise.allSettled(
        urlsToCache.map(url => {
          return cache.add(url).catch(err => {
            console.error(`[SW] ARQUIVO NÃO ENCONTRADO: ${url}`);
          });
        })
      ).then(() => {
        console.log('[SW] Instalação concluída (com possíveis falhas isoladas)');
        self.skipWaiting();
      });
    })
  );
});

// Ativação: limpa caches antigos e toma controle dos clientes
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('[SW] Removendo cache antigo:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Interceptação de fetch: cache-first, fallback para rede e offline fallback
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) {
        return cached;
      }
      return fetch(event.request).then(response => {
        if (response && response.status === 200 && event.request.method === 'GET') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      }).catch(() => {
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('/index.html');
        }
        return new Response('Offline - conteúdo não disponível', {
          status: 503,
          statusText: 'Offline'
        });
      });
    })
  );
});