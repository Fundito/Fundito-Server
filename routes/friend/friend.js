const express = require('express');
const router = express.Router();
const statusCode = require('../../module/utils/statusCode');
const responseMessage = require('../../module/utils/responseMessage');
const authUtil = require('../../module/utils/authUtil');
const Friend = require('../../model/Friend');
const jwt = require('../../module/auth/jwt');

/**
 *  [GET] /friend
 *  친구 전체 정보 조회
 *  @author KangYeongWoo
 *  @headers token
 */
router.get('/',jwt.checkLogin, async(req, res) => {
    const userIdx = req.decoded.idx
    
    Friend.readAll(userIdx)
    .then(({ code, json }) => {
        res.status(code).send(json);
    })
    .catch((err) => {
        console.log(err);
        res.status(statusCode.INTERNAL_SERVER_ERROR)
        .send(authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    });
});

/**
 *  [GET] /friend/fund
 *  이달의 디토
 *  @author KangYeongWoo
 *  @headers token
 */
router.get('/fund',jwt.checkLogin, async(req, res) => {
    const userIdx = req.decoded.idx
    
    Friend.feed(userIdx)
    .then(({ code, json }) => {
        res.status(code).send(json);
    })
    .catch((err) => {
        console.log(err);
        res.status(statusCode.INTERNAL_SERVER_ERROR)
        .send(authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    });
});

/**
 *  [GET] /friend/fund/:friend_idx
 *  친구 투자현황 조회
 *  @author KangYeongWoo
 *  @headers token
 */
router.get('/fund/:friend_idx',jwt.checkLogin, async(req, res) => {
    const friendIdx = req.params.friend_idx;
    
    Friend.readAllStore(friendIdx)
    .then(({ code, json }) => {
        res.status(code).send(json);
    })
    .catch((err) => {
        console.log(err);
        res.status(statusCode.INTERNAL_SERVER_ERROR)
        .send(authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    });
});

module.exports = router;