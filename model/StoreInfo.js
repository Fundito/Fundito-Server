const statusCode = require('../module/utils/statusCode');
const responseMessage = require('../module/utils/responseMessage');
const authUtil = require('../module/utils/authUtil');
const pool = require('../module/db/pool');
const {getMoneyLimit150, getMoneyLimit175, getMoneyLimit200, getRefundPerOfPer, getFundingBenefits, getCurGoalPer, getRefundPercent} = require('../module/calculate');
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

            resolve({
                code : statusCode.OK,
                json : authUtil.successTrue(statusCode.OK, responseMessage.X_READ_ALL_SUCCESS(THIS_LOG), storeListResult)
            });
        });
    },

    readStoreInfo : (userIdx, storeIdx) => {
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
            const getStoreFundQuery = `SELECT goal_sales, due_date, margin_percent, regular_sales, current_sales, fund_status FROM ${storeFundTable} WHERE store_idx = ?`;
            const getStoreFundResult = await pool.queryParam_Arr(getStoreFundQuery, [storeIdx]);
            
            // 식당 펀딩 정보 가져오기 
            const getFundingInfoQuery = `SELECT * FROM funding WHERE store_idx = ?`;
            var getFundingInfoResult = await pool.queryParam_Arr(getFundingInfoQuery, [storeIdx]);

            // 유저 네임 가져오기
            const getUserNameQuery = `SELECT name FROM user WHERE user_idx = ?`;
            const getUserNameResult = await pool.queryParam_Arr(getUserNameQuery, [userIdx]);
            
            if (!getStoreMenuResult || !getStoreFundResult || !getFundingInfoResult || !getUserNameResult) {
                resolve({
                    code : statusCode.INTERNAL_SERVER_ERROR,
                    json : authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
                });
                return;
            }
            // 가게에 펀딩된 금액 합계
            var fundingMoneySum = 0;
            for (var i = 0; i < getFundingInfoResult.length; i++) {
                fundingMoneySum += getFundingInfoResult[i].funding_money;
            }
            
            if (getStoreFundResult[0] == undefined || getUserNameResult[0] == undefined) {
                resolve({
                    code : statusCode.BAD_REQUEST,
                    json : authUtil.successFalse(statusCode.BAD_REQUEST, responseMessage.NO_INDEX)
                });
                return;
            }
            
            const result = getStoreFundResult[0];
            const marginPercent = result.margin_percent;
            const goalSales = result.goal_sales;
            const regularSales = result.regular_sales;
            const fundStatus = result.fund_status;
            const fundingBenefits = getFundingBenefits(marginPercent,goalSales,regularSales); // 투자이윤 
            const moneyLimit150 = getMoneyLimit150(fundingBenefits); // C (150% 마감금액)
            const moneyLimit175 = getMoneyLimit175(fundingBenefits); // B (175% 마감금액)
            console.log(`moneyLImit150`);
            console.log(moneyLimit150);
            const moneyLimit200 = getMoneyLimit200(fundingBenefits); // A (200% 마감금액)
            let refundPercent = getRefundPercent(moneyLimit150,moneyLimit175,moneyLimit200,fundingMoneySum); 

            let refundPerOfPer = getRefundPerOfPer(moneyLimit200, fundingMoneySum);
            if(refundPercent === 175) { refundPerOfPer = getRefundPerOfPer(moneyLimit175, fundingMoneySum); }
            if(refundPercent === 150) { console.log(`들옴`); refundPerOfPer = getRefundPerOfPer(moneyLimit150, fundingMoneySum); }
            
            const now = moment(Date.now());
            const dueDate = moment(getStoreFundResult[0].due_date);
            const leftDay = parseInt(moment.duration(dueDate.diff(now)).asDays());
            const currentGoalPercent = parseInt(getCurGoalPer(getStoreFundResult[0].current_sales,getStoreFundResult[0].goal_sales));
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
            storeResult.goal_sales = goalSales;
            storeResult.current_goal_percent = currentGoalPercent;
            storeResult.refund_percent = refundPercent;
            storeResult.refund_percent_of_percent = parseInt(refundPerOfPer);
            storeResult.left_day = leftDay; 
            storeResult.fund_status = fundStatus;
            storeResult.due_date = dueDate.format('YYYY-MM-DD HH:mm');
            /** [TODO] 펀딩에 user_idx값에 해당 되는거 다 더해서 보내기 */
            var fundingMoneySum = 0;
            var profitMoneySum = 0;
            var rewardMoneySum = 0;
            if(getFundingInfoResult[0]==undefined) {
                storeResult.funding = {};
            } else {
            for(var i=0; i< getFundingInfoResult.length; i++) {
                fundingMoneySum += getFundingInfoResult[i].funding_money;
                profitMoneySum += getFundingInfoResult[i].profit_money;
                rewardMoneySum += getFundingInfoResult[i].reward_money;
            }
            if(fundStatus == 1) {
                getFundingInfoResult[0].profit_money = 0;
                getFundingInfoResult[0].reward_money = fundingMoneySum;
            }else{
                getFundingInfoResult[0].profit_money = profitMoneySum;
                getFundingInfoResult[0].reward_money = rewardMoneySum;
            }
            getFundingInfoResult[0].funding_money = fundingMoneySum;
            getFundingInfoResult[0].user_name = getUserNameResult[0].name;
            storeResult.funding = getFundingInfoResult[0];
            }

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

    readByWifi: (wifiSSID) => {
        return new Promise(async (resolve, reject) => {
            const getStoreByWifiQuery = `SELECT i.*, f.* FROM store_info AS i INNER JOIN store_fund AS f ON i.store_idx = f.store_idx WHERE i.wifi_SSID = ${wifiSSID}`;
            const getStoreByWifiResult = await pool.queryParam_None(getStoreByWifiQuery);

            if(!getStoreByWifiResult){
                resolve({
                    code : statusCode.INTERNAL_SERVER_ERROR,
                    json : authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
                });
                return;
            }

            const getData = getStoreByWifiResult[0];
            if (getData == undefined) {
                resolve({
                    code : statusCode.DB_ERROR,
                    json : authUtil.successFalse(statusCode.DB_ERROR, responseMessage.DB_ERROR)
                });
                return;
            }

            const storeIdx = getData.store_idx;
            const thumbnail = getData.thumbnail;
            const storeName = getData.name;
            const storeWifi = getData.wifi_SSID;
            // 펀딩 남은 날짜
            const dueDate = moment(getData.due_date); // 남은 날짜 계산해줘야 함
            const now = moment();
            const remainingTime = moment.duration(dueDate.diff(now));
            var remainingDays = remainingTime.asDays(); // parseInt 해야함


            const currentSales = getData.current_sales;
            const goalSales = getData.goal_sales;
            const progressPercent = currentSales / goalSales * 100; // 현재 퍼센트 (클라에 전송할 데이터)

            const responseResult = {
                "storeIdx" : storeIdx,
                "thumbnail" : thumbnail,
                "storeName" : storeName,
                "wifiSSID" : storeWifi,
                "remainingDays" : parseInt(remainingDays),
                "progressPercent" : progressPercent
            };

            resolve({
                code : statusCode.OK,
                json : authUtil.successTrue(statusCode.OK, responseMessage.X_READ_SUCCESS(THIS_LOG), responseResult)
            });
        })
    },

    createCheer : (userIdx, storeIdx) => {
        return new Promise (async (resolve, reject) => {
            const insertCheerQuery = `INSERT INTO cheer(store_idx ,user_idx) VALUES (${storeIdx}, ${userIdx})`;
            const insertCheerResult = await pool.queryParam_None(insertCheerQuery);

            if(!insertCheerResult) {
                resolve({
                    code : statusCode.INTERNAL_SERVER_ERROR,
                        json : authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
                });
                return;
            } else {
                resolve({
                    code : statusCode.OK,
                    json : authUtil.successTrue(statusCode.OK, responseMessage.X_CREATE_SUCCESS(THIS_LOG))
                });
            }

        });
    },

    readCheer : (userIdx, storeIdx) => {
        return new Promise (async (resolve, reject) => {
            const getCheerQuery = `SELECT * FROM cheer WHERE user_idx = ${userIdx} AND store_idx = ${storeIdx}`;
            const getCheerResult = await pool.queryParam_None(getCheerQuery);
            if(!getCheerResult) {
                resolve({
                    code : statusCode.INTERNAL_SERVER_ERROR,
                    json : authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
                });
                return;
            } else {

                if(getCheerResult[0] != undefined) {
                    resolve({
                        result : 500
                    });
                } else {
                    resolve({
                        result : 0
                    });
                }
            }
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

