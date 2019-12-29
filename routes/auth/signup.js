const express = require('express');
const router = express.Router();
const statusCode = require('../../module/utils/statusCode');
const responseMessage = require('../../module/utils/responseMessage');
const authUtil = require('../../module/utils/authUtil');
const pool = require('../../module/db/pool');
const encrypt = require('../../module/auth/encryption');

/*
    [POST] auth/signup
    회원가입
 */
router.post('/', async (req,res) => {
    try {
    const {
        name,
        password,
        id,
        point
    } = req.body;

    if (!name || !password || !id || !point){
        res.status(statusCode.BAD_REQUEST).send(authUtil.successFalse(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
        return;
    }

    const {salt, hashed }= await encrypt.encrypt(password);

    // 유저의 이름,아이디,패스워드를 저장
    const insertUserInfoQuery = 'INSERT INTO user(name,password,id,salt,point) VALUES (?,?,?,?,?)';
    const insertUserInfoResult = await pool.queryParam_Arr(insertUserInfoQuery, [name, hashed, id, salt, point]);

    if (!insertUserInfoResult) {
        res.status(statusCode.BAD_REQUEST).send(authUtil.successFalse(statusCode.BAD_REQUEST, "DB ERROR"));
        return;
    }

    res.status(statusCode.OK).send(authUtil.successTrue(statusCode.OK, responseMessage.SIGN_UP_SUCCESS));
    } catch (e) {
        console.log(e.message);
        
    }
});


module.exports = router;