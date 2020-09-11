// const tls = require('tls')
// const https = require('live-server-https');

// const server = tls.createServer(https, (socket) => {
//   console.log('server connected',
//               socket.authorized ? 'authorized' : 'unauthorized');
//   socket.write('welcome!\n');
//   socket.setEncoding('utf8');
//   socket.pipe(socket);
// });
// server.listen(8000, () => {
//   console.log('server bound');
// });

const technosDiv = document.querySelector('#technos');

function loadTechnologies() {
    fetch('http://localhost:3001/technos')
        //fetch('https://nodetestapi-thyrrtzgdz.now.sh/technos')
        .then(response => {
            response.json()
                .then(technos => {
                    const allTechnos = technos.map(t => `<div><b>${t.name}</b> ${t.description}  <a href="${t.url}">site de ${t.name}</a> </div>`)
                        .join('');

                    technosDiv.innerHTML = allTechnos;
                    return; //important pour probleme firefox de cross origin
                });
        })
        .catch(console.error);
}

loadTechnologies();

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}


if (navigator.serviceWorker) {
    navigator.serviceWorker
        .register('sw.js')
        .catch(err => console.log(err))
        .then(registration => {

            // dans une app réelle, on ferait un fetch('http://localhost/getkey') vers un server node pa ex.
            // pour aller a l'essentiel, on copie colle dans une const de main.js

            // publique vapid key generated with web-push
            const publicKey = 'BP4v7-w9QERh3-H0-WJXyyK2J5IktWXuiD8DPunV9v0yu3hnC5LiMD0g2wCxGLjCfZzlT4Z_T_Aaq_LifVBZhHk';

            registration.pushManager.getSubscription().then(subscription => {
                if (subscription) {
                    console.log('subscription', subscription)
                    extractKeysFromArrayBuffer(subscription)
                    return subscription;
                } else {
                    // ask for subscription
                    const convertedKey = urlBase64ToUint8Array(publicKey);
                    return registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: convertedKey
                    }).then(newSubscription => {
                        // TODO post to a subscription DB
                        console.log('newSubscription', newSubscription);
                        // no more keys proprety directly visible on the subscription objet. So you have to use getKey()
                        const key = newSubscription.getKey('p256dh');
                        const auth = newSubscription.getKey('auth');
                        console.log('p256dh key', key);
                        console.log('auth key', auth);
                    })
                }
            })

        })
}

function extractKeysFromArrayBuffer(subscription) {
    // no more keys proprety directly visible on the subscription objet. So you have to use getKey()
    const keyArrayBuffer = subscription.getKey('p256dh');
    const authArrayBuffer = subscription.getKey('auth');
    const p256dh = btoa(String.fromCharCode.apply(null, new Uint8Array(keyArrayBuffer)));
    const auth = btoa(String.fromCharCode.apply(null, new Uint8Array(authArrayBuffer)));
    console.log('p256dh key', keyArrayBuffer, p256dh);
    console.log('auth key', authArrayBuffer, auth);
}

// if(window.caches){
//     // caches.open('veille-techno-1.0');
//     // caches.open('other-1.0');
//     // caches.keys().then(console.log);

//     // caches.open('veille-techno-1.0').then(cache => {
//     //     cache.addAll([
//     //         'index.html',
//     //         'main.js',
//     //         'vendors/bootstrap4.min.css'
//     //     ])
//     // })
// }

// non persistent notification
// if(window.Notification && window.Notification !== 'denied'){
//     Notification.requestPermission(perm => { //demande de permission
//         if(perm === 'granted') { // si ok
//             const options = {
//                 body: 'Je suis le body',
//                 icon: 'images/icons/icon-72x72.png'
//             }
//             const notif = new Notification('Hello notification', options)
//         } else {
//             console.log('Autorisation  notif nok')
//         }
//     })
// }




