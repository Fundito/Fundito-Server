const crypto = require('crypto');

const decryption = {
    decryption : (encryptedString, salt) => {
        return new Promise((resolve, reject) => {
            // const decipher = crypto.createDecipher('ase-128-ecb', salt);

            // decipher.update(encryptedString, 'base64', 'utf8');
            // const decipheredOutput = decipher.final('utf8');
            // const decipheredPainText = decipher.update(encryptedString, 'base64', 'buffer');
            // decipheredPainText += decipher.final('buffer');

            const decipher = crypto.createDecipher('aes-256-cbc', salt);
            let result2 = decipher.update(encryptedString, 'base64', 'utf8'); // 암호화할문 (base64, utf8이 위의 cipher과 반대 순서입니다.)
            result2 += decipher.final('utf8'); // 암호화할문장 (여기도 base64대신 utf8)
            
            resolve(result2);
        });
    },
    // onlyDecryption : (pw, salt) => {
    //     return new Promise((resolve, reject) => {
    //         // 생성된 랜덤 값으로 salt 암호화
    //         crypto.pbkdf2(pw, salt, 10, 32, 'SHA512', (err, hashed) => {
    //             if (err) {
    //                 reject(err);
    //             }
    //             else {
    //                 const result = {
    //                     "hashedPassword" : "",
    //                     "salt" : ""
    //                 };

    //                 result.hashedPassword = hashed.toString('base64');
    //                 result.salt = salt;
    //                 resolve(result);
    //             }
    //         })
    //     });
    // }
};

module.exports = decryption;