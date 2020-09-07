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

if(navigator.serviceWorker) {
    navigator.serviceWorker.register('sw.js')
    .catch(err => console.log(err))
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
