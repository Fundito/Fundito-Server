var express = require('express');
var router = express.Router();

router.use('/auth', require('./auth'));
router.use('/storefund', require('./storefund'));
router.use('/mypage', require('./mypage'));
router.use('/storeInfo', require('./storeInfo'));

module.exports = router;