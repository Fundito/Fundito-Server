var express = require('express');
var router = express.Router();

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
        /////////////////////////////////로그인 구현되면 userIdx 토큰에서 뽑는걸루!
        userIdx,
        funditoMoney,
        payPassword
    } = req.body;

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
