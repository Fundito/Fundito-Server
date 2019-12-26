const statusCode = require('../module/utils/statusCode');
const responseMessage = require('../module/utils/responseMessage');
const authUtil = require('../module/utils/authUtil');
const pool = require('../module/db/pool');
const encryptionModule = require('../module/cryption/encryptionModule');
const decryptionModule = require('../module/cryption/decryptionModule');

const table = `card`;
const THIS_LOG = `카드`;

const card = {
    create: (userIdx, cardNumber, cvc, password) => {
        return new Promise(async (resolve, reject) => {
            /*
            const cardEncryptionResult = await encryptionModule.encryption(cardNumber);
            const cvcEncryptionResult = await encryptionModule.encryption(cvc);
            const passwordEncryptionResult = await encryptionModule.encryption(password);


            const cardCreateQuery = `INSERT INTO card(user_idx, card_number, cvc, password, card_salt, cvc_salt, password_salt) VALUES(?, ?, ?, ?, ?, ?, ?)`;
            const cardCreateResult = await pool.queryParam_Arr(cardCreateQuery, [userIdx, cardEncryptionResult.hashedPassword, cvcEncryptionResult.hashedPassword, passwordEncryptionResult.hashedPassword, cardEncryptionResult.salt, cvcEncryptionResult.salt, passwordEncryptionResult.salt]);

            if (!cardCreateResult) {
                resolve({
                    code : statusCode.INTERNAL_SERVER_ERROR,
                    json : authUtil.successFalse(responseMessage.INTERNAL_SERVER_ERROR)
                });
                return;
            }

            resolve({
                code : statusCode.OK,
                json : authUtil.successTrue(responseMessage.CARD_CREATE_SUCCESS)
            });
            */
        });
    },

    readAll: () => {
    },

    read: (cardIdx) => {
        return new Promise(async (resolve, reject) => {
            /*
            const readCardQuery = `SELECT * FROM ${table} WHERE card_idx = ?`;
            const readCardResult = await pool.queryParam_Arr(readCardQuery, [cardIdx]);

            const cardData = readCardResult[0];


            const decryptionResult = await decryptionModule.decryption(cardData.card_number, cardData.card_salt);
            console.log(decryptionResult);

            resolve({
                code : statusCode.OK,
                json : authUtil.successTrue(responseMessage.X_READ_SUCCESS(THIS_LOG))
            });
            */
        });
    },

    update: () => {

    },

    delete: (userIdx, cardIdx) => {
        return new Promise(async (resolve, reject) => {
            const deleteCardQuery = `DELETE FROM ${table} WHERE user_idx = ? AND card_idx = ?`;
            const deleteCardResult = await pool.queryParam_Arr(deleteCardQuery, [userIdx, cardIdx]);

            if (!deleteCardResult) {
                resolve({
                    code : statusCode.INTERNAL_SERVER_ERROR,
                    json : authUtil.successFalse(responseMessage.INTERNAL_SERVER_ERROR)
                });
                return;
            }

            resolve({
                code : statusCode.OK,
                json : authUtil.successTrue(responseMessage.X_DELETE_SUCCESS(THIS_LOG))
            });
        });
    }
};

module.exports = card;