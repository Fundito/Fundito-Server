const express = require('express');
const router = express.Router();

const statusCode = require('../../module/utils/statusCode');
const responseMessage = require('../../module/utils/responseMessage');
const authUtil = require('../../module/utils/authUtil');
const pool = require('../../module/db/pool');

/*
    [POST] auth/signup
    회원가입
 */
router.post('/', async (req,res) => {
    const {
        name,
        password,
        id
    } = req.body;

    if (!name || !password || !id){
        res.status(statusCode.BAD_REQUEST).send(authUtil.successFalse(responseMessage.NULL_VALUE));
        return;
    }

    // 유저의 이름,아이디,패스워드를 저장
    const insertUserInfoQuery = 'INSERT INTO user(name,password,id) VALUES (?,?,?)';
    const insertUserInfoResult = await pool.queryParam_Arr(insertUserInfoQuery, [name, password, id]);

    if (!insertUserInfoResult) {
        res.status(statusCode.BAD_REQUEST).send(authUtil.successFalse(responseMessage.BAD_REQUEST));
        return;
    }

    res.status(statusCode.OK).send(authUtil.successTrue(responseMessage.SIGN_UP_SUCCESS));

});


module.exports = router;