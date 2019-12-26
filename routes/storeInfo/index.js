var express = require('express');
var router = express.Router();

router.use('/',require('./storeInfo'));

module.exports = router;
