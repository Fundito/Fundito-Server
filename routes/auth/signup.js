const express = require('express');
const router = express.Router();
const statusCode = require('../../module/utils/statusCode');
const responseMessage = require('../../module/utils/responseMessage');
const authUtil = require('../../module/utils/authUtil');
const User = require('../../model/User');
const fb = require('../../module/auth/fb-jwt');

/**
 *  [POST] /auth/signup
 *  회원 가입
 *  @author KangYeongWoo
 *  @body pay_password, nickname
 *  @header facebook_access_token
 */
router.post('/',fb, async(req, res) => {
    const {id, name, friends} = req.decoded;
    const {pay_password, nickname} = req.body;

    User.signup(id, name, nickname, pay_password, friends)
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