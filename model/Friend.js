const statusCode = require('../module/utils/statusCode');
const responseMessage = require('../module/utils/responseMessage');
const authUtil = require('../module/utils/authUtil');
const pool = require('../module/db/pool');

module.exports = {
    readAll: (userIdx) => {
        return new Promise(async (resolve, reject) => {
            const getFriendIdxQuery = `SELECT friends_idx FROM friend WHERE user_idx = '${userIdx}'`;
            const getFriendInfoQuery = `SELECT user_idx, id, name, nickname FROM user WHERE user_idx IN (${getFriendIdxQuery})`
            const getFriendInfoResult = await pool.queryParam_Parse(getFriendInfoQuery);
            if (!getFriendInfoResult) {
                resolve({
                    code: statusCode.DB_ERROR,
                    json: authUtil.successFalse(statusCode.DB_ERROR, responseMessage.X_READ_ALL_FAIL("친구"))
                });
                return;
            } else if (getFriendInfoResult[0] == null) {
                resolve({
                    code: statusCode.OK,
                    json: authUtil.successFalse(statusCode.DB_ERROR, responseMessage.NO_X("친구"))
                });
                return;
            } else {
                resolve({
                    code: statusCode.OK,
                    json: authUtil.successTrue(statusCode.OK, responseMessage.X_READ_ALL_SUCCESS("친구"), getFriendInfoResult)
                });
                return;
            }
        })
    },

    createAll: (userIdx, friends) => {
        return new Promise(async(resolve, reject) => {

            let friendsId = []
            for (i of friends) {
                friendsId.push(i.id);
            }
            // 친구들의 idx를 불러옴
            const getUserIdxQuery = `SELECT user_idx FROM user WHERE id IN (${friendsId.join()})`;
            const getUserIdxResult = await pool.queryParam_Parse(getUserIdxQuery);

            let friendIdx = [];
            for (i of getUserIdxResult) {
                friendIdx.push([userIdx, i.user_idx]);
            }

            const insertFriendTransaction = await pool.Transaction( async(con) => {
                const insertFriendIdxQuery = `INSERT INTO friend (user_idx, friends_idx) VALUES ?`;
                const insertFriendIdxResult = await con.query(insertFriendIdxQuery, [friendIdx]);
                const deleteDuplicateQuery = `DELETE f1 FROM friend f1, friend f2 WHERE f1.friend_idx > f2.friend_idx AND f1.friends_idx = f2.friend_idx`;
                const deleteDuplicateResult = await con.query(deleteDuplicateQuery);
            })
            
            if(insertFriendTransaction === undefined){
                resolve({
                    code: statusCode.DB_ERROR,
                    json: authUtil.successFalse(statusCode.DB_ERROR, responseMessage.X_CREATE_FAIL("친구"))
                });
                return;
            } else {
                resolve({
                    code: statusCode.OK,
                    json: authUtil.successTrue(statusCode.OK, responseMessage.X_CREATE_SUCCESS("친구"))
                });
                return;
            }
        });
    }
}