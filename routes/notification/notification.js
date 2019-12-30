var express = require('express');
var router = express.Router();

const statusCode = require('../../module/utils/statusCode');
const responseMessage = require('../../module/utils/responseMessage');
const authUtil = require('../../module/utils/authUtil');
const pool = require('../../module/db/pool');

const Notification = require('../../model/Notification');

/**
 * [GET] /notification/:userIdx
 * 알림 전체 조회
 * @author LeeSohee
 * @param userIdx
 */
router.get('/:userIdx', async (req, res) => {
    const {
        userIdx,
    } = req.params;

    Notification.readAll(userIdx)
    .then(({ code, json }) => {
        res.status(code).send(json);
    })
    .catch((err) => {
        console.log(err);
        res.status(statusCode.INTERNAL_SERVER_ERROR, authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    });
});

module.exports = router;
