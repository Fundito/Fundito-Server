const statusCode = require('../module/utils/statusCode');
const responseMessage = require('../module/utils/responseMessage');
const authUtil = require('../module/utils/authUtil');
const pool = require('../module/db/pool');

const table = `user`;
const THIS_LOG = `사용자`;

const user = {
    create: () => {

    },

    readAll: () => {

    },

    read: (userIdx) => {
        return new Promise(async (resolve, reject) => {
            const getCertainUserQuery = `SELECT * FROM ${table} user_idx = ?`;
            const getCertainUserResult = await pool.queryParam_Arr(getCertainUserQuery, [userIdx]);

            if (!getCertainUserResult) {
                resolve({
                    code : statusCode.INTERNAL_SERVER_ERROR,
                    json : authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
                });
                return;
            }

            resolve({
                code : statusCode.OK,
                json : authUtil.successTrue(statusCode.OK, responseMessage.X_READ_SUCCESS(THIS_LOG), getCertainUserResult)
            });
        });
    },

    update: () => {

    },

    delete : () => {

    }
};

module.exports = user;