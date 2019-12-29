var express = require('express');
var router = express.Router();
const passport = require('passport');
const statusCode = require('../../module/utils/statusCode');
const responseMessage = require('../../module/utils/responseMessage');
const authUtil = require('../../module/utils/authUtil');
const pool = require('../../module/db/pool');
const jwt = require('../../module/auth/jwt');
const request = require('request-promise');

router.get('/facebook', (req, res) => {
    var accessToken = req.headers.access_token;
    var api_url = 'https://graph.facebook.com/v5.0/me?access_token=' + accessToken + '&fields=id,name,friends';
    var request = require('request');
    var options = {
        url: api_url,
    };
    request.get(options, (error, response, body) => {
        if (!error && response.statusCode == 200) {
            var data = JSON.parse(body)
            console.log(data.friends.data)
            req.body.id = data.id
            req.body.name = data.name
        } else {
            res.status(500).json({
                message: "Internal server error",
                data: null
            })
        }
    });
    console.log(req.body.id)
});


module.exports = router;
