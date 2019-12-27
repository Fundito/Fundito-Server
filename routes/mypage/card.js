var express = require('express');
var router = express.Router();

var statusCode = require('../../module/utils/statusCode');
var responseMessage = require('../../module/utils/responseMessage');
var authUtil = require('../../module/utils/authUtil');
var pool = require('../../module/db/pool');

var Card = require('../../model/Card');

/**
 * [POST] /mypage/card/:userIdx
 * 카드 생성
 * @author ChoSooMin
 * @param userIdx
 * @body cardCompany, cardNumber, cvc, password
 */
router.post('/:userIdx', async (req, res) => {
    const {
        cardCompany,
        cardNumber,
        cvc,
        password
    } = req.body;
    const { userIdx } = req.params;

    if (!userIdx || !cardCompany || !cardNumber || !cvc || !password) {
        res.status(statusCode.BAD_REQUEST).send(authUtil.successFalse(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
        return;
    }

    // console.log(typeof(cardNumber));

    // cardNumber, cvc, password 형이 string이 아니면 오류 (암호화, 복호화를 위해)
    if (typeof(cardNumber) != `string` || typeof(cvc) != `string` || typeof(password) != `string`) {
        res.status(statusCode.BAD_REQUEST).send(authUtil.successFalse(statusCode.BAD_REQUEST, responseMessage.BODY_VALUE_ERROR));
        return;
    }
    
    Card.create(userIdx, cardCompany, cardNumber, cvc, password)
    .then(({ code, json }) => {
        res.status(code).send(json);
    })
    .catch((err) => {
        console.log(err);
        res.status(statusCode.INTERNAL_SERVER_ERROR, authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    });
});

/**
 * [GET] /mypage/card/:cardIdx
 * 카드 조회
 * @author ChoSooMin
 * @param cardIdx
 */
router.get('/:cardIdx', async(req, res) => {
    const { cardIdx } = req.params;

    Card.read(cardIdx)
    .then(({ code, json }) => {
        res.status(code).send(json);
    })
    .catch((err) => {
        console.log(err);
        res.status(statusCode.INTERNAL_SERVER_ERROR, authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    });
});

/**
 * [DELETE] /mypage/card/:userIdx
 * 카드 삭제
 * @author ChoSooMin
 * @param userIdx
 * @body cardIdx
 */
router.delete('/:userIdx', async(req, res) => {
    const {
        cardIdx
    } = req.body;
    const { userIdx } = req.params;

    Card.delete(userIdx, cardIdx)
    .then(({ code, json }) => {
        res.status(code).send(json);
    })
    .catch((err) => {
        console.log(err);
        res.status(statusCode.INTERNAL_SERVER_ERROR, authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    });
});

module.exports = router;
