var express = require('express');
var router = express.Router();

const statusCode = require('../../module/utils/statusCode');
const responseMessage = require('../../module/utils/responseMessage');
const authUtil = require('../../module/utils/authUtil');
const pool = require('../../module/db/pool');

const Funding = require('../../model/Funding');

/**
 * [GET] /mypage/fund/:userIdx
 * 내 투자내역 조회
 * @author ChoSooMin
 * @param user_idx
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

router.get ('/reward/:userIdx', async (req, res) => {
    Funding.read(req.params.userIdx)
    .then(({ code, json }) => {
        
        let getMoneySum = 0;
        let fundedMoneySum = 0;

        if (json.status < 300) { 

            for(let i = 0; i < json.data.length; i++){
                getMoneySum += ((json.data[i].funding_money * json.data[i].reward_percent) * 0.01);
                fundedMoneySum += json.data[i].funding_money;
            }

            const totalRewardPercent = Math.floor((getMoneySum / fundedMoneySum) * 100);
            const rewardMoney = getMoneySum - fundedMoneySum;

            const sendJson = new Object();

            sendJson.totalGetMoney = getMoneySum;
            sendJson.totalFundedMoney = fundedMoneySum;
            sendJson.totalRewardMoney = rewardMoney;
            sendJson.totalRewardPercent = totalRewardPercent;

            json.data = sendJson;
        }

        res.status(code).send(json);
    })
    .catch((err) => {
        console.log(err);
        res.status(statusCode.INTERNAL_SERVER_ERROR, authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    });
});

module.exports = router;
