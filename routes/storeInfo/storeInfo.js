var express = require('express');
var router = express.Router();

const hangul = require('hangul-js');

const statusCode = require('../../module/utils/statusCode');
const responseMessage = require('../../module/utils/responseMessage');
const authUtil = require('../../module/utils/authUtil');
const upload = require('../../config/multer');


const StoreInfo = require('../../model/StoreInfo');

/**
 * [POST] /storeInfo
 * 식당 추가
 * @author ChoSooMin
 * @body name, telNumber, latitude, longitude, address, businessHours, breaktime, holiday, thumbnail, wifiSSID, menu
 */
router.post('/', upload.single('thumbnail'), async(req, res) => {
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

    const thumbnailImg = req.file.location;

    if (!name || !wifiSSID ) {
        res.status(400).send(authUtil.successFalse(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
        return;
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
        res.status(statusCode.INTERNAL_SERVER_ERROR, authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    });
});


/**
 * [GET] /storeInfo/search?keyword={타이핑 시 검색어}
 * 식당 이름 검색
 * @author 100yeeun
 * @params 검색키워드
 */

router.get('/search', async(req, res) => {
    StoreInfo.readAllName()
    .then(({ result, code }) => {

        const searcher = new hangul.Searcher(req.query.keyword);

        const findStoreNameList = new Array();

		for (var i =0 ; i<result.length; i++){
			if (searcher.search(result[i].name)>=0){
				findStoreNameList.push(result[i]); 
			}
		}

        const json = authUtil.successTrue(statusCode.OK, responseMessage.X_READ_SUCCESS('검색'), findStoreNameList)

        
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
 * @param storeIdx
 */
router.get('/:storeIdx', async(req, res) => {
    const {
        storeIdx
    } = req.params;

    if (!storeIdx) {
        res.status(statusCode.BAD_REQUEST).send(authUtil.successFalse(statusCode.BAD_REQUEST, responseMessage.NO_INDEX));
        return;
    }

    StoreInfo.read(storeIdx)
    .then(({ code, json }) => {
        res.status(code).send(json);
    })
    .catch((err) => {
        console.log(err);
        res.status(statusCode.INTERNAL_SERVER_ERROR, authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
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
        res.status(statusCode.BAD_REQUEST).send(authUtil.successFalse(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
        return;
    }

    StoreInfo.read(storeIdx)
    .then(({ code, json }) => {
        const storeData = json.data;
        console.log(storeData);

        // storeIdx가 존재하지 않을 경우
        if (storeData == undefined) {
            res.status(code).send(authUtil.successFalse(code, json.message));
            return;
        }

        if (wifiSSID == storeData.wifi_SSID) {
            res.status(code).send(authUtil.successTrue(code, responseMessage.WIFI_CHECK_SUCCESS));
        }
        else {
            res.status(code).send(authUtil.successTrue(code, responseMessage.WIFI_CHECK_FAIL));
        }
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
        res.status(statusCode.INTERNAL_SERVER_ERROR, authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    });
});

module.exports = router;
