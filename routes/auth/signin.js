var express = require('express');
var router = express.Router();
const passport = require('passport');
const statusCode = require('../../module/utils/statusCode');
const responseMessage = require('../../module/utils/responseMessage');
const authUtil = require('../../module/utils/authUtil');
const pool = require('../../module/db/pool');

// router.get('/', (req, res) => {
//     console.log(req.session.passport);
// });

// facebook 로그인
router.get('/login/facebook',
    passport.authenticate('facebook')
);

// facebook 로그인 연동 콜백
router.get('/login/facebook/callback',
    passport.authenticate('facebook', {
        //성공, 실패시 들어갈 url을 집어넣을 것
        successRedirect: '/auth/login/success',
        failureRedirect: '/auth/login/fail'
    })
);

//로그인 실패했을때 뜨는 api
router.get('/login/fail', (req, res) => {
    res.status(statusCode.BAD_REQUEST).send(authUtil.successFalse(responseMessage.LOGIN_FAIL));
});

//로그인 성공했을때 뜨는 api
router.get('/login/success', (req, res) => {
    console.log(req._passport.session);
    res.status(statusCode.OK).send(authUtil.successTrue(responseMessage.LOGIN_SUCCESS, req._passport.session.user));
});
module.exports = router;
