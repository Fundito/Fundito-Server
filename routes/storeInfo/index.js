var express = require('express');
var router = express.Router();

var statusCode = require('../../module/utils/statusCode');
var responseMessage = require('../../module/utils/responseMessage');
var authUtil = require('../../module/utils/authUtil');
var pool = require('../../module/db/pool');

const StoreInfo = require('../../model/StoreInfo');

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

    if (!wifiSSID || !storeIdx) {
        res.status(statusCode.BAD_REQUEST).send(authUtil.successFalse(responseMessage.NULL_VALUE));
        return;
    }

    StoreInfo.read(storeIdx)
    .then(({ code, json }) => {
        const data = json.data;
        const storeData = data[0];
        console.log(storeData);

        if (wifiSSID == storeData.wifi_SSID) {
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

module.exports = router;
