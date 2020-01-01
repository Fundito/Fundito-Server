const express = require('express');
const router = express.Router();

const statusCode = require('../../module/utils/statusCode');
const responseMessage = require('../../module/utils/responseMessage');
const authUtil = require('../../module/utils/authUtil');
const pool = require('../../module/db/pool');
const jwt = require('../../module/auth/jwt');

const Card = require('../../model/Card');

/**
 * [POST] /mypage/card
 * 카드 생성
 * @author ChoSooMin
 * @header token
 * @body cardCompany, cardNumber, cardExpirationDate, password
 */
/**
 * Request Body
 * {
	"cardCompany" : "국민",
	"cardNickname" : "별칭",
	"cardNumber" : "12312312",
	"cardExpirationDate" : "123",
	"password" : "123123123"
    }

 */
router.post('/', jwt.checkLogin, async (req, res) => {
    const {
        cardCompany, 
        cardNickname, 
        cardNumber, 
        cardExpirationDate, 
        cardPassword
    } = req.body;
    const userIdx = req.decoded.idx;

    if (!cardCompany || !cardNickname || !cardNumber || !cardExpirationDate || !cardPassword) {
        res.status(statusCode.BAD_REQUEST).send(authUtil.successFalse(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
        return;
    }

    // cardNumber, cvc, password 형이 string이 아니면 오류 (암호화, 복호화를 위해)
    if (typeof(cardNumber) != `string` || typeof(cardExpirationDate) != `string` || typeof(cardPassword) != `string`) {
        res.status(statusCode.BAD_REQUEST).send(authUtil.successFalse(statusCode.BAD_REQUEST, responseMessage.BODY_VALUE_ERROR));
        return;
    }
    
    Card.create(userIdx, cardCompany, cardNickname, cardNumber, cardExpirationDate, cardPassword)
    .then(({ code, json }) => {
        res.status(code).send(json);
    })
    .catch((err) => {
        console.log(err);
        res.status(statusCode.INTERNAL_SERVER_ERROR, authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    });
});

/**
 * [GET] /mypage/card/:userIdx
 * 카드 조회
 * @author ChoSooMin
 * @param cardIdx
 */
router.get('/', jwt.checkLogin, async(req, res) => {
    const userIdx = req.decoded.idx;

    Card.read(userIdx)
    .then(({ code, json }) => {

        const cardData = json.data;

        if (json.data == undefined) {
            res.status(statusCode.BAD_REQUEST).send(authUtil.successFalse(statusCode.BAD_REQUEST, responseMessage.CARD_USER_NO));
        }

        let sendData = new Object();
        // sendData.cardNickname = cardData.cardNickname;
        sendData.userName = cardData.userName

        const cardNumber = cardData.cardNumber;
        const subStrNumber = (cardData.cardNumber).substr(0, 4);

        sendData.cardNickname = `${cardData.cardCompany} ${subStrNumber}-**`;

        res.status(code).send(authUtil.successTrue(code, json.message, sendData));

        // if (sendData.cardNickname == '') {
        //     const cardNumber = cardData.cardNumber;
        //     const subStrNumber = (cardData.cardNumber).substr(0, 4);
        //     console.log(subStrNumber);

        //     sendData.cardNickname = `${cardData.cardCompany}(${subStrNumber})`;

        //     res.status(code).send(authUtil.successTrue(code, json.message, sendData));
        // }
        // else {
        //     res.status(code).send(authUtil.successTrue(code, json.message, sendData));
        // }
    })
    .catch((err) => {
        console.log(err);
        res.status(statusCode.INTERNAL_SERVER_ERROR, authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    });
});

/**
 * [DELETE] /mypage/card
 * 카드 삭제
 * @author ChoSooMin
 * @header token
 */
router.delete('/', jwt.checkLogin, async(req, res) => {
    const userIdx = req.decoded.idx;

    Card.delete(userIdx)
    .then(({ code, json }) => {
        res.status(code).send(json);
    })
    .catch((err) => {
        console.log(err);
        res.status(statusCode.INTERNAL_SERVER_ERROR, authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    });
});

module.exports = router;
