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
    create: (name, telNumber, latitude, longitude, address, businessHours, breaktime, holiday, thumbnail, wifiSSID, qrCodeID) => {
        return new Promise(async (resolve, reject) => {
            const createStoreQuery = `INSERT INTO ${table}(name, tel_number, location_latitude, location_longitude, address, business_hours, breaktime, holiday, thumbnail, wifi_SSID, qrcode_ID) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
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
            const getStoreListQuery = `SELECT * FROM ${table}`;
            const getStoreListResult = await pool.queryParam_None(getStoreListQuery);

            if (!getStoreListResult) {
                resolve({
                    code : statusCode.INTERNAL_SERVER_ERROR,
                    json : authUtil.successFalse(responseMessage.INTERNAL_SERVER_ERROR)
                });
                return;
            }

            resolve({
                code : statusCode.OK,
                json : authUtil.successTrue(responseMessage.X_READ_ALL_SUCCESS(THIS_LOG), getStoreListResult)
            });
        });
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

    delete: (storeIdx) => {
        return new Promise(async (resolve, reject) => {
            const deleteStoreQuery = `DELETE FROM ${table} WHERE store_idx = ?`;
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
                json : authUtil.successTrue(responseMessage.X_DELETE_SUCCESS(THIS_LOG), deleteStoreResult)
            });
        });
    }
};

module.exports = storeInfo;

