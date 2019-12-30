const statusCode = require('../module/utils/statusCode');
const responseMessage = require('../module/utils/responseMessage');
const authUtil = require('../module/utils/authUtil');
const pool = require('../module/db/pool');
const {isAtLimit, getMoneyLimit150, getMoneyLimit175, getMoneyLimit200, getRefundPerOfPer, getFundingBenefits, getCurGoalPer} = require('../module/calculate');
const moment = require('moment');

const storeInfoTable = `store_info`;
const menuTable = `menu`;
const userTable = `user`;
const storeFundTable = `store_fund`;
const THIS_LOG = '가게 정보';

/**
 * storeInfo는 update가 없어도 된다.
 */
const storeInfo = {
    create: (name, telNumber, latitude, longitude, address, businessHours, breaktime, holiday, thumbnail, wifiSSID, menu) => {
        return new Promise(async (resolve, reject) => {
            const createStoreQuery = `INSERT INTO ${storeInfoTable}(name, tel_number, location_latitude, location_longitude, address, business_hours, breaktime, holiday, thumbnail, wifi_SSID) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            const createStoreResult = await pool.queryParam_Arr(createStoreQuery, [name, telNumber, latitude, longitude, address, businessHours, breaktime, holiday, thumbnail, wifiSSID]);

            console.log(createStoreResult);

            // 클라이언트에서 menu는 배열로 넘어온다.
            for (const i in menu) {
                const currentMenu = menu[i];
                const currentMenuName = currentMenu.menuName;
                const currentMenuPrice = currentMenu.menuPrice;

                const createMenuQuery = `INSERT INTO ${menuTable}(store_idx, menu_name, menu_price) VALUES(?, ?, ?)`;
                const createMenuResult = await pool.queryParam_Arr(createMenuQuery, [createStoreResult.insertId, currentMenuName, currentMenuPrice]);

                if (!createMenuResult) {
                    resolve({
                        code : statusCode.INTERNAL_SERVER_ERROR,
                        json : authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
                    });
                    return;
                }
            }

            if (!createStoreResult) {
                resolve({
                    code : statusCode.INTERNAL_SERVER_ERROR,
                    json : authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
                });
                return;
            }

            resolve({
                code : statusCode.OK,
                json : authUtil.successTrue(statusCode.OK, responseMessage.X_CREATE_SUCCESS(THIS_LOG), createStoreResult.insertId)
            });
        });
    },

    readAll: () => {
        return new Promise(async (resolve, reject) => {
            const getStoreListQuery = `SELECT * FROM ${storeInfoTable}`;
            const getStoreListResult = await pool.queryParam_None(getStoreListQuery);

            if (!getStoreListResult) {
                resolve({
                    code : statusCode.INTERNAL_SERVER_ERROR,
                    json : authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
                });
                return;
            }
            
            const storeListResult = new Array();

            for(const i in getStoreListResult) {
                const currentStoreIdx = getStoreListResult[i].store_idx;
                
                const getStoreMenuQuery = `SELECT menu_name, menu_price FROM ${menuTable} WHERE store_idx = ?`;
                const getStoreMenuResult = await pool.queryParam_Arr(getStoreMenuQuery, [currentStoreIdx]);

                storeListResult[i] = getStoreListResult[i];
                storeListResult[i].menu = getStoreMenuResult;
            }

            console.log(storeListResult);

            resolve({
                code : statusCode.OK,
                json : authUtil.successTrue(statusCode.OK, responseMessage.X_READ_ALL_SUCCESS(THIS_LOG), storeListResult)
            });
        });
    },

    readStoreInfo : (storeIdx) => {
        return new Promise(async (resolve, reject) => {
            // 식당 정보 가져오기
            const getOneStoreQuery = `SELECT store_idx, name, business_hours, breaktime, holiday, thumbnail, address FROM ${storeInfoTable} WHERE store_idx = ?`;
            const getOneStoreResult = await pool.queryParam_Arr(getOneStoreQuery, [storeIdx]);

            if (getOneStoreResult[0] == undefined) {
                resolve({
                    code : statusCode.BAD_REQUEST,
                    json : authUtil.successFalse(statusCode.BAD_REQUEST, responseMessage.NO_INDEX)
                });
                return;
            }

            // 식당 메뉴 가져오기 
            const getStoreMenuQuery = `SELECT menu_name, menu_price FROM ${menuTable} WHERE store_idx = ?`;
            const getStoreMenuResult = await pool.queryParam_Arr(getStoreMenuQuery, [storeIdx]);

            // 식당 펀딩 정보 가져오기 
            const getStoreFundQuery = `SELECT goal_money, due_date, margin_percent, regular_money, current_sales, fund_status FROM ${storeFundTable} WHERE store_idx = ?`;
            const getStoreFundResult = await pool.queryParam_Arr(getStoreFundQuery, [storeIdx]);
            
            // 식당 펀딩 정보 가져오기 
            const getFundingMoneyQuery = `SELECT funding_money FROM funding WHERE store_idx = ?`;
            const getFundingMoneyResult = await pool.queryParam_Arr(getFundingMoneyQuery, [storeIdx]);
            
            if (!getStoreMenuResult || !getStoreFundResult || !getFundingMoneyResult) {
                resolve({
                    code : statusCode.INTERNAL_SERVER_ERROR,
                    json : authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
                });
                return;
            }
            // 가게에 펀딩된 금액 합계
            var fundingMoneySum = 0;
            for (var i = 0; i < getFundingMoneyResult.length; i++) {
                fundingMoneySum += getFundingMoneyResult[i].funding_money;
            }
            
            const result = getStoreFundResult[0];
            const marginPercent = result.margin_percent;
            const goalMoney = result.goal_money;
            const regularMoney = result.regular_money;
            const fundingBenefits = getFundingBenefits(marginPercent,goalMoney,regularMoney); // 투자이윤 
            console.log(`투자이윤`);
            console.log(fundingBenefits);
            const moneyLimit150 = getMoneyLimit150(fundingBenefits); // C (150% 마감금액)
            const moneyLimit175 = getMoneyLimit175(fundingBenefits); // B (175% 마감금액)
            const moneyLimit200 = getMoneyLimit200(fundingBenefits); // A (200% 마감금액)
            console.log(`150`);
            console.log(moneyLimit150);
            console.log(`175`);
            console.log(moneyLimit175);
            console.log(`200`);
            console.log(moneyLimit200);
            console.log(fundingMoneySum);
            let refundPercent = 200; 
            let refundPerOfPer = getRefundPerOfPer(moneyLimit200, fundingMoneySum);
            if(isAtLimit(moneyLimit200,fundingMoneySum)){
                refundPercent = 175;
                refundPerOfPer = getRefundPerOfPer(moneyLimit175, fundingMoneySum);
            }
            if(isAtLimit(moneyLimit175,fundingMoneySum)) {
                refundPercent = 150;
                refundPerOfPer = getRefundPerOfPer(moneyLimit150, fundingMoneySum);
            }
            console.log(`환급률`);
            console.log(refundPercent);
            console.log(`환급률의 퍼센트`);
            console.log(refundPerOfPer);
            const now = moment(Date.now());
            const dueDate = moment(getStoreFundResult[0].due_date);
            const leftDay = parseInt(moment.duration(dueDate.diff(now)).asDays());
            console.log(`남은 기간`);
            console.log(leftDay);
            console.log(`커런트세일즈`);
            console.log(getStoreFundResult[0].current_sales);
            console.log(getStoreFundResult[0].goal_money);
            const currentGoalPercent = parseInt(getCurGoalPer(getStoreFundResult[0].current_sales,getStoreFundResult[0].goal_money));
            if (!getOneStoreResult || !getStoreMenuResult || !getStoreFundResult) {
                resolve({
                    code : statusCode.INTERNAL_SERVER_ERROR,
                    json : authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
                });
                return;
            }

            // 클라이언트에 보낼 결과 값
            const storeResult = getOneStoreResult[0];
            storeResult.menu = getStoreMenuResult;
            storeResult.goal_money = goalMoney;
            storeResult.current_goal_percent = currentGoalPercent;
            storeResult.refund_percent = refundPercent;
            storeResult.refund_percent_of_percent = parseInt(refundPerOfPer);
            storeResult.left_day = leftDay; 
            storeResult.due_date = dueDate.format('YYYY-MM-DD HH:mm');
            storeResult.fund_status = getStoreFundResult[0].fund_status;
            
            console.log(storeResult);

            resolve({
                code : statusCode.OK,
                json : authUtil.successTrue(statusCode.OK, responseMessage.X_READ_SUCCESS(THIS_LOG), storeResult)
            });
        });
    },

    read: (storeIdx) => {
        return new Promise(async (resolve, reject) => {
            const getOneStoreQuery = `SELECT * FROM ${storeInfoTable} WHERE store_idx = ?`;
            const getOneStoreResult = await pool.queryParam_Arr(getOneStoreQuery, [storeIdx]);

            const getStoreMenuQuery = `SELECT menu_name, menu_price FROM ${menuTable} WHERE store_idx = ?`;
            const getStoreMenuResult = await pool.queryParam_Arr(getStoreMenuQuery, [storeIdx]);

            if (!getOneStoreResult || !getStoreMenuResult) {
                resolve({
                    code : statusCode.INTERNAL_SERVER_ERROR,
                    json : authUtil.successFalse(responseMessage.INTERNAL_SERVER_ERROR)
                });
                return;
            }

            const storeResult = getOneStoreResult[0];
            storeResult.menu = getStoreMenuResult;

            resolve({
                code : statusCode.OK,
                json : authUtil.successTrue(statusCode.OK, responseMessage.X_READ_SUCCESS(THIS_LOG), storeResult)
            });
        });
    },

    delete: (storeIdx) => {
        return new Promise(async (resolve, reject) => {
            const storeIdxQuery = `SELECT * FROM store_info WHERE store_idx = ?`;
            const storeIdxResult = await pool.queryParam_Arr(storeIdxQuery, [storeIdx]);

            if (!storeIdxResult) {
                resolve({
                    code : statusCode.INTERNAL_SERVER_ERROR,
                    json : authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
                });
                return;
            }
            if (storeIdxResult[0] == undefined) {
                resolve({
                    code : statusCode.BAD_REQUEST,
                    json : authUtil.successFalse(statusCode.BAD_REQUEST, responseMessage.NO_STORE)
                });
                return;
            }
            
            const deleteStoreQuery = `DELETE FROM ${storeInfoTable} WHERE store_idx = ?`;
            const deleteStoreResult = await pool.queryParam_Arr(deleteStoreQuery, [storeIdx]);

            if (!deleteStoreResult) {
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

module.exports = storeInfo;

