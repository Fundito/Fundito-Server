const statusCode = require('../module/utils/statusCode');
const responseMessage = require('../module/utils/responseMessage');
const authUtil = require('../module/utils/authUtil');
const pool = require('../module/db/pool');
const decryptionModule = require('../module/cryption/decryptionModule');

const moment = require('moment');
const User = require('../model/User');

const table = `funding`;
const storeFundTable = `store_fund`;
const userTable = `user`;
const THIS_LOG = `펀딩 정보`;

const funding = {
    create: (userIdx, payPassword, storeIdx, fundingMoney) => {
        return new Promise(async (resolve, reject) => {
            // 가게 정보 가져오기
            const storeIdxQuery = `SELECT * FROM store_info WHERE store_idx = ?`;
            const storeIdxResult = await pool.queryParam_Arr(storeIdxQuery, [storeIdx]);

            if (storeIdxResult[0] == undefined) {
                resolve({
                    code : statusCode.BAD_REQUEST,
                    json : authUtil.successFalse(statusCode.BAD_REQUEST, `해당하지 않는 storeIdx 값입니다.`)
                });
                return;
            }
            

            // store fund 펀딩 등록하지 않은 가게 처리
            const storeFundQuery = `SELECT * FROM store_fund WHERE store_idx = ?`;
            const storeFundResult = await pool.queryParam_Arr(storeFundQuery, [storeIdx]);

            if (!storeFundResult) {
                resolve({
                    code : statusCode.INTERNAL_SERVER_ERROR,
                    json : authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
                });
                return;
            }
            if (storeFundResult[0] === undefined) {
                resolve({
                    code : statusCode.BAD_REQUEST,
                    json : authUtil.successFalse(statusCode.BAD_REQUEST, `펀딩에 등록하지 않은 가게입니다`)
                });
                return;
            }

            // 가게 펀딩 정보 가져오기
            const fundingQuery = `SELECT * FROM ${table} WHERE user_idx = ? AND store_idx = ?`;
            const fundingResult = await pool.queryParam_Arr(fundingQuery, [userIdx, storeIdx]);

            if (!fundingResult) {
                resolve({
                    code : statusCode.INTERNAL_SERVER_ERROR,
                    json : authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
                });
                return;
            }
            else {
                const statusQuery = `SELECT fund_status FROM ${storeFundTable} WHERE store_idx = ?`;
                const statusResult = await pool.queryParam_Arr(statusQuery, [storeIdx]);

                if (!statusResult) {
                    resolve({
                        code : statusCode.INTERNAL_SERVER_ERROR,
                        json : authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
                    });
                    return;
                }

                if (statusResult[0].fund_status != 0) {
                    resolve({
                        code : statusCode.BAD_REQUEST,
                        json : authUtil.successFalse(statusCode.BAD_REQUEST, `이미 마감된 펀딩입니다`)
                    });
                    return;
                }

                const userQuery = `SELECT * FROM ${userTable} WHERE user_idx = ?`;
                const userResult = await pool.queryParam_Arr(userQuery, [userIdx]);
                console.log(userResult);
    
                console.log(userResult[0]);

                if (userResult[0] == undefined) {
                    resolve({
                        code : statusCode.BAD_REQUEST,
                        json : authUtil.successFalse(statusCode.BAD_REQUEST, `해당하지 않는 userIdx값입니다.`)
                    });
                    return;
                }

                if (!userResult) {
                    resolve({
                        code : statusCode.INTERNAL_SERVER_ERROR,
                        json : authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
                    });
                    return;
                }
                else {
                    // 암호화된 사용자의 결제 비밀번호 복호화한 후, 비교
                    const userHashedPayPassword = userResult[0].pay_password;
                    const userPayPasswordSalt = userResult[0].salt;
    
                    const cardNumberDecryptionResult = await decryptionModule.decryption(userHashedPayPassword, userPayPasswordSalt);

                    console.log(cardNumberDecryptionResult);

                    if (cardNumberDecryptionResult == payPassword) {
                        // 가게의 목표 금액 가져오기
                        const selectStoreGoalMoneyQuery = `SELECT goal_money FROM ${storeFundTable} WHERE store_idx = ?`;
                        const selectStoreGoalMoneyResult = await pool.queryParam_Arr(selectStoreGoalMoneyQuery, [storeIdx]);
                        
                        if (selectStoreGoalMoneyResult[0] == undefined) {
                            resolve({
                                code : statusCode.BAD_REQUEST,
                                json : authUtil.successFalse(statusCode.BAD_REQUEST, `아직 펀딩에 등록하지 않은 가게입니다`)
                            });
                            return;
                        }

                        const goalMoney = selectStoreGoalMoneyResult[0].goal_money;
                        console.log(goalMoney);

                        // 가게에 펀딩 된 금액들을 가져오기
                        const selectFundingMoneyQuery = `SELECT funding_money FROM ${table} WHERE store_idx = ?`;
                        const selectFundingMoneyResult = await pool.queryParam_Arr(selectFundingMoneyQuery, [storeIdx]);
                        console.log(selectFundingMoneyResult);

                        if (!selectStoreGoalMoneyResult || !selectFundingMoneyResult) {
                            resolve({
                                code : statusCode.INTERNAL_SERVER_ERROR,
                                json : authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
                            });
                            console.log(`DB ERROR`);
                            return;
                        }

                        // 가게에 펀딩된 금액 합계
                        var fundingMoneySum = 0;
                        for(var i=0; i< selectFundingMoneyResult.length; i++){
                            fundingMoneySum += selectFundingMoneyResult[i].funding_money;
                        }

                        // 펀딩할 때마다 펀딩 성공 여부를 체크
                        if (goalMoney <= fundingMoneySum) { 
                                const fund_status = 1;
                                // 펀딩 성공 업데이트
                                const updateStoreFundInfoQuery = `UPDATE ${storeFundTable} SET fund_status = ? WHERE store_idx = ?`;
                                const updateStoreFundInfoResult = await pool.queryParam_Arr(updateStoreFundInfoQuery, [fund_status, storeIdx]);
                                if (!updateStoreFundInfoResult) {
                                    resolve({
                                        code : statusCode.INTERNAL_SERVER_ERROR,
                                        json : authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
                                    });
                                    console.log(`update error`);
                                    return;
                                }
                            }

                        // 펀딩 올렸을 때 시간 가져오기
                        const date = Date.now();
                        const fundingTime = moment(date).format('YYYY-MM-DD HH:mm:ss');
                        
                        //펀딩하기
                        const createFundQuery = `INSERT INTO ${table}(user_idx, store_idx, funding_money, funding_time) VALUES(?, ?, ?, ?)`;
                        const createFundResult = await pool.queryParam_Arr(createFundQuery, [userIdx, storeIdx, fundingMoney, fundingTime]);
                        if (!createFundResult) {
                            resolve({
                                code : statusCode.INTERNAL_SERVER_ERROR,
                                json : authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
                            });
                            console.log(`FUND DB ERROR`);
                            return;
                        }

                        // 투자 성공하면 store_fund 테이블에서 해당 store_idx의 contributer_count +1
                        const getContributerQuery = `SELECT contributer_count FROM ${storeFundTable} WHERE store_idx = ?`;
                        const getContributerResult = await pool.queryParam_Arr(getContributerQuery, [storeIdx]);

                        if (!getContributerResult) {
                            resolve({
                                code : statusCode.INTERNAL_SERVER_ERROR,
                                json : authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
                            });
                            console.log(`FUND DB ERROR`);
                            return;
                        }

                        const contributer = getContributerResult[0].contributer_count;

                        const plusContributerCountQuery = `UPDATE ${storeFundTable} SET contributer_count = ? WHERE store_idx = ?`;
                        const plusContributerCountResult = await pool.queryParam_Arr(plusContributerCountQuery, [contributer + 1, storeIdx]);

                        if (!plusContributerCountResult) {
                            resolve({
                                code : statusCode.INTERNAL_SERVER_ERROR,
                                json : authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
                            });
                            console.log(`FUND DB ERROR`);
                            return;
                        }
            
                        resolve({
                            code : statusCode.OK,
                            json : authUtil.successTrue(statusCode.OK, responseMessage.FUNDING_SUCCESS)
                        });
                    }
                    else {
                        resolve({
                            code : statusCode.UNAUTHORIZED,
                            json : authUtil.successTrue(statusCode.UNAUTHORIZED, responseMessage.MISS_MATCH_PASSWORD)
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
                    json : authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
                });
                return;
            }

            resolve({
                code : statusCode.OK,
                json : authUtil.successTrue(statusCode.OK, responseMessage.X_READ_ALL_SUCCESS(THIS_LOG), getFundListResult)
            });
        });
    },

    read: (userIdx) => {
        return new Promise(async (resolve, reject) => {
            const userQuery = `SELECT user_idx FROM user WHERE user_idx = ?`;
            const getUserQuery = await pool.queryParam_Arr(userQuery, [userIdx]);

            /**
             * user_idx가 user 디비에 없는 값일 때
             */
            if (getUserQuery[0] == undefined) {
                resolve({
                    code : statusCode.BAD_REQUEST,
                    json : authUtil.successFalse(statusCode.BAD_REQUEST, `해당하지 않는 userIdx값입니다.`)
                });
                return;
            }

            const getMyFundListQuery = `SELECT * FROM ${table} WHERE user_idx = ? ORDER BY funding_time DESC`; 
            const getMyFundListResult = await pool.queryParam_Arr(getMyFundListQuery, [userIdx]);

            if (!getMyFundListResult) {
                resolve({
                    code : statusCode.INTERNAL_SERVER_ERROR,
                    json : authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
                });
                return;
            }

            resolve({
                code : statusCode.OK,
                json : authUtil.successTrue(statusCode.OK, responseMessage.X_READ_SUCCESS(THIS_LOG), getMyFundListResult)
            });
        });
    },

    readTimeline: (storeIdx) => {
        return new Promise(async (resolve, reject) => {
            const getTimelineQuery = 
                `SELECT u.nickname, f.* 
                FROM ${table} AS f JOIN ${userTable} AS u ON u.user_idx = f.user_idx 
                WHERE f.store_idx = ${storeIdx}
                ORDER BY f.funding_time DESC LIMIT 4`;
            
            const getTimelineResult = await pool.queryParam_None(getTimelineQuery);

            for(let i = 0; i<getTimelineResult.length;i++){
                getTimelineResult[i].funding_time = moment(getTimelineResult[i].funding_time).format("YYYY-MM-DD HH:MM:SS")
            }

            if (!getTimelineResult) {
                resolve({
                    code : statusCode.INTERNAL_SERVER_ERROR,
                    json : authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
                });
                return;
            }

            resolve({
                code : statusCode.OK,
                json : authUtil.successTrue(statusCode.OK, responseMessage.X_READ_SUCCESS(THIS_LOG), getTimelineResult)
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
                    json : authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
                });
                return;
            }

            if (deleteFundingResult[0] == undefined) {
                resolve({
                    code : statusCode.BAD_REQUEST,
                    json : authUtil.successFalse(statusCode.BAD_REQUEST, `존재하지 않는 펀딩입니다.`)
                });
                return;
            }

            resolve({
                code : statusCode.OK,
                json : authUtil.successTrue(statusCode.OK, responseMessage.X_DELETE_SUCCESS(THIS_LOG))
            });
        });
    }
};

module.exports = funding;