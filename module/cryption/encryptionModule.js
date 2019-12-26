const crypto = require('crypto');

const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

const encryption = {
    encryption : (pw) => {
        return new Promise(async (resolve, reject) => {
            crypto.randomBytes(32, (err, buf) => {
                if (err) {
                    reject(err);
                }
                else {
                    const salt = buf.toString('base64');
                    const cipher = crypto.createCipher('aes-256-cbc', salt);
                    let hashedPW = cipher.update(pw, 'utf8', 'base64');
                    hashedPW += cipher.final('base64');
                    // console.log('암호화된 암호: ', hashedPW);

                    const result = {
                        "hashedPassword" : "",
                        "salt" : ""
                    };

                    result.hashedPassword = hashedPW;
                    result.salt = salt;

                    resolve(result);
                }
            })
            
        });
    }
};

module.exports = encryption;