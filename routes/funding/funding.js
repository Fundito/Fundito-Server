const express = require('express');
const router = express.Router();

const statusCode = require('../../module/utils/statusCode');
const responseMessage = require('../../module/utils/responseMessage');
const authUtil = require('../../module/utils/authUtil');
const pool = require('../../module/db/pool');
const jwt = require('../../module/auth/jwt');

const Funding = require('../../model/Funding');
const StoreInfo = require('../../model/StoreInfo');

/**
 * [GET] /funding/:storeIdx
 * 투자 최대 이율 조회
 * @author ChoSooMin
 * @param storeIdx
 */
router.get('/:storeIdx', jwt.checkLogin, async(req, res) => {
    const { storeIdx } = req.params;

    StoreInfo.readStoreInfo(storeIdx)
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
 * @body payPassword, storeIdx, fundingMoney
 */
router.post('/', jwt.checkLogin, async(req, res) => {
    const {
        payPassword,
        storeIdx,
        fundingMoney
    } = req.body;
    const userIdx = req.decoded.idx;

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

module.exports = router;
