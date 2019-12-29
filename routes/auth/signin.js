var express = require('express');
var router = express.Router();
const passport = require('passport');
const statusCode = require('../../module/utils/statusCode');
const responseMessage = require('../../module/utils/responseMessage');
const authUtil = require('../../module/utils/authUtil');
const pool = require('../../module/db/pool');
const jwt = require('../../module/auth/jwt');
const request = require('request-promise');
const fb = require('../../module/auth/fb-jwt');

router.get('/facebook',fb.login, (req, res) => 
    console.log(req.decoded)
);

<<<<<<< HEAD
//로그인 실패했을때 뜨는 api
router.get('/fail', (req, res) => {
    res.status(statusCode.BAD_REQUEST).send(authUtil.successFalse(statusCode.BAD_REQUEST, responseMessage.LOGIN_FAIL));
});

//로그인 성공했을때 뜨는 api
router.get('/success', (req, res) => {
    console.log(req._passport.session);
    const tokenValue = jwt.sign(req._passport.session.user.idx);
    res.status(statusCode.OK).send(authUtil.successTrue(statusCode.OK, responseMessage.LOGIN_SUCCESS, tokenValue));
});
=======
>>>>>>> feature/auth

module.exports = router;
