var express = require('express');
var router = express.Router();

router.use('/notification', require('./notification'));

module.exports = router;
