const crypto = require('crypto');

const decryption = {
    decryption : (encryptedString, salt) => {
        return new Promise((resolve, reject) => {
            const decipher = crypto.createDecipher('aes-256-cbc', salt);
            let decryptedString = decipher.update(encryptedString, 'base64', 'utf8');
            decryptedString += decipher.final('utf8');
            // console.log('복호화된 평문: ',decryptedString);

            resolve(decryptedString);
        });
    }
};

module.exports = decryption;