var express = require('express');
var router = express.Router();

const statusCode = require('../../module/utils/statusCode');
const responseMessage = require('../../module/utils/responseMessage');
const authUtil = require('../../module/utils/authUtil');
const pool = require('../../module/db/pool');

const jwt = require('../../module/auth/jwt');
const Notification = require('../../model/Notification');

/**
 * [GET] /notification/all
 * 모든 알림 조회
 * @author LeeSohee
 * @header token
 */
router.get('/all', jwt.checkLogin, async (req, res) => {
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
 * [GET] /notification
 * 유저 알림 조회
 * @author LeeSohee
 * @header token
 */
router.get('/', jwt.checkLogin, async (req, res) => {
    const userIdx = req.decoded.idx;

    Notification.readUserAllNoti(userIdx)
    .then(({ code, json }) => {
        res.status(code).send(json);
    })
    .catch((err) => {
        console.log(err);
        res.status(statusCode.INTERNAL_SERVER_ERROR, authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    });
});

/**
 * [DELETE] /notification
 * 유저 알림 삭제 (리워드 회수 시)
 * @author LeeSohee
 * @header token
 */
router.delete('/:notification_idx', jwt.checkLogin, async (req, res) => {
    const {
        notificationIdx 
    } = req.params.notification_idx;

    Notification.delete(notificationIdx)
    .then(({ code, json }) => {
        res.status(code).send(json);
    })
    .catch((err) => {
        console.log(err);
        res.status(statusCode.INTERNAL_SERVER_ERROR, authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    });
});

module.exports = router;
