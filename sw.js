const cacheStorageKey = 'minimal-pwa-8';

const cacheList = [
  '/',
  "index.html",
  "main.css",
  "e.png",
  "pwa-fonts.png",
]


function resStatus(res) {
  return res && res.status >= 200 && res.status < 400;
}


self.addEventListener('install', function (e) {
  console.log('install success!');
  e.waitUntil(
      caches.open(cacheStorageKey).then(function (cache) {
        console.log('Adding to Cache:', cacheList);
        return cache.addAll(cacheList)
      }).then(function () {
        console.log('Skip waiting!');
        return self.skipWaiting()
      })
  )
})

self.addEventListener('activate', function (e) {
  console.log('Activated')
  e.waitUntil(
      Promise.all(
          caches.keys().then(cacheNames => {
            return cacheNames.map(name => {
              if (name !== cacheStorageKey) {
                return caches.delete(name)
              }
            })
          })
      ).then(() => {
        console.log('Clients claims.')
        return self.clients.claim()
      })
  )
})

self.addEventListener('fetch', function (event) {
  /**
   e.respondWith(
   caches.match(e.request)
   .then(response => {
            if (response) {
              let fetchRequest = event.request.clone();
              fetch(fetchRequest).then(newRes => {
                if (newRes && newRes.status >= 200 && newRes.status < 400) {
                  caches.open(cacheStorageKey)
                      .then(cache => {
                        console.log('update cache is succeed!')
                        cache.put(req, responseToCache);
                      })
                      .catch(err => console.log(err));
                } else {
                  console.log('update cache is failed!');
                }
              });
              return response;
            } else {
              return fetch(req)
                  .then(res => {
                    if (!resStatus(res)) {
                      console.log('download is failed!');
                      return res;
                    }
                    let responseToCache = newRes.clone();
                    caches.open(cacheStorageKey)
                        .then(cache => {
                          cache.put(req, responseToCache);
                        })
                        .catch(err => console.log(err));
                    return res;
                  })
            }
          })
   )
   */
  event.respondWith(
      caches.match(event.request)
          .then(function (response) {
            // Cache hit - return response
            if (response) {
              return response;
            }

            // IMPORTANT: Clone the request. A request is a stream and
            // can only be consumed once. Since we are consuming this
            // once by cache and once by the browser for fetch, we need
            // to clone the response.
            let fetchRequest = event.request.clone();

            return fetch(fetchRequest).then(
                function (response) {
                  // Check if we received a valid response
                  if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                  }

                  // IMPORTANT: Clone the response. A response is a stream
                  // and because we want the browser to consume the response
                  // as well as the cache consuming the response, we need
                  // to clone it so we have two streams.
                  let responseToCache = response.clone();

                  caches.open(cacheStorageKey)
                      .then(function (cache) {
                        cache.put(event.request, responseToCache);
                      });

                  return response;
                }
            );
          })
  );

})

self.addEventListener('push', function (e) {
  e.waitUntil(self.registration.showNotification('New Post Arrival', {
    icon: '/e.png'
  }))
})


self.addEventListener('message', function (e) {
  console.log(e.data);
})
