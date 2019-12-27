var express = require('express');
var router = express.Router();
const passport = require('passport');
const statusCode = require('../../module/utils/statusCode');
const responseMessage = require('../../module/utils/responseMessage');
const authUtil = require('../../module/utils/authUtil');
const jwt = require('../../module/token/jwt');

router.get('/', (req, res) => {
    console.log(req.session.passport); // idx가 나옴s
});

// facebook 로그인
router.get('/facebook',
    passport.authenticate('facebook')
);

// facebook 로그인 연동 콜백
router.get('/facebook/callback',
    passport.authenticate('facebook', {
        //성공, 실패시 들어갈 url을 집어넣을 것
        successRedirect: '/auth/signin/success',
        failureRedirect: '/auth/signin/fail'
    })
);

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

module.exports = router;
