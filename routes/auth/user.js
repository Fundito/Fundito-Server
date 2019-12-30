const express = require('express');
const router = express.Router();
const statusCode = require('../../module/utils/statusCode');
const responseMessage = require('../../module/utils/responseMessage');
const authUtil = require('../../module/utils/authUtil');
const User = require('../../model/User');
const jwt = require('../../module/auth/jwt');

/**
 *  [GET] /auth/user
 *  유저 정보 조회
 *  @author KangYeongWoo
 *  @headers token
 */
router.get('/',jwt.checkLogin, async(req, res) => {
    const userIdx = req.decoded.idx
    
    User.read(userIdx)
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