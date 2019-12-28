var express = require('express');
var router = express.Router();

router.use('/', require('./storefund'));
router.use('/timeline', require('./timeline'));


module.exports = router;
