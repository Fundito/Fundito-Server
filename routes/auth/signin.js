var express = require('express');
var router = express.Router();
const passport = require('passport');
const statusCode = require('../../module/utils/statusCode');
const responseMessage = require('../../module/utils/responseMessage');
const authUtil = require('../../module/utils/authUtil');
const pool = require('../../module/db/pool');
const jwt = require('../../module/auth/jwt');
const request = require('request-promise');
const fb = require('../../module/auth/fb-jwt');

router.get('/facebook',fb.login, (req, res) => 
    console.log(req.decoded)
);


module.exports = router;
