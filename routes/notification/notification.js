var express = require('express');
var router = express.Router();

const statusCode = require('../../module/utils/statusCode');
const responseMessage = require('../../module/utils/responseMessage');
const authUtil = require('../../module/utils/authUtil');
const pool = require('../../module/db/pool');

const jwt = require('../../module/auth/jwt');
const Notification = require('../../model/Notification');

/**
 * [GET] /notification/:userIdx
 * 모든 알림 조회
 * @author LeeSohee
 */
router.get('/', async (req, res) => {
    Notification.readAll()
    .then(({ code, json }) => {
        res.status(code).send(json);
    })
    .catch((err) => {
        console.log(err);
        res.status(statusCode.INTERNAL_SERVER_ERROR, authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    });
});

/**
 * [GET] /notification/:userIdx
 * 유저 알림 조회
 * @author LeeSohee
 * @param userIdx
 */
router.get('/', jwt.checkLogin, async (req, res) => {
    const {
        userIdx
    } = req.decoded.idx;

    Notification.readAllUserNoti(userIdx)
    .then(({ code, json }) => {
        res.status(code).send(json);
    })
    .catch((err) => {
        console.log(err);
        res.status(statusCode.INTERNAL_SERVER_ERROR, authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    });
});

module.exports = router;
