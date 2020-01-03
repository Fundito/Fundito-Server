var express = require('express');
var router = express.Router();

router.use('/', require('./funding'));

module.exports = router;
