var express = require('express');
var router = express.Router();

router.use('/fundlist', require('./fundlist'));

module.exports = router;
