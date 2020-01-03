var request = require('request');
const resMessage = require('../utils/responseMessage');
const statusCode = require('../utils/statusCode');
const authUtil = require('../utils/authUtil');

module.exports = (req, res, next) => {
    var accessToken = req.headers.access_token;
    var api_url = 'https://graph.facebook.com/v5.0/me?access_token=' + accessToken + '&fields=id,name,friends, picture';
    var options = {
        url: api_url,
    };
    
    if (!accessToken) {
        return res.status(400).send(authUtil.successFalse(statusCode.BAD_REQUEST, resMessage.EMPTY_TOKEN));
    }

    request.get(options, (error, response, body) => {
        if (!error && response.statusCode == 200) {
            var data = JSON.parse(body)
            req.decoded = {
                id: data.id,
                name: data.name,
                photo: data.picture.data.url,
                friends: data.friends.data
            };
            next();
        } else {
            res.status(400).send(authUtil.successFalse(statusCode.BAD_REQUEST, resMessage.INVALID_TOKEN));
        }
    });
}
