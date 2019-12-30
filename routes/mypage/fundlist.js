var express = require('express');
var router = express.Router();

const statusCode = require('../../module/utils/statusCode');
const responseMessage = require('../../module/utils/responseMessage');
const authUtil = require('../../module/utils/authUtil');
const pool = require('../../module/db/pool');
const jwt = require('../../module/auth/jwt');

const Funding = require('../../model/Funding');

/**
 * [GET] /mypage/fundlist/:fundStatus
 * @author ChoSooMin
 * @header token
 * @param fundStats
 */
router.get('/:fundStatus', jwt.checkLogin, async (req, res) => {
    const {
        fundStatus
    } = req.params;
    const userIdx = req.decoded.idx;

    Funding.readUserFundingList(userIdx, fundStatus)
    .then(({ code, json }) => {
        res.status(code).send(json);
    })
    .catch((err) => {
        console.log(err);
        res.status(statusCode.INTERNAL_SERVER_ERROR, authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    });
});


/**
 * [GET] /mypage/fundlist
 * 내 투자내역 조회 (최근순)
 * @author ChoSooMin
 * @header token
 */
router.get('/', jwt.checkLogin, async (req, res) => {
    const userIdx = req.decoded.idx;

    Funding.read(userIdx)
    .then(({ code, json }) => {
        res.status(code).send(json);
    })
    .catch((err) => {
        console.log(err);
        res.status(statusCode.INTERNAL_SERVER_ERROR, authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    });
});

module.exports = router;
