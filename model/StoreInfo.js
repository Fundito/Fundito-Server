const statusCode = require('../module/utils/statusCode');
const responseMessage = require('../module/utils/responseMessage');
const authUtil = require('../module/utils/authUtil');
const pool = require('../module/db/pool');

const table = `store_info`;
const THIS_LOG = '상점 정보';

/**
 * storeInfo는 update가 없어도 된다.
 */
const storeInfo = {
    create: () => {

    },

    readAll: () => {

    },

    read: (storeIdx) => {
        return new Promise(async (resolve, reject) => {
            const getOneStoreQuery = `SELECT * FROM ${table} WHERE store_idx = ?`;
            const getOneStoreResult = await pool.queryParam_Arr(getOneStoreQuery, [storeIdx]);

            if (!getOneStoreResult) {
                resolve({
                    code : statusCode.INTERNAL_SERVER_ERROR,
                    json : authUtil.successFalse(responseMessage.INTERNAL_SERVER_ERROR)
                });
                return;
            }

            resolve({
                code : statusCode.OK,
                json : authUtil.successTrue(responseMessage.X_READ_SUCCESS(THIS_LOG), getOneStoreResult)
            });
        });
    },

    delete: () => {

    }
};

module.exports = storeInfo;

