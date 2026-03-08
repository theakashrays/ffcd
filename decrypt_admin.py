import base64
import json
import re

try:
    from Crypto.Cipher import AES
    from Crypto.Protocol.KDF import PBKDF2
    from Crypto.Hash import SHA256
except ImportError:
    import sys
    print("pycryptodome not installed")
    sys.exit(1)

password = b'@thzyvxkupka3453'

with open('adminpanelacess/index.html', 'r', encoding='utf8') as f:
    html = f.read()

m = re.search(r'<div id="encryptedPayload" style="display:none;">\s*([\s\S]*?)\s*</div>', html)
payload_b64 = m.group(1).strip()
payload = json.loads(base64.b64decode(payload_b64).decode('utf8'))

salt = base64.b64decode(payload['salt'])
iv = base64.b64decode(payload['iv'])
ciphertext = base64.b64decode(payload['data'])

# The tag is the last 16 bytes
tag = ciphertext[-16:]
data = ciphertext[:-16]

key = PBKDF2(password, salt, 32, count=100000, hmac_hash_module=SHA256)

cipher = AES.new(key, AES.MODE_GCM, nonce=iv)
decrypted = cipher.decrypt_and_verify(data, tag)

with open('admin_unencrypted.html', 'w', encoding='utf8') as f:
    f.write(decrypted.decode('utf8'))
print("Decrypted successfully")
