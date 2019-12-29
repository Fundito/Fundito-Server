var express = require('express');
var router = express.Router();

var Funding = require('../../model/Funding');

router.get('/:storeIdx', async(req, res) => {
    Funding.readTimeline(req.params.storeIdx)
    .then(({ code, json }) => {
        res.status(code).send(json);
    })
    .catch((err) => {
        console.log(err);
        res.status(statusCode.INTERNAL_SERVER_ERROR, authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    });
});

module.exports = router;
