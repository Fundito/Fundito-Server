var express = require('express');
var router = express.Router();

router.use('/fundlist', require('./fundlist'));
router.use('/card', require('./card'));

module.exports = router;
