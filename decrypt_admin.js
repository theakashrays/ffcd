const crypto = require('crypto');
const fs = require('fs');

const password = '@thzyvxkupka3453';
const html = fs.readFileSync('adminpanelacess/index.html', 'utf8');
const payloadMatch = html.match(/<div id="encryptedPayload" style="display:none;">\s*([\s\S]*?)\s*<\/div>/);
const payloadB64 = payloadMatch[1].trim();
const payloadJson = JSON.parse(Buffer.from(payloadB64, 'base64').toString('utf8'));

const salt = Buffer.from(payloadJson.salt, 'base64');
const iv = Buffer.from(payloadJson.iv, 'base64');
const ciphertext = Buffer.from(payloadJson.data, 'base64');

crypto.pbkdf2(password, salt, 100000, 32, 'sha256', (err, key) => {
    if (err) throw err;
    const decipher = crypto.createDecipheriv('aes-256-gcm', iv, key);
    const tag = ciphertext.slice(ciphertext.length - 16);
    const encryptedContent = ciphertext.slice(0, ciphertext.length - 16);

    decipher.setAuthTag(tag);
    try {
        let decrypted = decipher.update(encryptedContent, null, 'utf8');
        decrypted += decipher.final('utf8');
        fs.writeFileSync('admin_unencrypted.html', decrypted);
        console.log("Decrypted successfully!");
    } catch (e) {
        console.error("error decrypting: ", e);
    }
});
