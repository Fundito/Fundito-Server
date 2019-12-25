const express = require('express');
const router = express.Router();

const statusCode = require('../module/utils/statusCode');
const responseMessage = require('../module/utils/responseMessage');
const authUtil = require('../module/utils/authUtil');
const pool = require('../module/db/pool');
const StoreFund = require('../model/StoreFund');

/*
    [POST] /storefund
    가게 펀드 정보 입력
*/
router.post('/:storeIdx', async (req, res) => {
    const {
        customerCount,
        marginPercent,
        goalMoney
    } = req.body;
    const {storeIdx} = req.params;
    if (!storeIdx || !customerCount || !marginPercent || !goalMoney){
        res.status(statusCode.BAD_REQUEST).send(authUtil.successFalse(responseMessage.NULL_VALUE));
        return;
    }

    StoreFund.create(storeIdx, customerCount, marginPercent, goalMoney)
    .then(({ code, json }) => {
        res.status(code).send(json);
    })
    .catch((err) => {
        console.log(err);
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(authUtil.successFalse(responseMessage.INTERNAL_SERVER_ERROR));
    });
});

/*
    [GET] /storefund/:storeIdx
    가게 펀드 정보 조회
*/
router.get('/:storeIdx', async (req,res) => {
    const {
        storeIdx
    } = req.params;

    if(!storeIdx){
        res.status(statusCode.BAD_REQUEST).send(authUtil.successFalse(responseMessage.NULL_VALUE));
        return;
    }

    StoreFund.read(storeIdx)
    .then(({ code, json }) => {
        res.status(code).send(json);
    })
    .catch((err) => {
        console.log(err);
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(authUtil.successFalse(responseMessage.INTERNAL_SERVER_ERROR));
    })
});

/**
 * [GET] /storefund
 * 모든 펀드 정보 조회
 * @author ChoSooMin
 */
router.get('/', async(req, res) => {
    StoreFund.readAll()
    .then(({ code, json }) => {
        res.status(code).send(json);
    })
    .catch((err) => {
        console.log(err);
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(authUtil.successFalse(responseMessage.INTERNAL_SERVER_ERROR));
    });
});

module.exports = router;