var express = require('express');
var router = express.Router();

router.use('/fundlist', require('./fundlist'));
router.use('/card', require('./card'));
router.use('/point', require('./point'));


module.exports = router;
