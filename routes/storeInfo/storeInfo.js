var express = require('express');
var router = express.Router();

const statusCode = require('../../module/utils/statusCode');
const responseMessage = require('../../module/utils/responseMessage');
const authUtil = require('../../module/utils/authUtil');
const upload = require('../../config/multer');
const jwt = require('../../module/auth/jwt');

const StoreInfo = require('../../model/StoreInfo');
const User = require('../../model/User');

/**
 * [POST] /storeInfo
 * 식당 추가
 * @author ChoSooMin
 * @header token
 * @body name, telNumber, latitude, longitude, address, businessHours, breaktime, holiday, thumbnail, wifiSSID, menu
 */
router.post('/', jwt.checkLogin, upload.single('thumbnail'), async(req, res) => {
    const {
        name,
        telNumber,
        latitude,
        longitude,
        address,
        businessHours,
        breaktime,
        holiday,
        wifiSSID,
        menu
    } = req.body;

    const thumbnailImg = ``;

    if (!name || !wifiSSID ) {
        res.status(400).send(authUtil.successFalse(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
        return;
    }
    if (req.file) {
        const thumbnailImg = req.file.location;
    }
    
    StoreInfo.create(name, telNumber, latitude, longitude, address, businessHours, breaktime, holiday, thumbnailImg, wifiSSID, menu)
    .then(({ code, json }) => {
        res.status(code).send(json);
    })
    .catch((err) => {
        console.log(err);
        res.status(statusCode.INTERNAL_SERVER_ERROR, authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    });
});

/**
 * [GET] /storeInfo/all
 * 전체 식당 정보 조회
 * @author ChoSooMin
 */
router.get('/all', jwt.checkLogin, async(req, res) => {
    StoreInfo.readAll()
    .then(({ code, json }) => {
        res.status(code).send(json);
    })
    .catch((err) => {
        console.log(err);
        res.status(statusCode.INTERNAL_SERVER_ERROR, authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    });
});

/**
 * [GET] /storeInfo/:storeIdx
 * 식당 정보 조회
 * @author ChoSooMin, LeeSohee
 * @header token
 * @param storeIdx
 */
router.get('/:storeIdx', jwt.checkLogin, async(req, res) => {
    const {
        storeIdx
    } = req.params;
    const userIdx = req.decoded.idx;

    if (!storeIdx) {
        res.status(statusCode.BAD_REQUEST).send(authUtil.successFalse(statusCode.BAD_REQUEST, responseMessage.NO_INDEX));
        return;
    }

    StoreInfo.readStoreInfo(userIdx, storeIdx)
    .then(({ code, json }) => {
        res.status(code).send(json);
    })
    .catch((err) => {
        console.log(err);
        res.status(statusCode.INTERNAL_SERVER_ERROR, authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    });
});

/**
 * [GET] /storeInfo/wifi/:wifiSSID
 * 와이파이 SSID를 갖고, 해당 식당 정보 불러오기
 * @author ChoSooMin
 * @param wifiSSID
 */
router.get('/wifi/:wifiSSID', jwt.checkLogin, async(req, res) => {
    const {
        wifiSSID
    } = req.params;

    if (!wifiSSID) {
        res.status(statusCode.BAD_REQUEST).send(authUtil.successFalse(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
        return;
    }

    StoreInfo.readByWifi(wifiSSID)
    .then(({ code, json }) => {
        res.status(code).send(json);
    })
    .catch((err) => {
        console.log(err);
        res.status(statusCode.INTERNAL_SERVER_ERROR, authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    });
});

router.get('/wifi', jwt.checkLogin, async(req, res) => {
    const{
        wifiSSID
    } = req.body;

    if (!wifiSSID) {
        res.status(statusCode.BAD_REQUEST).send(authUtil.successFalse(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
        return;
    }
    
});

/**
 * [POST] /storeInfo/wifi
 * 와이파이 SSID 확인
 * @author ChoSooMin
 * @body wifiSSID, store_idx
 */
router.post('/wifi', jwt.checkLogin, async(req, res) => {
    const {
        wifiSSID,
        storeIdx
    } = req.body;

    if (!wifiSSID || !storeIdx) {
        res.status(statusCode.BAD_REQUEST).send(authUtil.successFalse(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
        return;
    }

    StoreInfo.read(storeIdx)
    .then(({ code, json }) => {
        const storeData = json.data;

        // storeIdx가 존재하지 않을 경우
        if (storeData == undefined) {
            res.status(code).send(authUtil.successFalse(code, json.message));
            return;
        }

        if (wifiSSID == storeData.wifi_SSID) {
            res.status(code).send(authUtil.successTrue(code, responseMessage.WIFI_CHECK_SUCCESS));
        }
        else {
            res.status(statusCode.UNAUTHORIZED).send(authUtil.successFalse(statusCode.UNAUTHORIZED, responseMessage.WIFI_CHECK_FAIL));
        }
    })
    .catch((err) => {
        console.log(err);
        res.status(statusCode.INTERNAL_SERVER_ERROR, authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    });
});

/**
 * [POST] storeInfo/cheer/:storeIdx
 * 응원하고 50P 받기
 */
router.post('/cheer/:storeIdx', jwt.checkLogin, async(req, res) => {
    const {
        storeIdx
    } = req.params;

    const userIdx = req.decoded.idx;

    StoreInfo.createCheer(userIdx, storeIdx)
    .then(() => {
        User.updatePointWithoutPassword(userIdx,50)
        .then(({code, json})=>{
            res.status(code).send(json);
        }).catch((err) => {
            res.status(statusCode.INTERNAL_SERVER_ERROR).send(authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR))
        });
    })
    .catch((err) => {
        console.log(err);
        res.status(statusCode.INTERNAL_SERVER_ERROR, authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    });
});

/**
 * [DELETE] /storeInfo/:storeIdx
 * 식당 정보 삭제
 * @author ChoSooMin
 * @param storeIdx
 */
router.delete('/:storeIdx', jwt.checkLogin, async(req, res) => {
    const {
        storeIdx
    } = req.params;

    StoreInfo.delete(storeIdx)
    .then(({ code, json }) => {
        res.status(code).send(json);
    })
    .catch((err) => {
        console.log(err);
        res.status(statusCode.INTERNAL_SERVER_ERROR, authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    });
});

module.exports = router;
