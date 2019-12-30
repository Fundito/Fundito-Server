const admin = require('firebase-admin');

const serviceAccount = require("../node_modules/serviceAccountKey");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://fundito-123.firebaseio.com"
    });

//Notice Data
let data= {
    title: "fundito",
    notibody: "가게이름",
    body: "펀딩!성공 ! 또는 실패!\n\n"+
"- 최원일 교수님 [GS3764_ 뇌와 인지] 월수 3교시\n\n"+
"- 정원진/서준혁 교수님 [CH2105_ 화학합성실험] 2분반 추가\n\n"+

"* 02/07 수정사항\n\n",
    time : (new Date()).getTime(),
    writer : "MJ",
};

// The topic name can be optionally prefixed with "/topics/".
var topic = 'NOTICE';


var message = {
    data: {
        title: data.title,
        body: data.notibody
    },
    topic: topic,
    android: {
        ttl: 3600 * 1000, // 1 hour in milliseconds
        priority: 'high'
    },
};

// Send a message to devices subscribed to the provided topic.
admin.messaging().send(message)
    .then((response) => {
        // Response is a message ID string.
        console.log('Successfully sent message:', response);
    })
    .catch((error) => {
        console.log('Error sending message:', error);
    });