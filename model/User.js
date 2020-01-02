const statusCode = require('../module/utils/statusCode');
const responseMessage = require('../module/utils/responseMessage');
const authUtil = require('../module/utils/authUtil');
const pool = require('../module/db/pool');
const encryptionModule = require('../module/cryption/encryptionModule');
const jwt = require('../module/auth/jwt');
const Friend = require('../model/Friend');
const table = `user`;
const THIS_LOG = `사용자`;

const user = {
    login: (id, name, firebase_token) => {
        return new Promise(async (resolve, reject) => {
            if (!id || !name) {
                resolve({
                    code: statusCode.BAD_REQUEST,
                    json: authUtil.successFalse(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE)
                });
                return;
            }

            if (!firebase_token) {
                resolve({
                    code: statusCode.BAD_REQUEST,
                    json: authUtil.successFalse(statusCode.BAD_REQUEST, responseMessage.EMPTY_TOKEN)
                });
                return;
            }

            const getUserIndexQuery = `SELECT user_idx FROM user WHERE id = '${id}' AND name = '${name}'`;
            const getUserIndexResult = await pool.queryParam_Parse(getUserIndexQuery);
            
            if (getUserIndexResult[0] === undefined) {
                resolve({
                    code: statusCode.UNAUTHORIZED,
                    json: authUtil.successFalse(statusCode.UNAUTHORIZED, responseMessage.NO_X("user") + ` [${name}]`)
                });
                return;
            } else {
                const token = jwt.sign(getUserIndexResult[0].user_idx);

                const putFirebaseTokenQuery = `UPDATE user SET firebase_token = ? WHERE user_idx = ?`;
                const putFirebaseTokenResult = await pool.queryParam_Arr(putFirebaseTokenQuery, [firebase_token, getUserIndexResult[0].user_idx]);

                if(!putFirebaseTokenResult) {
                    resolve({
                        code: statusCode.INTERNAL_SERVER_ERROR,
                        json: authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
                    });
                    return;
                }

                resolve({
                    code: statusCode.OK,
                    json: authUtil.successTrue(statusCode.OK, responseMessage.SIGN_IN_SUCCESS, token)
                });
                return;
            }
        })
    },

    signup: (id, name, nickname, pay_password, friends, photo) => {
        return new Promise(async (resolve, reject) => {
            if (!name || !pay_password || !id || !nickname) {
                resolve({
                    code: statusCode.BAD_REQUEST,
                    json: authUtil.successFalse(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE)
                });
                return;
            }
            const getNicknameQuery = `SELECT user_idx FROM user WHERE nickname = '${nickname}'`;
            const getNicknameResult = await pool.queryParam_None(getNicknameQuery);

            if (getNicknameResult[0] != null) {
                resolve({
                    code: statusCode.BAD_REQUEST,
                    json: authUtil.successFalse(statusCode.BAD_REQUEST, responseMessage.ALREADY_X("닉네임"))
                });
                return;
            }
            const {
                salt,
                hashedPassword
            } = await encryptionModule.encryption(pay_password);

            // 유저의 이름,아이디,패스워드를 저장
            const insertUserInfoQuery = 'INSERT INTO user(id, name, nickname, pay_password, salt) VALUES (?, ?, ?, ?, ?, ?)';
            const insertUserInfoResult = await pool.queryParam_Arr(insertUserInfoQuery, [id, name, nickname, hashedPassword, salt, photo]);

            Friend.createAll(insertUserInfoResult.insertId, friends);

            if (insertUserInfoResult.affectedRows == 1) {
                const token = jwt.sign(insertUserInfoResult.insertId);
                resolve({
                    code: statusCode.CREATED,
                    json: authUtil.successTrue(statusCode.CREATED, responseMessage.SIGN_UP_SUCCESS, token)
                });
                return;
            } else {
                resolve({
                    code: statusCode.DB_ERROR,
                    json: authUtil.successFalse(statusCode.DB_ERROR, responseMessage.DB_ERROR)
                })
                return;
            }
        });
    },

    read: (userIdx) => {
        return new Promise(async (resolve, reject) => {
            const getCertainUserQuery = `SELECT name, nickname, photo, point FROM ${table} WHERE user_idx = ?`;
            const getCertainUserResult = await pool.queryParam_Arr(getCertainUserQuery, [userIdx]);

            if (!getCertainUserResult) {
                resolve({
                    code: statusCode.INTERNAL_SERVER_ERROR,
                    json: authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
                });
                return;
            }
            resolve({
                code: statusCode.OK,
                json: authUtil.successTrue(statusCode.OK, responseMessage.X_READ_SUCCESS(THIS_LOG), getCertainUserResult[0])
            });
        });
    },

    readPoint: (userIdx) => {
        return new Promise(async (resolve, reject) => {
            const getUserPointQuery = `SELECT point FROM ${table} WHERE user_idx = ${userIdx}`;
            const getUserPointResult = await pool.queryParam_None(getUserPointQuery);

            if (getUserPointResult[0] == undefined) {
                resolve({
                    code: statusCode.BAD_REQUEST,
                    json: authUtil.successFalse(statusCode.BAD_REQUEST, responseMessage.NO_INDEX)
                });
                return;
            }

            if (!getUserPointResult) {
                resolve({
                    code: statusCode.INTERNAL_SERVER_ERROR,
                    json: authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
                });
                return;
            }

            resolve({
                code: statusCode.OK,
                json: authUtil.successTrue(statusCode.OK, responseMessage.X_READ_SUCCESS(THIS_LOG), getUserPointResult)
            });
        });
    },

    updatePoint: (userIdx, point, payPassword) => {
        return new Promise(async (resolve, reject) => {
            const putUserPointQuery = `UPDATE ${table} SET point = ? WHERE user_idx = ${userIdx}`;
            const getCertainUserQuery = `SELECT * FROM ${table} WHERE user_idx = ?`;

            const getCertainUserResult = await pool.queryParam_Arr(getCertainUserQuery, [userIdx]);

            if (!getCertainUserResult) {
                resolve({
                    code: statusCode.INTERNAL_SERVER_ERROR,
                    json: authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
                });
                return;
            } else {

                if (getCertainUserResult[0] == undefined) {
                    resolve({
                        code: statusCode.BAD_REQUEST,
                        json: authUtil.successFalse(statusCode.BAD_REQUEST, responseMessage.NO_INDEX)
                    });
                    return;
                }

                const checkPayPasswordEncryptionResult = await encryptionModule.encryptionWithSalt(payPassword, getCertainUserResult[0].salt);

                if (getCertainUserResult[0].pay_password == checkPayPasswordEncryptionResult ) {
                    const putUserPointResult = await pool.queryParam_Arr(putUserPointQuery,[Number(point) + Number(getCertainUserResult[0].point)]);
                    resolve ({
                        code : statusCode.OK,
                        json : authUtil.successTrue(statusCode.OK, responseMessage.X_UPDATE_SUCCESS(THIS_LOG), putUserPointResult)
                    });
                } else {
                    resolve({
                        code: statusCode.UNAUTHORIZED,
                        json: authUtil.successTrue(statusCode.UNAUTHORIZED, responseMessage.MISS_MATCH_PASSWORD)
                    });
                }
            }
        });
    },

    updatePointWithoutPassword : (userIdx, point) => {
        return new Promise (async (resolve, reject) => {
            const updatePointQuery = `UPDATE ${table} SET point = ? WHERE user_idx = ?`;
            const getCertainUserQuery = `SELECT * FROM ${table} WHERE user_idx = ?`;

            const getCertainUserResult = await pool.queryParam_Arr(getCertainUserQuery, [userIdx]);

            if (!getCertainUserResult) {
                resolve({
                    code : statusCode.INTERNAL_SERVER_ERROR,
                    json : authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
                });
                return;
            } else {

                if (getCertainUserResult[0] == undefined) {
                    resolve({
                        code : statusCode.BAD_REQUEST,
                        json : authUtil.successFalse(statusCode.BAD_REQUEST, responseMessage.NO_INDEX)
                    });
                    return;
                }

                const updatePointResult = await pool.queryParam_Arr(updatePointQuery,[Number(point) + Number(getCertainUserResult[0].point), userIdx]);
                if (!updatePointResult) {
                    resolve({
                        code : statusCode.INTERNAL_SERVER_ERROR,
                        json : authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
                    });
                    return;
                } else {
                    resolve({
                        code : statusCode.OK,
                        json : authUtil.successTrue(statusCode.OK, responseMessage.X_UPDATE_SUCCESS(THIS_LOG))
                    });
                }
            }
        });
    },

    withdrawPoint : (userIdx, storeIdx) => {
        return new Promise (async (resolve, reject) => {

            const updateIsWithdrawQuery = `UPDATE funding SET is_withdraw = 1 WHERE user_idx = ${userIdx} AND store_idx = ${storeIdx}`;
            const updateIsWithdrawResult = await pool.queryParam_Arr(updateIsWithdrawQuery);
            if(!updateIsWithdrawResult){
                resolve({
                    code : statusCode.INTERNAL_SERVER_ERROR,
                        json : authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
                });
                return;
            } else {
                resolve({
                    code : statusCode.OK,
                    json : authUtil.successTrue(statusCode.OK, responseMessage.X_UPDATE_SUCCESS(THIS_LOG))
                });
            }
        });
    },

    delete : () => {

    }
};

module.exports = user;
