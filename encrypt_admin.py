import base64
import json

try:
    from Crypto.Cipher import AES
    from Crypto.Protocol.KDF import PBKDF2
    from Crypto.Hash import SHA256
    from Crypto.Random import get_random_bytes
except ImportError:
    import sys
    print("pycryptodome not installed")
    sys.exit(1)

password = b'@thzyvxkupka3453'

with open('admin_unencrypted.html', 'r', encoding='utf8') as f:
    decrypted_html = f.read().encode('utf8')

salt = get_random_bytes(16)
key = PBKDF2(password, salt, 32, count=100000, hmac_hash_module=SHA256)
cipher = AES.new(key, AES.MODE_GCM)
ciphertext, tag = cipher.encrypt_and_digest(decrypted_html)

payload = {
    'salt': base64.b64encode(salt).decode('utf8'),
    'iv': base64.b64encode(cipher.nonce).decode('utf8'),
    'data': base64.b64encode(ciphertext + tag).decode('utf8')
}

payload_b64 = base64.b64encode(json.dumps(payload).encode('utf8')).decode('utf8')

with open('adminpanelacess/index.html', 'r', encoding='utf8') as f:
    html = f.read()

# Replace payload by marker so we don't rely on regex with huge content
marker_start = '<div id="encryptedPayload" style="display:none;">'
marker_end = '</div>'
start = html.find(marker_start)
if start == -1:
    import re
    html = re.sub(
        r'<div id="encryptedPayload" style="display:none;">\s*[\s\S]*?\s*</div>',
        marker_start + payload_b64 + marker_end,
        html,
        count=1
    )
else:
    after_open = start + len(marker_start)
    end = html.find(marker_end, after_open)
    if end == -1:
        raise SystemExit('encryptedPayload div has no closing tag')
    html = html[:after_open] + payload_b64 + html[end:]

with open('adminpanelacess/index.html', 'w', encoding='utf8') as f:
    f.write(html)
print("Encrypted successfully")
