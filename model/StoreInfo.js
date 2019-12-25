const statusCode = require('../module/utils/statusCode');
const responseMessage = require('../module/utils/responseMessage');
const authUtil = require('../module/utils/authUtil');
const pool = require('../module/db/pool');

const storeInfoTable = `store_info`;
const menuTable = `menu`;
const THIS_LOG = '상점 정보';

/**
 * storeInfo는 update가 없어도 된다.
 */
const storeInfo = {
    create: (name, telNumber, latitude, longitude, address, businessHours, breaktime, holiday, thumbnail, wifiSSID, qrCodeID) => {
        return new Promise(async (resolve, reject) => {
            const createStoreQuery = `INSERT INTO ${storeInfoTable}(name, tel_number, location_latitude, location_longitude, address, business_hours, breaktime, holiday, thumbnail, wifi_SSID, qrcode_ID) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            const createStoreResult = await pool.queryParam_Arr(createStoreQuery, [name, telNumber, latitude, longitude, address, businessHours, breaktime, holiday, thumbnail, wifiSSID, qrCodeID]);

            if (!createStoreResult) {
                resolve({
                    code : statusCode.INTERNAL_SERVER_ERROR,
                    json : authUtil.successFalse(responseMessage.INTERNAL_SERVER_ERROR)
                });
                return;
            }

            resolve({
                code : statusCode.OK,
                json : authUtil.successTrue(responseMessage.X_CREATE_SUCCESS(THIS_LOG), createStoreResult)
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
                    json : authUtil.successFalse(responseMessage.INTERNAL_SERVER_ERROR)
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
                json : authUtil.successTrue(responseMessage.X_READ_ALL_SUCCESS(THIS_LOG), storeListResult)
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
                json : authUtil.successTrue(responseMessage.X_READ_SUCCESS(THIS_LOG), storeResult)
            });
        });
    },

    delete: (storeIdx) => {
        return new Promise(async (resolve, reject) => {
            const deleteStoreQuery = `DELETE FROM ${storeInfoTable} WHERE store_idx = ?`;
            const deleteStoreResult = await pool.queryParam_Arr(deleteStoreQuery, [storeIdx]);

            if (!deleteStoreResult) {
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

module.exports = storeInfo;

