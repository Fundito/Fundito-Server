var express = require('express');
var router = express.Router();

/* GET home page. */
router.use('/signin', require('./signin'));
router.use('/signup', require('./signup'));
router.use('/user', require('./user'));
router.use('/friend', require('./friend'));

module.exports = router;
