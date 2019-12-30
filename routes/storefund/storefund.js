const express = require('express');
const router = express.Router();

const hangul = require('hangul-js');

const statusCode = require('../../module/utils/statusCode');
const responseMessage = require('../../module/utils/responseMessage');
const authUtil = require('../../module/utils/authUtil');
const StoreFund = require('../../model/StoreFund');
const jwt = require('../../module/auth/jwt');

/**
 * [POST] /storefund
 * 가게 펀드 정보 입력
 * @author LeeSohee, ChoSooMin
 * @header token
 * @param storeIdx
 * @body marginPercent, regularMoney, goalMoney
 */
router.post('/:storeIdx', jwt.checkLogin, async (req, res) => {
    try {
        const {
            marginPercent,
            regularMoney,
            goalMoney
        } = req.body;
        const {
            storeIdx
        } = req.params;

        if (!storeIdx  || !marginPercent || !regularMoney || !goalMoney) {
            res.status(statusCode.BAD_REQUEST).send(authUtil.successFalse(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
            return;
        }

        StoreFund.create(storeIdx, marginPercent, regularMoney,  goalMoney)
            .then(({
                code,
                json
            }) => {
                res.status(code).send(json);
            })
            .catch((err) => {
                console.log(err);
                res.status(statusCode.INTERNAL_SERVER_ERROR).send(authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
            });

        } catch (err) {
                console.log(err);
        };
});

/**
 * [GET] /storefund/search?keyword={타이핑 시 검색어}
 * 식당 검색
 * @author 100yeeun
 * @header token
 * @params 검색키워드
 */
router.get('/search', jwt.checkLogin, async(req, res) => {
    StoreFund.readAllName()
    .then(({ result, code }) => {

        if (req.query.keyword == undefined){
            res.status(statusCode.BAD_REQUEST).send(authUtil.successFalse(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
            return;
        }
        const searcher = new hangul.Searcher(req.query.keyword);

        const findStoreNameList = new Array();

		for (var i =0 ; i<result.length; i++){
			if (searcher.search(result[i].name)>=0){
				findStoreNameList.push(result[i]); 
			}
		}

        const json = authUtil.successTrue(statusCode.OK, responseMessage.X_READ_SUCCESS('검색'), findStoreNameList)

        
        res.status(code).send(json);
    })
    .catch((err) => {
        console.log(err);
        res.status(statusCode.INTERNAL_SERVER_ERROR, authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    });
});

/**
 * [GET] /storefund/:storeIdx
 * 가게 펀드 정보 조회
 * @author LeeSohee
 * @header token
 * @param storeIdx
 */
router.get('/:storeIdx', jwt.checkLogin, async (req,res) => {
    try {
        const {
            storeIdx
        } = req.params;

        if (!storeIdx) {
            res.status(statusCode.BAD_REQUEST).send(authUtil.successFalse(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
            return;
        }

        StoreFund.read(storeIdx)
            .then(({
                code,
                json
            }) => {
                res.status(code).send(json);
            })
            .catch((err) => {
                console.log(err);
                res.status(statusCode.INTERNAL_SERVER_ERROR).send(authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
            })
    } catch (err) {
        console.log(err);
    };
});

/**
 * [GET] /storefund
 * 모든 펀드 정보 조회
 * @header token
 * @author ChoSooMin
 */
router.get('/', jwt.checkLogin, async(req, res) => {
    StoreFund.readAll()
    .then(({ code, json }) => {
        res.status(code).send(json);
    })
    .catch((err) => {
        console.log(err);
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    });
});

/**
 * [UPDATE] /storefund/:storeIdx
 * 해당 가게의 정보 수정
 * @author ChoSooMin
 * @header token
 * @param storeIdx
 * @body customerCount, marginPercent, goalMoney
 */
router.put('/:storeIdx', jwt.checkLogin, async(req, res) => {
    const {
        customerCount,
        marginPercent,
        goalMoney
    } = req.body;

    const { storeIdx } = req.params;

    if (!customerCount || !marginPercent || !goalMoney) {
        res.status(statusCode.BAD_REQUEST).send(authUtil.successFalse(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
        return;
    }

    StoreFund.update(storeIdx, customerCount, marginPercent, goalMoney)
    .then(({ code, json }) => {
        res.status(code).send(json);
    })
    .catch((err) => {
        console.log(err);
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    });
});

/**
 * [DELETE] /storefund/:storeIdx
 * 해당 가게의 펀드 정보 삭제
 * @author ChoSooMin
 * @header token
 * @param storeIdx
 */
router.delete('/:storeIdx', jwt.checkLogin, async(req, res) => {
    const {
        storeIdx
    } = req.params;

    StoreFund.delete(storeIdx)
    .then(({ code, json }) => {
        res.status(code).send(json);
    })
    .catch((err) => {
        console.log(err);
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    });
});

module.exports = router;