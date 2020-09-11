const webPush = require('web-push');

const pushServerKeys = require('./pushServerKeys.json')
const pushClientSubscription = require('./pushClientSubscription.json')

console.log(pushServerKeys, pushClientSubscription)

webPush.setVapidDetails('mailto:chambost.loic@gmail.com',pushServerKeys.publicKey,pushServerKeys.privateKey)

const subscription = {
    endpoint: pushClientSubscription.endpoint,
    keys: {
        p256dh: pushClientSubscription.keys.p256dh,
        auth: pushClientSubscription.keys.auth
    }
}

webPush.sendNotification(subscription, 'Notif depuis push Node')
.then(res => console.log('push ok', res))
.catch(err => console.log(err))