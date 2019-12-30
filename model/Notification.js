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
            const selectNotificationQuery = `SELECT  from table WHERE user_idx = ?`;
            const selectNotificationResult = pool.queryParam_Arr(selectNotificationQuery, [userIdx]);

            const selectStoreNameQuery = `SELECT store_info.store_name, store_fund.fund_status, funding. FROM store_info WHERE user_idx = ?`

            if (!selectNotificationResult) {
                resolve({
                    code: statusCode.INTERNAL_SERVER_ERROR,
                    json: authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
                });
                console.log(`select Notification ERROR`);
                return;
            }

            const result = selectNotificationResult;
            result.store_name = 
            resolve({
                code: statusCode.OK,
                json: authUtil.successTrue(statusCode.OK, responseMessage.X_READ_SUCCESS(THIS_LOG), result)
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