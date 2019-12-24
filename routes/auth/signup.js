const express = require('express');
const router = express.Router();
const statusCode = require('../../module/utils/statusCode');
const responseMessage = require('../../module/utils/responseMessage');
const authUtil = require('../../module/utils/authUtil');
const pool = require('../../module/db/pool');

const THIS_LOG = '회원가입';

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
        res.status(statusCode.BAD_REQUEST).send(responseMessage.NULL_VALUE);
        return;
    }

    const insertSql = 'INSERT INTO user(name,password,id) VALUES (?,?,?)';
    const result = await pool.queryParam_Arr(insertSql, [name, password, id]);

    if (!result) {
        res.status(statusCode.BAD_REQUEST).send(responseMessage.BAD_REQUEST);
        return;
    }

    res.status(statusCode.OK).send(responseMessage.SIGN_UP_SUCCESS);

});


module.exports = router;