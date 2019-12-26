const crypto = require('crypto');

const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

const encryption = {
    encryption : (pw) => {
        return new Promise(async (resolve, reject) => {
            // const salt = 'HbMtmFdroLU0arLpMflQ';
            // const cipher = crypto.createCipher('aes-256-cbc', salt);
            
            // const hashed = cipher.update(pw, 'utf8', 'base64'); // 'HbMtmFdroLU0arLpMflQ'
            // console.log(hashed.toString());
            // hashed += cipher.final('base64'); // 'HbMtmFdroLU0arLpMflQYtt8xEf4lrPn5tX5k+a8Nzw='
            
            // const result = {
            //     "hashedPassword" : "",
            //     "salt" : ""
            // };
            
            // result.hashedPassword = hashed.toString('base64');
            // result.salt = salt;
            // resolve(result);
            const cipher = await crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
            const encrypted = cipher.update(pw);
            encrypted = Buffer.concat([encrypted, cipher.final()]);

            const result = { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };

            resolve(result);
        });
    },
    onlyEncryption : (pw, salt) => {
        return new Promise((resolve, reject) => {
            // 생성된 랜덤 값으로 salt 암호화
            crypto.pbkdf2(pw, salt, 10, 32, 'SHA512', (err, hashed) => {
                if (err) {
                    reject(err);
                }
                else {
                    const result = {
                        "hashedPassword" : "",
                        "salt" : ""
                    };

                    result.hashedPassword = hashed.toString('base64');
                    result.salt = salt;
                    resolve(result);
                }
            })
        });
    }
};

module.exports = encryption;