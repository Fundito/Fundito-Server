const randToken = require('rand-token');
const jwt = require('jsonwebtoken');
const resMessage = require('../utils/responseMessage');
const statusCode = require('../utils/statusCode');
const authUtil = require('../utils/authUtil');
const {
    secretOrPrivateKey
} = require('../../config/secretKey');

const options = {
    algorithm: "HS256",
    expiresIn: "7d",
    issuer: "fundito"
};

const refreshOptions = {
    algorithm: "HS256",
    expiresIn: "14d",
    issuer: "fundito"
};

module.exports = {
    sign: (user) => {
        // 토큰 발급기
        const payload = {
            idx: user.idx
        };
        // 발급받은 refreshToken은 반드시 디비에 저장해야 한다.
        const result = {
            token: jwt.sign(payload, secretOrPrivateKey, options),
            refreshToken: randToken.uid(256)
        };
        return result;
    },
    publish: (payload) => {
        // 토큰 발급기 (토큰 재발급 개인화 가능)
        const token = jwt.sign(payload, secretOrPrivateKey, options);
        const refreshToken = jwt.sign({
            refreshToken: payload
        }, secretOrPrivateKey, refreshOptions);
        return {
            token,
            refreshToken
        };
    },
    verify: (token) => {
        // 토큰 식별기
        let decoded;
        try {
            decoded = jwt.verify(token, secretOrPrivateKey);
        } catch (err) {
            if (err.message === 'jwt expired') {
                // 파기된 토큰
                console.log('expired token');
                return -3;
            } else if (err.message === 'invalid token') {
                // 만료된 토큰
                console.log('invalid token');
                return -2;
            } else {
                // 만료된 토큰
                console.log("invalid token");
                return -2;
            }
        }
        return decoded;
    },
    refresh: (user) => {
        // 토큰 재발급
        const payload = {
            idx: user.idx
        };
        return jwt.sign(payload, secretOrPrivateKey, options);
    },
    checkLogin: async (req, res, next) => {
        // 토큰 판별기 (통신시 req, res 전에 넣을 것)
        var token = req.headers.token;

        if (!token) {
            return res.json(authUtil.successFalse(statusCode.BAD_REQUEST, resMessage.EMPTY_TOKEN));
        } else {
            const user = jwt.verify(token);

            if (user == -3) {
                return res.json(authUtil.successFalse(statusCode.UNAUTHORIZED, resMessage.EXPIRED_TOKEN));
            } else if (user == -2) {
                return res.json(authUtil.successFalse(statusCode.UNAUTHORIZED, resMessage.INVALID_TOKEN));
            } else {
                req.decoded = user;
                next();
            }
        }
    }
};