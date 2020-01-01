const statusCode = require('../module/utils/statusCode');
const responseMessage = require('../module/utils/responseMessage');
const authUtil = require('../module/utils/authUtil');
const pool = require('../module/db/pool');
const encryptionModule = require('../module/cryption/encryptionModule');
const decryptionModule = require('../module/cryption/decryptionModule');

const table = `card`;
const THIS_LOG = `카드`;
const USER_LOG = `카드 유저`

const card = {
    create: (userIdx, cardCompany, cardNickname, cardNumber, cardExpirationDate, cardPassword) => {
        return new Promise(async (resolve, reject) => {
            const userCardQuery = `SELECT * FROM ${table} WHERE user_idx = ?`;
            const userCardResult = await pool.queryParam_Arr(userCardQuery, [userIdx]);

            if (!userCardResult) {
                resolve({
                    code : statusCode.INTERNAL_SERVER_ERROR,
                    json : authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR,responseMessage.INTERNAL_SERVER_ERROR)
                });
                return;
            }
            if (userCardResult[0] != undefined) {
                resolve({
                    code : statusCode.BAD_REQUEST,
                    json : authUtil.successFalse(statusCode.BAD_REQUEST, responseMessage.ALREADY_X(USER_LOG))
                });
                return;
            }

            const cardEncryptionResult = await encryptionModule.encryption(cardNumber);
            const expirationDateEncryptionResult = await encryptionModule.encryption(cardExpirationDate);
            const passwordEncryptionResult = await encryptionModule.encryption(cardPassword);

            console.log(cardEncryptionResult);
            console.log(expirationDateEncryptionResult);
            console.log(passwordEncryptionResult);

            const cardCreateQuery = `INSERT INTO card(user_idx, card_company_name, card_nickname, card_number, card_expiration_date, card_password, card_salt, card_expiration_date_salt, card_password_salt) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            const cardCreateResult = await pool.queryParam_Arr(cardCreateQuery, [userIdx, cardCompany, cardNickname, cardEncryptionResult.hashedPassword, expirationDateEncryptionResult.hashedPassword, passwordEncryptionResult.hashedPassword, cardEncryptionResult.salt, expirationDateEncryptionResult.salt, passwordEncryptionResult.salt]);

            if (!cardCreateResult) {
                resolve({
                    code : statusCode.INTERNAL_SERVER_ERROR,
                    json : authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR,responseMessage.INTERNAL_SERVER_ERROR)
                });
                return;
            }

            resolve({
                code : statusCode.OK,
                json : authUtil.successTrue(statusCode.OK, responseMessage.CARD_CREATE_SUCCESS)
            });
        });
    },

    readAll: () => {
    },

    read: (userIdx) => {
        return new Promise(async (resolve, reject) => {
            const readCardQuery = `SELECT * FROM ${table} WHERE user_idx = ?`;
            const readCardResult = await pool.queryParam_Arr(readCardQuery, [userIdx]);

            const cardData = readCardResult[0];
            console.log(cardData);
            if (cardData == undefined) {
                resolve({
                    code : statusCode.BAD_REQUEST,
                    json : authUtil.successFalse(statusCode.BAD_REQUEST, responseMessage.NO_INDEX)
                });
                return;
            }

            //이름도 조회 할게요..
            const getUserNameQuery = `SELECT name FROM user WHERE user_idx = ${cardData.user_idx}`;
            const getUserNameResult = await pool.queryParam_None(getUserNameQuery);

            const cardNumberDecryptionResult = await decryptionModule.decryption(cardData.card_number, cardData.card_salt);

            const result = {
                "userName" : getUserNameResult[0].name,
                "cardNickname" : cardData.card_nickname,
                "cardCompany" : cardData.card_company_name,
                "cardNumber" : cardNumberDecryptionResult
            };

            resolve({
                code : statusCode.OK,
                json : authUtil.successTrue(statusCode.OK, responseMessage.X_READ_SUCCESS(THIS_LOG), result)
            });
        });
    },

    update: () => {

    },

    delete: (userIdx) => {
        return new Promise(async (resolve, reject) => {
            const userIdxQuery = `SELECT * FROM user WHERE user_idx = ?`;
            const userIdxResult = await pool.queryParam_Arr(userIdxQuery, [userIdx]);

            if (userIdxResult[0] == undefined) {
                resolve({
                    code : statusCode.BAD_REQUEST,
                    json : authUtil.successFalse(statusCode.BAD_REQUEST, `존재하지 않는 유저입니다`)
                });
                return;
            }

            const deleteCardQuery = `DELETE FROM ${table} WHERE user_idx = ?`;
            const deleteCardResult = await pool.queryParam_Arr(deleteCardQuery, [userIdx]);

            if (!deleteCardResult) {
                resolve({
                    code : statusCode.INTERNAL_SERVER_ERROR,
                    json : authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
                });
                return;
            }

            resolve({
                code : statusCode.OK,
                json : authUtil.successTrue(statusCode.OK, responseMessage.X_DELETE_SUCCESS(THIS_LOG))
            });
        });
    }
};

module.exports = card;