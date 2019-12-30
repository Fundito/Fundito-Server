const statusCode = require('../module/utils/statusCode');
const responseMessage = require('../module/utils/responseMessage');
const authUtil = require('../module/utils/authUtil');
const pool = require('../module/db/pool');

module.exports = {
    readAll: () => {

    },

    createAll: (userIdx, friends) => {
        return new Promise( async(resolve, reject) => {

            console.log(friends);
            let friendsId = []
            for (i of friends) {
                friendsId.push(i.id);
            }
            // 친구들의 idx를 불러옴
            const getUserIdxQuery = `SELECT user_idx FROM user WHERE id IN (${friendsId.join()})`;
            const getUserIdxResult = await pool.queryParam_Parse(getUserIdxQuery);
            console.log(getUserIdxResult);

            let friendIdx = [];
            let friendsIdx = [];
            for (i of getUserIdxResult) {
                friendIdx.push([userIdx, i.user_idx]);
                friendsIdx.push(i.user_idx);
            }
            console.log(friendIdx)
            // 그 값이 friend 테이블에서 이미 있는 값인지 검사 (friend1_idx, friend2_idx)
            // 없는 값만 저장
            // const insertFriendIdxQuery = `INSERT INTO friend (user_idx, friends_idx) VALUES ?`;
            const insertFriendIdxQuery = `INSERT INTO friend (user_idx, friends_idx) SELECT ? FROM DUAL WHERE NOT EXISTS (SELECT friends_idx FROM friend WHERE friends_idx IN (?)) LIMIT 1`;
            const insertFriendIdxResult = await pool.queryParam_Parse(insertFriendIdxQuery, [friendIdx, friendsIdx]);
            console.log(insertFriendIdxResult);
        })
    }
}