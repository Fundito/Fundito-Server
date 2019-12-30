const statusCode = require('../module/utils/statusCode');
const responseMessage = require('../module/utils/responseMessage');
const authUtil = require('../module/utils/authUtil');
const pool = require('../module/db/pool');

const moment = require(`moment`);

const storeInfo = require('../model/StoreInfo');

const table = `notification`;
const THIS_LOG = `알림`;

const user = {
    create: () => {

    },

    readAll: () => {
        return new Promise(async (resolve,reject) => {
            const selectNotificationQuery = `SELECT * FROM ${table}`;
            const selectNotificationResult = await pool.queryParam_None(selectNotificationQuery);
        
            if (!selectNotificationResult) {
                resolve({
                    code: statusCode.INTERNAL_SERVER_ERROR,
                    json: authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
                });
                console.log(`select Notification ERROR`);
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

    readAllUserNoti: (userIdx) => {
        return new Promise(async (resolve,reject) => {
            const selectNotificationQuery = `SELECT * FROM ${table} WHERE user_idx = ?`;
            let selectNotificationResult = await pool.queryParam_Arr(selectNotificationQuery, [userIdx]);

            if (!selectNotificationResult) {
                resolve({
                    code: statusCode.INTERNAL_SERVER_ERROR,
                    json: authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
                });
                console.log(`select Notification ERROR`);
                return;
            }

            if (selectNotificationResult[0] == undefined) {
                resolve({
                    code: statusCode.BAD_REQUEST,
                    json: authUtil.successFalse(statusCode.BAD_REQUEST, responseMessage.NO_INDEX)
                });
                return;
            }

            for (var i=0; i<selectNotificationResult.length ; i++) {
                await storeInfo.readStoreInfo(selectNotificationResult[i].store_idx)
                .then(({ code, json }) => {
                    selectNotificationResult[i].store_info = json.data;
                })
                .catch((err) => {
                    console.log(err);
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

    delete: () => {

    },

    update: () => {

    },
};

module.exports = user;