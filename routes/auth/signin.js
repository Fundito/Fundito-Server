var express = require('express');
var router = express.Router();
const passport = require('passport');
const statusCode = require('../../module/utils/statusCode');
const responseMessage = require('../../module/utils/responseMessage');
const authUtil = require('../../module/utils/authUtil');
const pool = require('../../module/db/pool');
const jwt = require('../../module/auth/jwt');
const request = require('request-promise');
// facebook modules
const FB = require('fb').default;
// var Facebook = require('fb').Facebook,
//     fb = new Facebook(options);

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
            console.log(data)
            req.body.id = data.id
            req.body.name = data.name
            // next();
        } else {
            res.status(500).json({
                message: "Internal server error",
                data: null
            })
        }
    });
});

router.post('/facebook-search', (req, res) => {
    // Graph api 검색 (전체)

    // 받아올 필드 값
    const userFieldSet = 'name, link, is_verified, picture';
    const pageFieldSet = 'name, category, link, picture, is_verified';
    const { queryTerm, searchType } = req.body;
    const { user_access_token } = req.body; // 엑세스 토큰 받기

    const options = {
        method: 'GET',
        uri: 'https://graph.facebook.com/search',
        qs: {
            access_token: user_access_token,
            q: queryTerm,
            type: searchType,
            fields: searchType === 'page' ? pageFieldSet : userFieldSet
        }
    };

    request(options)
        .then(fbRes => {
            const parsedRes = JSON.parse(fbRes).data;
            console.log(parsedRes);
            res.json(parsedRes);
        }).catch(err => {
            console.log(err);
        })
})

router.get('/facebook-search/:id', (req, res) => {
    // Graph api 검색 (단일)
    // 자세한 정보 요청가능 (user_relationships, about_me, location, website, photos, posts, email ...)
    // 사용자 엑세스 토큰이 없는경우 앱 엑세스 토큰을 사용가능

    // 받아올 필드 값
    const userFieldSet = 'id, name, about, email, accounts, link, is_verified, significant_other, relationship_status, website, picture, feed'; //photos, 
    const user_access_token = req.body.user_access_token; // 엑세스 토큰 받기
    console.log(user_access_token);
    const options = {
        method: 'GET',
        /*
        사용자가 사용하는 페이지 쿼리
        uri: `https://graph.facebook.com/v5.0/${req.params.id}/accounts`,
        */
        uri: `https://graph.facebook.com/v5.0/${req.params.id}`,
        qs: {
            access_token: user_access_token,
            fields: userFieldSet
            /*
            - 사진 얻기(최신사진URL 두장)
            type: 'user',
            fields: 'photos.limit(2).order(reverse_chronological){link, comments.limit(2).order(reverse_chronological)}'
            */
        }
    };
    request(options)
        .then(fbRes => {
            console.log(fbRes);
            res.json(fbRes);
        })
});

router.post('/facebook-text', async(req, res) => {
    // 텍스트 게시
    // id: 페이지 또는 유저 아이디
    // access_token: 페이지에 올릴거라면 페이지, 유저피드에 올릴거라면 유저
    const {id, access_token, text} = req.body;

    const postTextOptions = {
        method: 'POST',
        uri: `https://graph.facebook.com/v5.0/${id}/feed`,
        qs: {
            access_token: access_token,
            message: text
        }
    };
    // 사진올리기
    // const postImageOptions = {
    //     method: 'POST',
    //     uri: `https://graph.facebook.com/v5.0/${id}/photos`,
    //     qs: {
    //         access_token: access_token,
    //         caption: 'Caption goes here',
    //         url: 'Image url goes here'
    //     }
    // };
    await request(postTextOptions);
});

module.exports = router;
