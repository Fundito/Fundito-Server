const statusCode = require('../module/utils/statusCode');
const responseMessage = require('../module/utils/responseMessage');
const authUtil = require('../module/utils/authUtil');
const pool = require('../module/db/pool');
const decryptionModule = require('../module/cryption/decryptionModule');

const moment = require('moment');

const table = `funding`;
const storeFundTable = `store_fund`;
const userTable = `user`;
const THIS_LOG = `펀딩 정보`;
const {getMoneyLimit150, isAtLimit, getFundingBenefits, getRewardMoney, getProfit} = require(`../module/calculate`);
const fundStatus = require(`../module/utils/fundStatus`);
const storeInfo = require(`../model/StoreInfo`);

const funding = {
    create: (userIdx, payPassword, storeIdx, fundingMoney) => {
        return new Promise(async (resolve, reject) => {
            // 사용자 정보 가져오기
            const userQuery = `SELECT * FROM ${userTable} WHERE user_idx = ?`;
            const userResult = await pool.queryParam_Arr(userQuery, [userIdx]);

            if (userResult[0] == undefined) {
                resolve({
                    code : statusCode.DB_ERROR,
                    json : authUtil.successFalse(statusCode.DB_ERROR, `해당하지 않는 userIdx값입니다.`)
                });
                return;
            }

            // 펀디토 머니가 부족할 때
            if (userResult[0].point < fundingMoney) {
                resolve({
                    code : statusCode.UNAUTHORIZED,
                    json : authUtil.successFalse(statusCode.UNAUTHORIZED, responseMessage.USER_MONEY_LESS_THAN_FUNDING_MONEY)
                });
                return;
            }


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
                    code : statusCode.DB_ERROR,
                    json : authUtil.successFalse(statusCode.DB_ERROR, responseMessage.DB_ERROR)
                });
                return;
            }
            if (storeFundResult[0] === undefined) {
                resolve({
                    code : statusCode.DB_ERROR,
                    json : authUtil.successFalse(statusCode.DB_ERROR, `펀딩에 등록하지 않은 가게입니다`)
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

                    if (cardNumberDecryptionResult == payPassword) {
                        // 펀딩 올렸을 때 시간 가져오기
                        const date = Date.now();
                        const fundingTime = moment(date).format('YYYY-MM-DD HH:mm:ss');

                        var refundPercent;
                        await storeInfo.readStoreInfo(userIdx, storeIdx).then(({data,json}) => 
                            refundPercent = json.data.refund_percent);
                        const rewardMoney = getRewardMoney(fundingMoney,refundPercent);
                        const profitMoney = getProfit(fundingMoney, refundPercent);
                        //펀딩하기
                        const createFundQuery = `INSERT INTO ${table}(user_idx, store_idx, funding_money, refund_percent, reward_money, profit_money, funding_time) VALUES(?, ?, ?, ?, ?, ?, ?)`;
                        const createFundResult = await pool.queryParam_Arr(createFundQuery, [userIdx, storeIdx, fundingMoney, refundPercent, rewardMoney, profitMoney, fundingTime]);
                        if (!createFundResult) {
                            resolve({
                                code : statusCode.INTERNAL_SERVER_ERROR,
                                json : authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
                            });
                            return;
                        }

                        // 펀딩 성공 후 150% 투자 마감 확인
                        // 가게 펀딩 정보 가져오기
                        const selectStoreFundInfoQuery = `SELECT * FROM ${storeFundTable} WHERE store_idx = ?`;
                        const selectStoreFundInfoResult = await pool.queryParam_Arr(selectStoreFundInfoQuery,[storeIdx]);
                        const result = selectStoreFundInfoResult[0];

                        if (!selectStoreFundInfoResult) {
                            resolve({
                                code: statusCode.INTERNAL_SERVER_ERROR,
                                json: authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
                            });
                            return;
                        }
                        
                        // 가게에 펀딩 된 금액들을 가져오기
                        const selectFundingMoneyQuery = `SELECT funding_money FROM ${table} WHERE store_idx = ?`;
                        const selectFundingMoneyResult = await pool.queryParam_Arr(selectFundingMoneyQuery, [storeIdx]);

                        if (!selectFundingMoneyResult) {
                            resolve({
                                code: statusCode.INTERNAL_SERVER_ERROR,
                                json: authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
                            });
                            return;
                        }

                        // 가게에 펀딩된 금액 합계
                        var fundingMoneySum = 0;
                        for(var i=0; i< selectFundingMoneyResult.length; i++){
                            fundingMoneySum += selectFundingMoneyResult[i].funding_money;
                        }
                        const marginPercent = result.margin_percent;
                        const goalSales = result.goal_sales;
                        const regularSales = result.regular_sales;
                        const fundingBenefits = getFundingBenefits(marginPercent,goalSales,regularSales); // 투자이윤 
                        const moneyLimit150= getMoneyLimit150(fundingBenefits); // C (150% 마감금액)

                        if (isAtLimit(moneyLimit150,fundingMoneySum)){
                            // fund_status 를 3으로 변경 
                            const fund_status = fundStatus.Disabled;
                            const updateStoreFundInfoQuery = `UPDATE ${storeFundTable} SET fund_status = ? WHERE store_idx = ?`;
                            const updateStoreFundInfoResult = await pool.queryParam_Arr(updateStoreFundInfoQuery, [fund_status, storeIdx]);
                            if (!updateStoreFundInfoResult) {
                                resolve({
                                    code: statusCode.INTERNAL_SERVER_ERROR,
                                    json: authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
                                });
                                return;
                            }
                        }

                        // 투자 성공하면 store_fund 테이블에서 해당 store_idx의 contributer_count +1
                        const getContributerQuery = `SELECT contributer_count FROM ${storeFundTable} WHERE store_idx = ?`;
                        const getContributerResult = await pool.queryParam_Arr(getContributerQuery, [storeIdx]);

                        if (!getContributerResult) {
                            resolve({
                                code : statusCode.INTERNAL_SERVER_ERROR,
                                json : authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
                            });
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
                            return;
                        }

                        const funditoMoney = userResult[0].point - fundingMoney;
                        const minusFundingMoneyQuery = `UPDATE user SET point = ? WHERE user_idx = ?`;
                        const minusFundingMoneyResult = await pool.queryParam_Arr(minusFundingMoneyQuery, [funditoMoney, userIdx]);

                        if (!minusFundingMoneyResult) {
                            resolve({
                                code : statusCode.INTERNAL_SERVER_ERROR,
                                json : authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
                            });
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
                            json : authUtil.successFalse(statusCode.UNAUTHORIZED, responseMessage.MISS_MATCH_PASSWORD)
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

    /**
     * 사용자의 투자 음식점 리스트 받아오기
     * @author ChoSooMin
     */
    readUserFundingList : (userIdx, fundStatus) => {
        return new Promise(async (resolve, reject) => {
            /**
             * userIdx가 잘못 되었을 경우
             */
            const userIdxQuery = `SELECT * FROM ${userTable} WHERE user_idx = ?`;
            const userIdxResult = await pool.queryParam_Arr(userIdxQuery, [userIdx]);


            const result = new Array();

            if (!userIdxResult) {
                resolve({
                    code : statusCode.INTERNAL_SERVER_ERROR,
                    json : authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
                });
                return;
            }
            if (userIdxResult[0] == undefined) {
                resolve({
                    code : statusCode.BAD_REQUEST,
                    json : authUtil.successFalse(statusCode.BAD_REQUEST, `해당하지 않는 userIdx값입니다.`)
                });
                return;
            }

            // userIdx=7은 아무것도 안나오고, 12는 나옴
            const userFundingQuery = `SELECT * FROM ${table} WHERE user_idx = ? ORDER BY funding_time DESC`;
            const userFundingResult = await pool.queryParam_Arr(userFundingQuery, [userIdx]);

            if (!userFundingResult) {
                resolve({
                    code : statusCode.INTERNAL_SERVER_ERROR,
                    json : authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
                });
                return;
            }

            // funding 테이블에 사용자 idx에 해당하는 데이터가 아무것도 없을 때 (사용자가 펀딩 안함)
            if (userFundingResult[0] == undefined) {
                resolve({
                    code : statusCode.OK,
                    json : authUtil.successTrue(statusCode.OK, `투자 음식점`, result)
                });
            } 

            /**
             * 1. funding 테이블에서 사용자 idx에 해당하는 데이터 값들을 받아옴
             * 2. 1에서 받아온 데이터들을 가지고, store_fund 테이블에서 비교 후, fund_status 들을 가져옴
             * 3. fund_status들에 따라 store_info 테이블에서 데이터 가져옴
             */
            const joinQuery = `SELECT store_info.name, funding.store_idx, store_fund.due_date, store_fund.goal_sales, store_fund.current_sales, funding.funding_money, funding.reward_money FROM funding JOIN store_fund ON funding.store_idx = store_fund.store_idx JOIN store_info ON funding.store_idx = store_info.store_idx WHERE user_idx = ? AND fund_status = ?`;
            const joinResult = await pool.queryParam_Arr(joinQuery, [userIdx, fundStatus]);

            if (!joinResult) {
                resolve({
                    code : statusCode.INTERNAL_SERVER_ERROR,
                    json : authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
                });
                return;
            }

            const fundingTime = moment();

            // const message = ``;
            if (fundStatus == 0) {
                for(const joinData of joinResult) {
                    const storeIdx = joinData.store_idx;
                    const storeName = joinData.name;
                    const dueDate = moment(joinData.due_date);

                    // 남은 시간 계산
                    const remainingTime = moment.duration(dueDate.diff(fundingTime));
                    var remainingDays = remainingTime.asDays();

                    // 진행률 계산
                    const goalSales = joinData.goal_sales;
                    const currentSales = joinData.current_sales;

                    const progressPercent = currentSales / goalSales * 100;

                    const clientResult = {
                        "storeIdx" : storeIdx,
                        "storeName" : joinData.name,
                        "remainingDays" : parseInt(remainingDays),
                        "progressPercent" : progressPercent
                    };
                    result.push(clientResult)
                }

                resolve({
                    code : statusCode.OK,
                    json : authUtil.successTrue(statusCode.OK, `투자 중인 음식점 조회`, result)
                });
            }
            else { // 투자 완료된 음식점
                for(const joinData of joinResult) {
                    const storeIdx = joinData.store_idx;
                    const storeName = joinData.name;
                    const dueDate = joinData.due_date;
                    const fundingMoney = joinData.funding_money;
                    const rewardMoney = joinData.reward_money;
                    const refundMoney = fundingMoney + rewardMoney;

                    const clientResult = {
                        "storeIdx" : storeIdx,
                        "storeName" : storeName,
                        "dueDate" : dueDate,
                        "fundingMoney" : fundingMoney,
                        "refundMoney" : refundMoney
                    };
                    result.push(clientResult)
                }

                resolve({
                    code : statusCode.OK,
                    json : authUtil.successTrue(statusCode.OK, `투자 완료된 음식점 조회`, result)
                });
                // message = `투자 완료된 음식점 조회`;
            }
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

            if (!getTimelineResult) {
                resolve({
                    code : statusCode.INTERNAL_SERVER_ERROR,
                    json : authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
                });
                return;
            }
            
            for(let i = 0; i<getTimelineResult.length;i++){
                getTimelineResult[i].funding_time = moment(getTimelineResult[i].funding_time).format("YYYY-MM-DD HH:MM:SS")
            }

            resolve({
                code : statusCode.OK,
                json : authUtil.successTrue(statusCode.OK, responseMessage.X_READ_SUCCESS(THIS_LOG), getTimelineResult)
            });
        });
    }
};

module.exports = funding;