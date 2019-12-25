const statusCode = require('../module/utils/statusCode');
const responseMessage = require('../module/utils/responseMessage');
const authUtil = require('../module/utils/authUtil');
const pool = require('../module/db/pool');

const User = require('../model/User');

const table = `funding`;
const userTable = `user`;
const THIS_LOG = `펀딩 정보`;

const funding = {
    create: (userIdx, password, storeIdx, fundingMoney) => {
        return new Promise(async (resolve, reject) => {
            const userQuery = `SELECT password FROM ${userTable} WHERE user_idx = ?`;
            const userResult = await pool.queryParam_Arr(userQuery, [userIdx]);

            if (!userResult) {
                resolve({
                    code : statusCode.INTERNAL_SERVER_ERROR,
                    json : authUtil.successFalse(responseMessage.INTERNAL_SERVER_ERROR)
                });
                return;
            }
            else {
                console.log(userResult[0].password);

                if (userResult[0].password == password) {
                    const createFundQuery = `INSERT INTO ${table}(user_idx, store_idx, funding_money) VALUES(?, ?, ?)`;
                    const createFundResult = await pool.queryParam_Arr(createFundQuery, [userIdx, storeIdx, fundingMoney]);
        
                    if (!createFundResult) {
                        resolve({
                            code : statusCode.INTERNAL_SERVER_ERROR,
                            json : authUtil.successFalse(responseMessage.INTERNAL_SERVER_ERROR)
                        });
                        return;
                    }
        
                    resolve({
                        code : statusCode.OK,
                        json : authUtil.successTrue(responseMessage.X_CREATE_SUCCESS(THIS_LOG))
                    });
                }
                else {
                    resolve({
                        code : statusCode.OK,
                        json : authUtil.successTrue(responseMessage.MISS_MATCH_PASSWORD)
                    });
                }
            }

            
        });
    },

    readAll: () => {
        return new Promise(async (resolve, reject) => {
            const getFundListQuery = `SELECT * FROM ${table}`;
            const getFundListResult = await pool.queryParam_None(getFundListQuery);

            if (!getFundListResult) {
                resolve({
                    code : statusCode.INTERNAL_SERVER_ERROR,
                    json : authUtil.successFalse(responseMessage.INTERNAL_SERVER_ERROR)
                });
                return;
            }

            resolve({
                code : statusCode.OK,
                json : authUtil.successTrue(responseMessage.X_READ_ALL_SUCCESS(THIS_LOG), getFundListResult)
            });
        });
    },

    read: (userIdx) => {
        return new Promise(async (resolve, reject) => {
            const getMyFundListQuery = `SELECT * FROM ${table} WHERE user_idx = ?`;
            const getMyFundListResult = await pool.queryParam_Arr(getMyFundListQuery, [userIdx]);

            if (!getMyFundListResult) {
                resolve({
                    code : statusCode.INTERNAL_SERVER_ERROR,
                    json : authUtil.successFalse(responseMessage.INTERNAL_SERVER_ERROR)
                });
                return;
            }

            resolve({
                code : statusCode.OK,
                json : authUtil.successTrue(responseMessage.X_READ_SUCCESS(THIS_LOG), getMyFundListResult)
            });
        });
    },

    update: () => {
        // 이건 할 필요 없을듯!
    },

    delete: (userIdx, storeIdx) => {
        return new Promise(async (resolve, reject) => {
            const deleteFundingQuery = `DELETE FROM ${table} WHERE user_idx = ? AND store_idx = ?`;
            const deleteFundingResult = await pool.queryParam_Arr(deleteFundingQuery, [userIdx, storeIdx]);

            if (!deleteFundingResult) {
                resolve({
                    code : statusCode.INTERNAL_SERVER_ERROR,
                    json : authUtil.successFalse(responseMessage.INTERNAL_SERVER_ERROR)
                });
                return;
            }

            resolve({
                code : statusCode.OK,
                json : authUtil.successTrue(responseMessage.X_DELETE_SUCCESS(THIS_LOG))
            });
        });
    }
};

module.exports = funding;