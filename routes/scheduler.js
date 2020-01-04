const csvManager = require('../module/cronManager');
const moment = require('moment');
const storeFund = require('../model/StoreFund');

// 하루에 한 번 마감기한 확인, 마감 기한이 지났으면 성공 여부 결정
const idx1 = csvManager.addTask('*/2 * * * *', async () => {
    console.log(`2분 마다 실행`, moment().format());

    storeFund.checkDueDate()
        .then(({
            code,
            json
        }) => {
            res.status(code).send(json);
        })
        .catch((err) => {
            console.log(err);
            res.status(statusCode.INTERNAL_SERVER_ERROR, authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
        });
});

csvManager.startTask(idx1);
