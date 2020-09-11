const cacheName = 'veille-techno-1.3'

self.addEventListener('install', evt => {
    console.log('install', evt)
    const cachePromise = caches.open(cacheName).then(cache => {
        return cache.addAll([
            'index.html',
            'main.js',
            'style.css',
            'vendors/bootstrap4.min.css',
            'add_techno.html',
            'add_techno.js',
            'contact.html',
            'contact.js',
            'manifest.webmanifest',
            'database.js',
            'idb.js'
        ])
            .then(console.log('cache init'))
            .catch(console.err)
    })
    evt.waitUntil(cachePromise);
})



self.addEventListener('activate', evt => {
    // supprimer les anciennes version de caches si on change la version du cacheName 
    console.log('activate', evt);
    let cacheCleanedPromise = caches.keys().then(keys => {
        keys.forEach(key => {
            if (key != cacheName) {
                return caches.delete(key)
            }
        });
    })
    evt.waitUntil(cacheCleanedPromise);
})

self.addEventListener('fetch', async (evt) => {

    /**
    * * strategie de retour de page en mode degradé lors de site hors ligne
    */
    // if (!navigator.onLine) {
    //     const headers = { headers: { 'Content-Type': 'text/html;charset=utf-8' } }
    //     evt.respondWith(new Response(
    //         '<h1>Pas de connexion internet</h1><div>Application en mode dégradé</div>',
    //         headers
    //     ))
    // }

    //console.log('fetch', evt.request.url)

    /**
     * * strategie de cache only with network callback
     * * Cette stratregie, privilégie les perfs en chargeant d'abord ce qui est en cache,
     * * Puis en cas de probleme fait un appel reseau pour charger les manquements
     
    evt.respondWith(
        caches.match(evt.request).then(res => {
            if(res) {
                console.log(`url fetchée ${evt.request.url}`, res);
                return res;
            }
            // ici else
            // en cas d'echec de requete, faire une vrai requete au reseau
            
            return fetch(evt.request).then(newResponse => { 
                console.log(`url recup sur le reseau puis mise en cache ${evt.request.url}`, newResponse);
                //une fois qu'on a la nouvelle reponse, on met dans le cache 
                caches.open(cacheName).then(cache => cache.put(evt.request, newResponse));
                return newResponse.clone(); //on ne peut utiliser une reponse qu'une fois, alors on utilise un clone
            })
        })
    )
    */

    /**
     * * strategie de network first with cache callback
     * * Cette startegie (inverse a la precedente), privilégie des données fraiches du reseau,
     * * Puis en cas de probleme fait un appel au cache pour charger les manquements
    */

    evt.respondWith(
        fetch(evt.request).then(res => {
            caches.open(cacheName).then(cache => cache.put(evt.request, res));
            return newResponse.clone(); //on ne peut utiliser une reponse qu'une fois, alors on utilise un clone
        }).catch(err => {
            return caches.match(evt.request)
        })
    );

})

/**
* * LES NOTIFICATIONS - INTERNE
*/

// persistant notification
// self.registration.showNotification(
//     'Notification depuis le SW',
//     {
//         body: 'Je suis une notification pesistante',
//         actions: [
//             { action: 'accept', title: 'Accepter' },
//             { action: 'refused', title: 'Refuser' }
//         ]
//     }
// )

// self.addEventListener('notificationclose', evt => {
//     console.log('notification fermée', evt)
// })

// self.addEventListener('notificationclick', evt => {
//     if(evt.action === 'accept') {
//         console.log('Boutton accepter')
//     } else if(evt.action === 'refused') {
//         console.log('Boutton Refuser')
//     } else {
//         console.log('clické ailleur')
//     }
//     evt.notification.close();
// })

/**
* * LES NOTIFICATIONS - EXTERNE (PUSH)
*/

self.addEventListener('push', evt => {
    console.log('push evt', evt);
    console.log('data envoyée : ', evt.data.text());
    const data = evt.data.text()
    // Lancer en reponse une notif persistante
    evt.waitUntil(self.registration.showNotification(
        data,
        {
            body: 'Je suis une notification via push',
            image: 'images/icons/icon-152x152.png',
            actions: [
                { action: 'accept', title: 'Accepter' },
                { action: 'refused', title: 'Refuser' }
            ]
        })
    )
})

self.addEventListener('sync', event => {
    if (event.tag === 'sync-technos') {
        console.log('attempting sync', event.tag);
        console.log('syncing', event.tag);
        event.waitUntil(
            getAllTechnos().then(technos => {

                console.log('got technos from sync callback', technos);

                const unsynced = technos.filter(techno => techno.unsynced);

                console.log('pending sync', unsynced);

                return Promise.all(unsynced.map(techno => {
                    console.log('Attempting fetch', techno);
                    fetch('http://localhost:3001/technos', {
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        method: 'POST',
                        body: JSON.stringify(techno)
                    })
                        .then(() => {
                            console.log('Sent to server');
                            console.log('id passé à putTechno', techno.id);
                            return putTechno(Object.assign({}, techno, { unsynced: false }), techno.id);
                        })
                }))
            })
        )
    }
});
