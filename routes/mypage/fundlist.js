var express = require('express');
var router = express.Router();

const statusCode = require('../../module/utils/statusCode');
const responseMessage = require('../../module/utils/responseMessage');
const authUtil = require('../../module/utils/authUtil');
const pool = require('../../module/db/pool');

/**
 * [GET] mypage/fundlist
 * 내 투자내역 조회
 * @author ChoSooMin
 * @param user_idx
 */
router.get('/:userIdx', async (req, res) => {
    const {
        userIdx
    } = req.params;

    if (!userIdx) {
        res.status(statusCode.BAD_REQUEST).send(authUtil.successFalse(responseMessage.NULL_VALUE));
        return;
    }

    const getMyFundListQuery = `SELECT * FROM funding WHERE user_idx = ?`;
    const getMyFundListResult = await pool.queryParam_Arr(getMyFundListQuery, [userIdx]);

    if (!getMyFundListResult) {
        res.status(statusCode.BAD_REQUEST).send(authUtil.successFalse(responseMessage.BAD_REQUEST));
        return;
    }

    res.status(statusCode.OK).send(authUtil.successTrue(
        responseMessage.MYPAGE_FUNDLIST_SELECT_SUCCESS,
        getMyFundListResult));
});

module.exports = router;
