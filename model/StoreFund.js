const statusCode = require('../module/utils/statusCode');
const responseMessage = require('../module/utils/responseMessage');
const authUtil = require('../module/utils/authUtil');
const pool = require('../module/db/pool');
const fundStatus = require(`../module/utils/fundStatus`);

const moment = require('moment');

const table = `store_fund`;
const THIS_LOG = `펀딩 정보`;

const storeFund = {
    create: (storeIdx, marginPercent, regularMoney, goalMoney) => {
        return new Promise(async (resolve, reject) => {
            const storeIdxQuery = `SELECT * FROM store_info WHERE store_idx = ?`;
            const storeIdxResult = await pool.queryParam_Arr(storeIdxQuery, [storeIdx]);

            /**
             * 예외 처리
             */
            if (!storeIdxResult) {
                resolve({
                    code : statusCode.INTERNAL_SERVER_ERROR,
                    json : authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
                });
                return;
            }
            if (storeIdxResult[0] == undefined) {
                resolve({
                    code : statusCode.DB_ERROR,
                    json : authUtil.successFalse(statusCode.DB_ERROR, `존재하지 않는 가게입니다`)
                });
                return;
            }


            /** [TODO]: remaining_days 계산하기 */
            // 이미 펀드 정보가 삽입된 가게 인덱스 조회
            const selectStoreIdxQuery = 'SELECT store_idx FROM store_fund WHERE store_idx = ?';
            const selectStoreIdxResult = await pool.queryParam_Arr(selectStoreIdxQuery, [storeIdx]);
            if (selectStoreIdxResult[0] != undefined) {
                resolve({
                    code : statusCode.BAD_REQUEST,
                    json : authUtil.successFalse(statusCode.BAD_REQUEST, `이미 펀드 정보가 삽입된 가게입니다`)
                });
                return;
            }
            
            // 가게의 펀드 정보(기존 고객 수, 마진율, 등록날짜, 마감기한, 목표매출, 펀딩인원, 진행상태)를 삽입
            const insertStoreFundInfoQuery = 'INSERT INTO store_fund(store_idx, margin_percent, register_time, due_date, regular_money, goal_money) VALUES (?, ?, ?, ?, ?, ?)';
            
            // registerTime 구하기
            const date = Date.now();
            console.log(date);
            const registerTime = moment(date).format('YYYY-MM-DD HH:mm:ss');
            console.log(registerTime);

            // dueDate 구하기
            const d = new Date();
            const dueDate = moment(d.getTime()).add('1', 'M').format('YYYY-MM-DD HH:mm:ss');
            console.log(dueDate);

            const insertStoreFundInfoResult = await pool.queryParam_Arr(insertStoreFundInfoQuery, [storeIdx, marginPercent, registerTime, dueDate, regularMoney, goalMoney]);
            console.log(insertStoreFundInfoResult);
            if (!insertStoreFundInfoResult) {
                resolve({
                    code : statusCode.BAD_REQUEST,
                    json : authUtil.successFalse(statusCode.BAD_REQUEST, responseMessage.STORE_FUND_INSERT_FAILED)
                });
                return;
            }

            resolve({
                code : statusCode.OK,
                json : authUtil.successTrue(statusCode.OK, responseMessage.STORE_FUND_INSERT_SUCCESS)
            });
        });
    },

    readAll: () => {
        return new Promise(async (resolve, reject) => {
            const selectStoreFundListQuery = `SELECT * FROM ${table}`;
            const selectStoreFundListResult = await pool.queryParam_None(selectStoreFundListQuery);

            if (!selectStoreFundListResult) {
                resolve({
                    code : statusCode.INTERNAL_SERVER_ERROR,
                    json : authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
                });
                return;
            }

            resolve({
                code : statusCode.OK,
                json : authUtil.successTrue(statusCode.OK, responseMessage.X_READ_ALL_SUCCESS(THIS_LOG), selectStoreFundListResult)
            });
        });
    },

    checkDueDate: () => {
        return new Promise(async (resolve, reject) => {
            const selectStoreFundInfoQuery = `SELECT * FROM ${table}`;
            const selectStoreFundInfoResult = await pool.queryParam_None(selectStoreFundInfoQuery);

            if (!selectStoreFundInfoResult) {
                resolve({
                    code: statusCode.INTERNAL_SERVER_ERROR,
                    json: authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
                });
                console.log(`select StoreFund Info ERROR`);
                return;
            }

            for (var idx = 0; idx < selectStoreFundInfoResult.length; idx++) {
                /** [TODO] remaining_days 계산하기 */
                const result = selectStoreFundInfoResult[idx];
                const date = Date.now();
                const nowDate = moment(date).format('YYYY-MM-DD');
                const dueDate = moment(result.due_date).format('YYYY-MM-DD');

                if (nowDate >= dueDate) { // 펀딩기간 끝 
                // 가게의 목표 금액 가져오기
                const selectStoreGoalMoneyQuery = `SELECT goal_money FROM ${table} WHERE store_idx = ?`;
                const selectStoreGoalMoneyResult = await pool.queryParam_Arr(selectStoreGoalMoneyQuery, [result.store_idx]);

                if (selectStoreGoalMoneyResult[0] == undefined) {
                    resolve({
                        code: statusCode.BAD_REQUEST,
                        json: authUtil.successFalse(statusCode.BAD_REQUEST, `아직 펀딩에 등록하지 않은 가게입니다`)
                    });
                    return;
                }
                // 가게에 펀딩 된 금액들을 가져오기
                const selectCurrentSalesQuery = `SELECT current_sales FROM ${table} WHERE store_idx = ?`;
                const selectCurrentSalesResult = await pool.queryParam_Arr(selectCurrentSalesQuery, [result.store_idx]);
                console.log(selectCurrentSalesResult);

                if (!selectStoreGoalMoneyResult || !selectCurrentSalesResult) {
                    resolve({
                        code: statusCode.INTERNAL_SERVER_ERROR,
                        json: authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
                    });
                    console.log(`DB ERROR`);
                    return;
                }

                const goalMoney = selectStoreGoalMoneyResult[0].goal_money;
                console.log(goalMoney);
                const currentSales = selectCurrentSalesResult[0].current_sales;
                console.log(currentSales)

                // 펀딩 성공 여부를 체크
                if (goalMoney <= currentSales) {
                    const fundStatus = fundStatus.Success;
                    // 펀딩 성공 업데이트
                    const updateStoreFundInfoQuery = `UPDATE ${table} SET fund_status = ? WHERE store_idx = ?`;
                    const updateStoreFundInfoResult = await pool.queryParam_Arr(updateStoreFundInfoQuery, [fundStatus, result.store_idx]);
                    if (!updateStoreFundInfoResult) {
                        resolve({
                            code: statusCode.INTERNAL_SERVER_ERROR,
                            json: authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
                        });
                        console.log(`update error`);
                        return;
                    }
                } else {
                    const fundStatus = fundStatus.Fail;
                    
                    const updateStoreFundInfoQuery = `UPDATE ${table} SET fund_status = ? WHERE store_idx = ?`;
                    const updateStoreFundInfoResult = await pool.queryParam_Arr(updateStoreFundInfoQuery, [fundStatus, result.store_idx]);

                    if (!updateStoreFundInfoResult) {
                        resolve({
                            code: statusCode.INTERNAL_SERVER_ERROR,
                            json: authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
                        });
                        console.log(`update StoreFund Info ERROR`);
                        return;
                    }
                }
            }
        }
        });
    },
    
    read: (storeIdx) => {
        return new Promise(async (resolve, reject) => {
            const selectStoreFundInfoQuery = `SELECT * FROM ${table} WHERE store_idx = ?`;
            const selectStoreFundInfoResult = await pool.queryParam_Arr(selectStoreFundInfoQuery, [storeIdx])

            if (!selectStoreFundInfoResult) {
                resolve({
                    code: statusCode.INTERNAL_SERVER_ERROR,
                    json: authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
                });
                return;
            }

            if (selectStoreFundInfoResult[0] == undefined) {
                resolve({
                    code : statusCode.BAD_REQUEST,
                    json : authUtil.successFalse(statusCode.BAD_REQUEST, `존재하지 않는 가게 펀드 정보`)
                });
                return;
            }

            resolve({
                code: statusCode.OK,
                json: authUtil.successTrue(statusCode.OK, responseMessage.X_READ_SUCCESS(THIS_LOG), selectStoreFundInfoResult)
            });
        });
    },
    update: (storeIdx, customerCount, marginPercent, goalMoney, remaining_days, fund_status ) => {
        return new Promise(async (resolve, reject) => {
            const storeIdxQuery = `SELECT * FROM ${table} WHERE store_idx = ?`;
            const storeIdxResult = await pool.queryParam_Arr(storeIdxQuery, [storeIdx]);

            if (storeIdxResult[0] == undefined) {
                resolve({
                    code : statusCode.BAD_REQUEST,
                    json : authUtil.successFalse(statusCode.BAD_REQUEST, `존재하지 않는 가게 펀드 정보(잘못된 인덱스)`)
                });
                return;
            }
            
            const updateStoreFundInfoQuery = `UPDATE ${table} SET customer_count = ?, margin_percent = ?, goal_money = ?, fund_status = ? WHERE store_idx = ?`;
            const updateStoreFundInfoResult = await pool.queryParam_Arr(updateStoreFundInfoQuery, [customerCount, marginPercent, goalMoney, fund_status, storeIdx]);

            if(!updateStoreFundInfoResult){
                resolve({
                    code : statusCode.INTERNAL_SERVER_ERROR,
                    json : authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
                });
                return;
            }

            resolve({
                code : statusCode.OK,
                json : authUtil.successTrue(statusCode.OK, responseMessage.X_UPDATE_SUCCESS(THIS_LOG))
            });
        });
    },

    delete: (storeIdx) => {
        return new Promise(async (resolve, reject) => {
            const storeIdxQuery = `SELECT * FROM ${table} WHERE store_idx = ?`;
            const storeIdxResult = await pool.queryParam_Arr(storeIdxQuery, [storeIdx]);

            if (storeIdxResult[0] == undefined) {
                resolve({
                    code : statusCode.BAD_REQUEST,
                    json : authUtil.successFalse(statusCode.BAD_REQUEST, `존재하지 않는 가게 펀드 정보(잘못된 인덱스)`)
                });
                return;
            }

            const deleteStoreFundQuery = `DELETE FROM ${table} WHERE store_idx = ?`;
            const deleteStoreFundResult = await pool.queryParam_Arr(deleteStoreFundQuery, [storeIdx]);

            if (!deleteStoreFundResult) {
                resolve({
                    code : statusCode.INTERNAL_SERVER_ERROR,
                    json : authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
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

module.exports = storeFund;