var express = require('express');
var router = express.Router();

var statusCode = require('../../module/utils/statusCode');
var responseMessage = require('../../module/utils/responseMessage');
var authUtil = require('../../module/utils/authUtil');
var pool = require('../../module/db/pool');

var Funding = require('../../model/Funding');

/**
 * [POST] /funding
 * 투자 생성
 * @author ChoSooMin
 * @body userIdx, password, storeIdx, fundingMoney
 */
router.post('/', async(req, res) => {
    const {
        userIdx,
        password,
        storeIdx,
        fundingMoney
    } = req.body;

    Funding.create(userIdx, password, storeIdx, fundingMoney)
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
