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
/**
 * Request Body
 * {
	"cardCompany" : "국민",
	"cardNickname" : "별칭",
	"cardNumber" : "12312312",
	"cvc" : "123",
	"password" : "123123123"
    }
 */
router.post('/:userIdx', async (req, res) => {
    const {
        cardCompany, 
        cardNickname, 
        cardNumber, 
        cvc, 
        cardPassword
    } = req.body;
    const { userIdx } = req.params;

    if (!userIdx || !cardCompany || !cardNickname || !cardNumber || !cvc || !cardPassword) {
        res.status(statusCode.BAD_REQUEST).send(authUtil.successFalse(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
        return;
    }

    // console.log(typeof(cardNumber));

    // cardNumber, cvc, password 형이 string이 아니면 오류 (암호화, 복호화를 위해)
    if (typeof(cardNumber) != `string` || typeof(cvc) != `string` || typeof(cardPassword) != `string`) {
        res.status(statusCode.BAD_REQUEST).send(authUtil.successFalse(statusCode.BAD_REQUEST, responseMessage.BODY_VALUE_ERROR));
        return;
    }
    
    Card.create(userIdx, cardCompany, cardNickname, cardNumber, cvc, cardPassword)
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
router.get('/:userIdx', async(req, res) => {
    const { userIdx } = req.params;

    Card.read(userIdx)
    .then(({ code, json }) => {
        console.log(json);

        const cardData = json.data;

        if (json.data == undefined) {
            res.status(statusCode.BAD_REQUEST).send(authUtil.successFalse(statusCode.BAD_REQUEST, responseMessage.CARD_USER_NO));
        }

        console.log(cardData);

        let sendData = new Object();
        // sendData.cardNickname = cardData.cardNickname;
        sendData.userName = cardData.userName

        const cardNumber = cardData.cardNumber;
        const subStrNumber = (cardData.cardNumber).substr(0, 4);
        console.log(subStrNumber);

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
 * [DELETE] /mypage/card/:userIdx
 * 카드 삭제
 * @author ChoSooMin
 * @param userIdx
 */
router.delete('/:userIdx', async(req, res) => {
    const { userIdx } = req.params;

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
