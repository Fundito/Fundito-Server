var express = require('express');
var router = express.Router();

var statusCode = require('../../module/utils/statusCode');
var responseMessage = require('../../module/utils/responseMessage');
var authUtil = require('../../module/utils/authUtil');
var pool = require('../../module/db/pool');

var Funding = require('../../model/Funding');
var StoreInfo = require('../../model/StoreInfo');

/**
 * [GET] /funding/:storeIdx
 * 투자 최대 이율 조회
 * @author ChoSooMin
 * @param storeIdx
 */
router.get('/:storeIdx', async(req, res) => {
    const { storeIdx } = req.params;

    StoreInfo.read(storeIdx)
    .then(({ code, json }) => {
        const data = json.data;
        console.log(data);

        if (data == undefined) {
            res.status(statusCode.DB_ERROR).send(authUtil.successFalse(statusCode.DB_ERROR, responseMessage.DB_ERROR));
        }

        const refundPercent = data.refund_percent;
        const result = {
            "refundPercent" : refundPercent
        };

        res.status(code).send(authUtil.successTrue(code, responseMessage.FUND_RATE_READ_SUCCESS, result));
    })
    .catch((err) => {
        console.log(err);
        res.status(statusCode.INTERNAL_SERVER_ERROR, authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    });
});

/**
 * [POST] /funding
 * 투자 생성
 * @author ChoSooMin
 * @body userIdx, fundingPassword, storeIdx, fundingMoney
 */
router.post('/', async(req, res) => {
    const {
        userIdx,
        payPassword,
        storeIdx,
        fundingMoney
    } = req.body;

    if (!userIdx || !payPassword || !storeIdx || !fundingMoney) {
        res.status(statusCode.BAD_REQUEST).send(authUtil.successFalse(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
        return;
    }

    Funding.create(userIdx, payPassword, storeIdx, fundingMoney)
    .then(({ code, json }) => {
        res.status(code).send(json);
    })
    .catch((err) => {
        console.log(err);
        res.status(statusCode.INTERNAL_SERVER_ERROR, authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    });
});

/**
 * [GET] /funding
 * 모든 투자 내역 조회
 * @author ChoSooMin
 */
router.get('/', async(req, res) => {
    Funding.readAll()
    .then(({ code, json }) => {
        res.status(code).send(json);
    })
    .catch((err) => {
        console.log(err);
        res.status(statusCode.INTERNAL_SERVER_ERROR, authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    });
});

/**
 * [DELETE] /funding
 * 펀딩 내역 삭제
 * @author ChoSooMin
 * @body userIdx, storeIdx
 */
router.delete('/', async(req, res) => {
    const {
        userIdx,
        storeIdx
    } = req.body;

    if (!userIdx || !storeIdx) {
        res.status(statusCode.BAD_REQUEST).send(authUtil.successFalse(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
        return;
    }

    Funding.delete(userIdx, storeIdx)
    .then(({ code, json }) => {
        res.status(code).send(json);
    })
    .catch((err) => {
        console.log(err);
        res.status(statusCode.INTERNAL_SERVER_ERROR, authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    });
});

module.exports = router;
