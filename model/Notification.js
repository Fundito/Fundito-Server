const statusCode = require('../module/utils/statusCode');
const responseMessage = require('../module/utils/responseMessage');
const authUtil = require('../module/utils/authUtil');
const pool = require('../module/db/pool');

const admin = require(`firebase-admin`);
const moment = require(`moment`);

const serviceAccount = require('../config/serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://fundito-123.firebaseio.com"
});

const storeInfo = require('../model/StoreInfo');
const table = `notification`;
const THIS_LOG = `알림`;

const notification = {
    create: () => {

    },

    readAll: () => {
        return new Promise(async (resolve, reject) => {
            const selectNotificationQuery = `SELECT * FROM ${table}`;
            const selectNotificationResult = await pool.queryParam_None(selectNotificationQuery);

            if (!selectNotificationResult) {
                resolve({
                    code: statusCode.INTERNAL_SERVER_ERROR,
                    json: authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
                });
                return;
            }

            if (selectNotificationResult[0] == undefined) {
                resolve({
                    code: statusCode.BAD_REQUEST,
                    json: authUtil.successFalse(statusCode.BAD_REQUEST, responseMessage.NO_INDEX)
                });
                return;
            }

            resolve({
                code: statusCode.OK,
                json: authUtil.successTrue(statusCode.OK, responseMessage.X_READ_SUCCESS(THIS_LOG), selectNotificationResult)
            });
        });
    },

    readUserAllNoti: (userIdx) => {
        return new Promise(async (resolve, reject) => {
            const selectNotificationQuery = `SELECT * FROM ${table} WHERE user_idx = ?`;
            let selectNotificationResult = await pool.queryParam_Arr(selectNotificationQuery, [userIdx]);

            if (!selectNotificationResult) {
                resolve({
                    code: statusCode.INTERNAL_SERVER_ERROR,
                    json: authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
                });
                return;
            }

            if (selectNotificationResult[0] == undefined) {
                resolve({
                    code: statusCode.BAD_REQUEST,
                    json: authUtil.successFalse(statusCode.BAD_REQUEST, responseMessage.NO_NOTIFICATION)
                });
                return;
            }

            for (var i = 0; i < selectNotificationResult.length; i++) {
                await storeInfo.readStoreInfo(userIdx,selectNotificationResult[i].store_idx)
                    .then(({
                        code,
                        json
                    }) => {
                        selectNotificationResult[i].store_info = json.data;
                    })
                    .catch((err) => {
                        res.status(statusCode.INTERNAL_SERVER_ERROR, authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
                    });
            }

            resolve({
                code: statusCode.OK,
                json: authUtil.successTrue(statusCode.OK, responseMessage.X_READ_SUCCESS(THIS_LOG), selectNotificationResult)
            });
        });
    },

    read: () => {

    },

    delete: (notificationIdx) => {
        return new Promise(async (resolve, reject) => {
            const deleteNotificationQuery = `DELETE FROM ${table} WHERE notification_idx = ?`;
            const deleteNotificationResult = await pool.queryParam_Arr(deleteNotificationQuery, [notificationIdx]);

            if (!deleteNotificationResult) {
                resolve({
                    code: statusCode.INTERNAL_SERVER_ERROR,
                    json: authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
                });
                return;
            }

            resolve({
                code: statusCode.OK,
                json: authUtil.successTrue(statusCode.OK, responseMessage.X_DELETE_SUCCESS(THIS_LOG))
            });
        });
    },

    update: () => {

    },
    
    sendMessage: (userIdx,storeIdx) => {
        return new Promise(async (resolve, reject) => {
        const getFirebaseTokenQuery = `SELECT firebase_token FROM user WHERE user_idx = ?`;
        const getFirebaseTokenResult = await pool.queryParam_Arr(getFirebaseTokenQuery, [userIdx]);

        if(getFirebaseTokenResult[0] == undefined) {
            resolve({
                code: statusCode.BAD_REQUEST,
                json: authUtil.successFalse(statusCode.BAD_REQUEST, responseMessage.NO_INDEX)
            });
            return;
        }

        if(!getFirebaseTokenQuery){
            resolve({
                code: statusCode.INTERNAL_SERVER_ERROR,
                json: authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
            });
            return;
        }
        
        var registrationToken = getFirebaseTokenResult[0].firebase_token;
        console.log(registrationToken);

        var message = {
            data: {
                "title" : "펀디토",
                "message" : "당신이 투자한 음식점의 펀딩결과를 확인하세요!"
            },
            token: registrationToken
        };

        admin.messaging().send(message)
            .then( async (response) => {
                // Response is a message ID string.
                console.log('Successfully sent message:', response);
                //notification.insertNotification(storeIdx, userIdx);
                const now = moment(Date.now()).format(`YYYY-MM-DD hh:mm:ss`);
                const insertNotificationQuery = `INSERT INTO ${table} (user_idx, store_idx, date) VALUES(?, ?, ?)`;
                const insertNotificationResult = await pool.queryParam_Arr(insertNotificationQuery, [userIdx, storeIdx, now]);
    
                if(!insertNotificationResult) {
                    console.log(responseMessage.INTERNAL_SERVER_ERROR);
                    return;
                }
    
                console.log(responseMessage.NOTIFICATION_INSERT_SUCCESS);
    
            })
            .catch((error) => {
                console.log('Error sending message:', error);
            });
        });


    },
};

module.exports = notification;