const express = require('express');
const router = express.Router();

const statusCode = require('../module/utils/statusCode');
const responseMessage = require('../module/utils/responseMessage');
const authUtil = require('../module/utils/authUtil');
const pool = require('../module/db/pool');


/*
    [POST] /storefund
    가게 펀드 정보 입력
*/
router.post('/:storeIdx', async (req, res) => {
    const {
        customerCount,
        marginPercent,
        registerTime,
        dueDate,
        goalMoney,
        contributerCount,
        fundStatus,
    } = req.body;
    const {storeIdx} = req.params;
    if (!storeIdx || !customerCount || !marginPercent || !registerTime || !dueDate || !goalMoney){
        res.status(statusCode.BAD_REQUEST).send(authUtil.successFalse(responseMessage.NULL_VALUE));
        return;
    }

    // 이미 펀드 정보가 삽입된 가게 인덱스 조회
    const selectStoreIdxQuery = 'SELECT store_idx FROM store_fund WHERE store_idx = ?';
    const selectStoreIdxResult = await pool.queryParam_Arr(selectStoreIdxQuery, [storeIdx]);
    if (selectStoreIdxResult[0] != undefined) {
        res.status(statusCode.BAD_REQUEST).send(authUtil.successFalse(responseMessage.DUPLICATE_VALUE_ERROR));
        return;
    }
    
    // 가게의 펀드 정보(기존 고객 수, 마진율, 등록날짜, 마감기한, 목표매출, 펀딩인원, 진행상태)를 삽입
    const insertStoreFundInfoQuery = 'INSERT INTO store_fund(store_idx, customer_count, margin_percent, register_time, due_date, goal_money, contributer_count, fund_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    const insertStoreFundInfoResult = await pool.queryParam_Arr(insertStoreFundInfoQuery, [storeIdx, customerCount, marginPercent, registerTime, dueDate, goalMoney, contributerCount, fundStatus]);
    if (!insertStoreFundInfoResult) {
        res.status(statusCode.BAD_REQUEST).send(authUtil.successFalse(responseMessage.STORE_FUND_INSERT_FAILED));
        return;
    }
    res.status(statusCode.OK).send(authUtil.successTrue(responseMessage.STORE_FUND_SELECT_SUCCESS, insertStoreFundInfoResult));
});

/*
    [GET] /storefund
    가게 펀드 정보 조회
*/
router.get('/:storeIdx', async (req,res) => {
    const {
        storeIdx
    } = req.params;

    if(!storeIdx){
        res.status(statusCode.BAD_REQUEST).send(authUtil.successFalse(responseMessage.NULL_VALUE));
        return;
    }
    
    const selectStoreFundInfoQuery = 'SELECT * FROM store_fund WHERE store_idx = ?';
    const selectStoreFundInfoResult = await pool.queryParam_Arr(selectStoreFundInfoQuery, [storeIdx]);

    if(!selectStoreFundInfoResult){
        res.status(statusCode.BAD_REQUEST).send(authUtil.successFalse(responseMessage.BAD_REQUEST));
        return;
    }
    res.status(statusCode.OK).send(authUtil.successTrue(
        responseMessage.STORE_FUND_SELECT_SUCCESS,
        selectStoreFundInfoResult));
});


module.exports = router;