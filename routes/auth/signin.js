var express = require('express');
var router = express.Router();
const statusCode = require('../../module/utils/statusCode');
const responseMessage = require('../../module/utils/responseMessage');
const authUtil = require('../../module/utils/authUtil');
const fb = require('../../module/auth/fb-jwt');
const User = require('../../model/User');

// 로그인
router.get('/',fb, async(req, res) => {
    const {id, name} = req.decoded;

    User.login(id, name)
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
//강영우 바보 