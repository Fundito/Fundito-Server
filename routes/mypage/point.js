const express = require('express');
const router = express.Router();

const statusCode = require('../../module/utils/statusCode');
const responseMessage = require('../../module/utils/responseMessage');
const authUtil = require('../../module/utils/authUtil');
const jwt = require('../../module/auth/jwt');

const User = require('../../model/User');
const StoreInfo = require('../../model/StoreInfo');

/**
 * [GET] mypage/point
 * 펀디토 머니 잔액 조회
 */
router.get('/', jwt.checkLogin, async (req, res) => {
    const userIdx = req.decoded.idx;

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
router.put('/', jwt.checkLogin, async (req, res) => {
    const {
        funditoMoney,
        payPassword
    } = req.body;
    const userIdx = req.decoded.idx;
    
    if(userIdx == undefined || req.body.funditoMoney == undefined  || req.body.payPassword == undefined ){
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


/**
 * [PUT] mypage/point/withdraw
 * 펀디토 머니 회수
 */
router.put('/withdraw', jwt.checkLogin, async (req, res) => {
    const {
        storeIdx,
        rewardMoney
    } = req.body;

    const userIdx = req.decoded.idx;

    if (storeIdx == undefined || rewardMoney == undefined) {
        res.status(statusCode.BAD_REQUEST).send(authUtil.successFalse(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
        return;
    }

    StoreInfo.readCheer(userIdx,storeIdx)
    .then(({result})=>{
        User.updatePointWithoutPassword(userIdx, parseInt(rewardMoney)+parseInt(result))
        .then(()=>{
            User.withdrawPoint(userIdx,storeIdx,rewardMoney)
            .then(({code, json})=>{
                res.status(code).send(json);
            }).catch((err) => {
                res.status(statusCode.INTERNAL_SERVER_ERROR).send(authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR))
            });
        }).catch((err) => {
            res.status(statusCode.INTERNAL_SERVER_ERROR).send(authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR))
        });
    }).catch((err) => {
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR))
    });
    

});

module.exports = router;
