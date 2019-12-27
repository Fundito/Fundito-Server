const statusCode = require('../module/utils/statusCode');
const responseMessage = require('../module/utils/responseMessage');
const authUtil = require('../module/utils/authUtil');
const pool = require('../module/db/pool');

const User = require('../model/User');

const table = `funding`;
const storeFundTable = `store_fund`;
const userTable = `user`;
const THIS_LOG = `펀딩 정보`;

const funding = {
    create: (userIdx, password, storeIdx, fundingMoney) => {
        return new Promise(async (resolve, reject) => {
            const fundingQuery = `SELECT * FROM ${table} WHERE user_idx = ? AND store_idx = ?`;
            const fundingResult = await pool.queryParam_Arr(fundingQuery, [userIdx, storeIdx]);

            if (!fundingResult) {
                resolve({
                    code : statusCode.INTERNAL_SERVER_ERROR,
                    json : authUtil.successFalse(responseMessage.INTERNAL_SERVER_ERROR)
                });
                return;
            }
            else {
                if (fundingResult[0] != undefined) {
                    resolve({
                        code : statusCode.BAD_REQUEST,
                        json : authUtil.successFalse(responseMessage.DUPLICATE_FUNDING)
                    });
                    return;
                }
                
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
                        // 가게의 목표 금액 가져오기
                        const selectStoreGoalMoneyQuery = `SELECT goal_money FROM ${storeFundTable} WHERE store_idx = ?`;
                        const selectStoreGoalMoneyResult = await pool.queryParam_Arr(selectStoreGoalMoneyQuery, [storeIdx]);
                        const goalMoney = selectStoreGoalMoneyResult[0].goal_money;
                        console.log(goalMoney);

                        // 가게에 펀딩 된 금액들을 가져오기
                        const selectFundingMoneyQuery = `SELECT funding_money FROM ${table} WHERE store_idx = ?`;
                        const selectFundingMoneyResult = await pool.queryParam_Arr(selectFundingMoneyQuery, [storeIdx]);
                        /** [TODO] 펀딩머니 모두 더해서 비교하기 */
                        console.log(selectFundingMoneyResult);

                        if (!selectStoreGoalMoneyResult || !selectFundingMoneyResult) {
                            resolve({
                                code : statusCode.INTERNAL_SERVER_ERROR,
                                json : authUtil.successFalse(responseMessage.INTERNAL_SERVER_ERROR)
                            });
                            console.log(`DB ERROR`);
                            return;
                        }

                        if (goalMoney <= selectFundingMoneyResult) { // 펀딩 성공
                            // console.log(`${selectStoreGoalMoneyResult} 그리고 ${selectFundingMoneyResult}`);
                                const fund_status = 1;
                                const updateStoreFundInfoQuery = `UPDATE ${storeFundTable} SET fund_status = ? WHERE store_idx = ?`;
                                const updateStoreFundInfoResult = await pool.queryParam_Arr(updateStoreFundInfoQuery, [fund_status, storeIdx]);
                                if (!updateStoreFundInfoResult) {
                                    resolve({
                                        code : statusCode.INTERNAL_SERVER_ERROR,
                                        json : authUtil.successFalse(responseMessage.INTERNAL_SERVER_ERROR)
                                    });
                                    console.log(`update error`);
                                    return;
                                }
                            } else if (goalMoney > selectFundingMoneyResult) { // 펀딩 실패
                                const fund_status = 2;
                                const updateStoreFundInfoQuery = `UPDATE ${storeFundTable} SET fund_status = ? WHERE store_idx = ?`;
                                const updateStoreFundInfoResult = await pool.queryParam_Arr(updateStoreFundInfoQuery, [fund_status, storeIdx]);
                                if (!updateStoreFundInfoResult) {
                                    resolve({
                                        code : statusCode.INTERNAL_SERVER_ERROR,
                                        json : authUtil.successFalse(responseMessage.INTERNAL_SERVER_ERROR)
                                    });
                                    console.log(`update error`);
                                    return;
                                }
                            }

                        // 펀딩하기
                        const createFundQuery = `INSERT INTO ${table}(user_idx, store_idx, funding_money) VALUES(?, ?, ?)`;
                        const createFundResult = await pool.queryParam_Arr(createFundQuery, [userIdx, storeIdx, fundingMoney]);
                        if (!createFundResult) {
                            resolve({
                                code : statusCode.INTERNAL_SERVER_ERROR,
                                json : authUtil.successFalse(responseMessage.INTERNAL_SERVER_ERROR)
                            });
                            console.log(`FUND DB ERROR`);
                            return;
                        }
            
                        resolve({
                            code : statusCode.OK,
                            json : authUtil.successTrue(responseMessage.FUNDING_SUCCESS)
                        });
                    }
                    else {
                        resolve({
                            code : statusCode.UNAUTHORIZED,
                            json : authUtil.successTrue(responseMessage.MISS_MATCH_PASSWORD)
                        });
                    }
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