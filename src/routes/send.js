const { Router } = require('express');
const router = Router();
const auth = require('../middleware/auth');
const {Expo} = require('expo-server-sdk');
const fetch = require('node-fetch');


router.route('/').post(async (req,res) => {

    async function sendPushNotification(expoPushToken) {
        const message = {
          to: expoPushToken,
          sound: 'default',
          title: 'si jala Title',
          body: 'And here is the body!',
          data: { 
            _id: "nuevoId",
            name: "Nombre del cliente",
            pedido: {
              _id: "idPedido",
              estado: "Pagado",
              productos: [
                {
                  name: "pedido uno"
                },
                {
                  name: "pedido dos"
                },
                {
                  name: "pedido tres"
                }
              ]
            } 
          },
        };
      
        await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(message),
        });
        console.log("entro");
      }

     await sendPushNotification('ExponentPushToken[cahPy8DaDVWmKUePk7xvZ9]');
     res.status(200).json({message: "notificacon enviada."});
    
    /* let expo = new Expo();
    let message = [
        {
            to: 'ExponentPushToken[cahPy8DaDVWmKUePk7xvZ9]',
            sound: 'si jalo',
            body: 'This is a test notification',
            data: { someData: 'data' },
        }
    ];
    
    let chunks = expo.chunkPushNotifications(message);
    console.log(chunks); */
/*         for (let pushToken of somePushTokens) {
        // Each push token looks like ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
        
        // Check that all your push tokens appear to be valid Expo push tokens
        if (!Expo.isExpoPushToken(pushToken)) {
            console.error(`Push token ${pushToken} is not a valid Expo push token`);
            continue;
        }
        
        // Construct a message (see https://docs.expo.io/push-notifications/sending-notifications/)
        messages.push({
            to: pushToken,
            sound: 'default',
            body: 'This is a test notification',
            data: { withSome: 'data' },
        })
        } */
 
// The Expo push notification service accepts batches of notifications so
// that you don't need to send 1000 requests to send 1000 notifications. We
// recommend you batch your notifications to reduce the number of requests
// and to compress them (notifications with similar content will get
// compressed).

});

module.exports = router;