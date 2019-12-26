var express = require('express');
var router = express.Router();

var statusCode = require('../../module/utils/statusCode');
var responseMessage = require('../../module/utils/responseMessage');
var authUtil = require('../../module/utils/authUtil');
var pool = require('../../module/db/pool');

const StoreInfo = require('../../model/StoreInfo');

/**
 * [POST] /storeInfo
 * 식당 추가
 * @author ChoSooMin
 * @body name, telNumber, latitude, longitude, address, businessHours, breaktime, holiday, thumbnail, wifiSSID, menu
 */
router.post('/', async(req, res) => {
    const {
        name,
        telNumber,
        latitude,
        longitude,
        address,
        businessHours,
        breaktime,
        holiday,
        thumbnail,
        wifiSSID,
        menu
    } = req.body;

    StoreInfo.create(name, telNumber, latitude, longitude, address, businessHours, breaktime, holiday, thumbnail, wifiSSID, menu)
    .then(({ code, json }) => {
        res.status(code).send(json);
    })
    .catch((err) => {
        console.log(err);
        res.status(statusCode.INTERNAL_SERVER_ERROR, authUtil.successFalse(responseMessage.INTERNAL_SERVER_ERROR));
    });
});

/**
 * [GET] /storeInfo
 * 전체 식당 정보 조회
 * @author ChoSooMin
 */
router.get('/', async(req, res) => {
    StoreInfo.readAll()
    .then(({ code, json }) => {
        res.status(code).send(json);
    })
    .catch((err) => {
        console.log(err);
        res.status(statusCode.INTERNAL_SERVER_ERROR, authUtil.successFalse(responseMessage.INTERNAL_SERVER_ERROR));
    });
});

/**
 * [GET] /storeInfo/:storeIdx
 * 식당 정보 조회
 * @author ChoSooMin
 * @param storeIdx
 */
router.get('/:storeIdx', async(req, res) => {
    const {
        storeIdx
    } = req.params;

    if (!storeIdx) {
        res.status(statusCode.BAD_REQUEST).send(authUtil.successFalse(responseMessage.NULL_VALUE));
        return;
    }

    StoreInfo.read(storeIdx)
    .then(({ code, json }) => {
        res.status(code).send(json);
    })
    .catch((err) => {
        console.log(err);
        res.status(statusCode.INTERNAL_SERVER_ERROR, authUtil.successFalse(responseMessage.INTERNAL_SERVER_ERROR));
    });
});

/**
 * [POST] /storeInfo/wifi
 * 와이파이 SSID 확인
 * @author ChoSooMin
 * @body wifiSSID, store_idx
 */
router.post('/wifi', async(req, res) => {
    const {
        wifiSSID,
        storeIdx
    } = req.body;

    if (!wifiSSID || !storeIdx) {
        res.status(statusCode.BAD_REQUEST).send(authUtil.successFalse(responseMessage.NULL_VALUE));
        return;
    }

    StoreInfo.read(storeIdx)
    .then(({ code, json }) => {
        const data = json.data;
        console.log(storeData);

        if (wifiSSID == data.wifi_SSID) {
            res.status(code).send(authUtil.successTrue(responseMessage.WIFI_CHECK_SUCCESS));
        }
        else {
            res.status(code).send(authUtil.successTrue(responseMessage.WIFI_CHECK_FAIL));
        }
    })
    .catch((err) => {
        console.log(err);
        res.status(statusCode.INTERNAL_SERVER_ERROR, authUtil.successFalse(responseMessage.INTERNAL_SERVER_ERROR));
    });
});

/**
 * [DELETE] /storeInfo/:storeIdx
 * 식당 정보 삭제
 * @author ChoSooMin
 * @param storeIdx
 */
router.delete('/:storeIdx', async(req, res) => {
    const {
        storeIdx
    } = req.params;

    StoreInfo.delete(storeIdx)
    .then(({ code, json }) => {
        res.status(code).send(json);
    })
    .catch((err) => {
        console.log(err);
        res.status(statusCode.INTERNAL_SERVER_ERROR, authUtil.successFalse(responseMessage.INTERNAL_SERVER_ERROR));
    });
});

module.exports = router;
