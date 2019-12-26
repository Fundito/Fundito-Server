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
 * @body cardNumber, cvc, password
 */
router.post('/:userIdx', async (req, res) => {
    const {
        cardNumber,
        cvc,
        password
    } = req.body;
    const { userIdx } = req.params;

    Card.create(userIdx, cardNumber, cvc, password)
    .then(({ code, json }) => {
        res.status(code).send(json);
    })
    .catch((err) => {
        console.log(err);
        res.status(statusCode.INTERNAL_SERVER_ERROR, authUtil.successFalse(responseMessage.INTERNAL_SERVER_ERROR));
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
        res.status(statusCode.INTERNAL_SERVER_ERROR, authUtil.successFalse(responseMessage.INTERNAL_SERVER_ERROR));
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
        res.status(statusCode.INTERNAL_SERVER_ERROR, authUtil.successFalse(responseMessage.INTERNAL_SERVER_ERROR));
    });
});

module.exports = router;
