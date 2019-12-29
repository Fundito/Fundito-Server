var express = require('express');
var router = express.Router();

const statusCode = require('../../module/utils/statusCode');
const responseMessage = require('../../module/utils/responseMessage');
const authUtil = require('../../module/utils/authUtil');
const pool = require('../../module/db/pool');

const Funding = require('../../model/Funding');

/**
 * [GET] /mypage/fundlist/:userIdx/:fundStatus
 * @author ChoSooMin
 * @param userIdx, fundStats
 */
router.get('/:userIdx/:fundStatus', async (req, res) => {
    const {
        userIdx, 
        fundStatus
    } = req.params;

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
 * [GET] /mypage/fundlist/:userIdx
 * 내 투자내역 조회 (최근순)
 * @author ChoSooMin
 * @param userIdx
 */
router.get('/:userIdx', async (req, res) => {
    const {
        userIdx
    } = req.params;

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
