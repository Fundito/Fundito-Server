var express = require('express');
var router = express.Router();

router.use('/auth', require('./auth'));
// router.use('/storefund', require('./storefund'));

module.exports = router;
