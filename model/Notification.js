const statusCode = require('../module/utils/statusCode');
const responseMessage = require('../module/utils/responseMessage');
const authUtil = require('../module/utils/authUtil');
const pool = require('../module/db/pool');
const encryptionModule = require('../module/cryption/encryptionModule');


const table = `notification`;
const userTable = `user`;
const store
const THIS_LOG = `알림`;

const user = {
    create: () => {

    },

    readAll: (userIdx) => {
        return new Promise(async (resolve,reject) => {
            const selectNotificationQuery = `SELECT * from table WHERE user_idx = ?`;
            const selectNotificationResult = pool.queryParam_Arr(selectNotificationQuery, [userIdx]);

            if (!selectNotificationResult) {
                resolve({
                    code: statusCode.INTERNAL_SERVER_ERROR,
                    json: authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
                });
                console.log(`select Notification ERROR`);
                return;
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