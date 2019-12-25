var express = require('express');
var router = express.Router();

var statusCode = require('../../module/utils/statusCode');
var responseMessage = require('../../module/utils/responseMessage');
var authUtil = require('../../module/utils/authUtil');
var pool = require('../../module/db/pool');

/**
 * [POST] /storeInfo/wifi
 * @author ChoSooMin
 * @body wifiSSID, store_idx
 */
router.post('/wifi', async(req, res) => {
    const {
        wifiSSID,
        storeIdx
    } = req.body;

    if (!wifiSSID) {
        res.status(statusCode.BAD_REQUEST).send(authUtil.successFalse(responseMessage.NULL_VALUE));
        return;
    }

    const postWifiCheckQuery = `SELECT wifi_SSID FROM store_info WHERE store_idx=?`;
    const postWifiCheckResult = await pool.queryParam_Arr(postWifiCheckQuery, [storeIdx]);

    if (!postWifiCheckResult) {
        res.status(statusCode.BAD_REQUEST).send(authUtil.successFalse(responseMessage.BAD_REQUEST));
        return;
    }

    /**
     * @todo 이렇게 하는게 맞나?
     */
    // console.log(postWifiCheckResult);
    // console.log(postWifiCheckResult[0].wifi_SSID);
    const getData = postWifiCheckResult[0];

    if (wifiSSID == getData.wifi_SSID) {
        res.status(statusCode.OK).send(authUtil.successTrue(
            responseMessage.WIFI_CHECK_SUCCESS
        ));
    }
    else {
        res.status(statusCode.OK).send(authUtil.successTrue(
            responseMessage.WIFI_CHECK_FAIL
        ));
    }
});

module.exports = router;
