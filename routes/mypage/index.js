var express = require('express');
var router = express.Router();

router.use('/fund', require('./fund'));
router.use('/card', require('./card'));
router.use('/point', require('./point'));
router.use('/fundlist', require('./fundlist'));

module.exports = router;
