var express = require('express');
var router = express.Router();

const statusCode = require('../../module/utils/statusCode');
const responseMessage = require('../../module/utils/responseMessage');
const authUtil = require('../../module/utils/authUtil');

const User = require('../../model/User');

/**
 * [GET] mypage/point
 * 펀디토 머니 잔액 조회
 */
router.get('/:userIdx', async (req, res) => {

    console.log(req.params)

    const userIdx = req.params.userIdx;

    User.readPoint(userIdx)
    .then(({ code, json }) => {
        res.status(code).send(json);
    })
    .catch((err) => {
        console.log(err);
        res.status(statusCode.INTERNAL_SERVER_ERROR, authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    });
});

/**
 * [PUT] mypage/point
 * 펀디토 머니 충전
 */
router.put('/', async (req, res) => {
    const {
        userIdx,
        funditoMoney,
        payPassword
    } = req.body;
    
    if(req.body.userIdx == undefined || req.body.funditoMoney == undefined  || req.body.payPassword == undefined ){
        res.status(statusCode.BAD_REQUEST).send(authUtil.successFalse(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
        return;
    }

    User.updatePoint(userIdx,funditoMoney,payPassword)
    .then(({ code, json }) => {
        res.status(code).send(json);
    })
    .catch((err) => {
        console.log(err);
        res.status(statusCode.INTERNAL_SERVER_ERROR, authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    });
});

module.exports = router;
