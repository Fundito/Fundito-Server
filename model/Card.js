const statusCode = require('../module/utils/statusCode');
const responseMessage = require('../module/utils/responseMessage');
const authUtil = require('../module/utils/authUtil');
const pool = require('../module/db/pool');
const encryptionModule = require('../module/cryption/encryptionModule');
const decryptionModule = require('../module/cryption/decryptionModule');

const table = `card`;
const THIS_LOG = `카드`;

const card = {
    create: (userIdx, cardCompany, cardNickname, cardNumber, cvc, password) => {
        return new Promise(async (resolve, reject) => {
            const cardEncryptionResult = await encryptionModule.encryption(cardNumber);
            const cvcEncryptionResult = await encryptionModule.encryption(cvc);
            const passwordEncryptionResult = await encryptionModule.encryption(password);

            console.log(cardEncryptionResult);
            console.log(cvcEncryptionResult);
            console.log(passwordEncryptionResult);

            const cardCreateQuery = `INSERT INTO card(user_idx, card_company_name, card_nickname, card_number, cvc, card_password, card_salt, cvc_salt, card_password_salt) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            const cardCreateResult = await pool.queryParam_Arr(cardCreateQuery, [userIdx, cardCompany, cardNickname, cardEncryptionResult.hashedPassword, cvcEncryptionResult.hashedPassword, passwordEncryptionResult.hashedPassword, cardEncryptionResult.salt, cvcEncryptionResult.salt, passwordEncryptionResult.salt]);

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

    read: (cardIdx) => {
        return new Promise(async (resolve, reject) => {
            const readCardQuery = `SELECT * FROM ${table} WHERE card_idx = ?`;
            const readCardResult = await pool.queryParam_Arr(readCardQuery, [cardIdx]);

            const cardData = readCardResult[0];
            console.log(cardData);
            if (cardData == undefined) {
                resolve({
                    code : statusCode.BAD_REQUEST,
                    json : authUtil.successFalse(statusCode.BAD_REQUEST, responseMessage.NO_INDEX)
                });
                return;
            }

            const cardNumberDecryptionResult = await decryptionModule.decryption(cardData.card_number, cardData.card_salt);

            const result = {
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

    delete: (userIdx, cardIdx) => {
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

            const deleteCardQuery = `DELETE FROM ${table} WHERE user_idx = ? AND card_idx = ?`;
            const deleteCardResult = await pool.queryParam_Arr(deleteCardQuery, [userIdx, cardIdx]);

            if (!deleteCardResult) {
                resolve({
                    code : statusCode.INTERNAL_SERVER_ERROR,
                    json : authUtil.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
                });
                return;
            }

            if (deleteCardResult[0] == undefined) {
                resolve({
                    code : statusCode.BAD_REQUEST,
                    json : authUtil.successFalse(statusCode.BAD_REQUEST, `존재하지 않는 카드입니다`)
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