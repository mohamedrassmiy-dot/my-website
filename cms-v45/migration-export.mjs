import { getStore, getDeployStore } from '@netlify/blobs';
import { webcrypto, createHash } from 'node:crypto';

const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEArlOQNJjsNLRpmIBuBIa/
UbRhWFChiC8pOViUz9cmQODiaDrpWNSR52Uh16NwMUqsMDgfckOAsnG2y92a12Ym
U8Z66yq0tfOEaNO/RQOLtf0QrDWOv5ro497EuQe2CjI6jMl3lOIjkqIFbPFvnnrr
4clNp376bMRlquWv0fQgju9XQX95G+UoFaF+kcnDascSv3Lfogop7xd+6QSWOk0E
cl3vDT8pu6UJAOjVIBdfqchUpnwPZCKb2NK9zCFzffyOgu2Qry3MuCPx4wPdRwY1
KWjqPnaWkvs5Q0wR734ivkAwc23O9JuACK2Ed4LRo4OfALcs1Xf6FInd0qftF3FP
0QIDAQAB
-----END PUBLIC KEY-----`;

async function loadState() {
  const store = getStore('rassmiy-cms', { consistency: 'strong' });
  let state = await store.get('state', { type: 'json' });
  if (!state) {
    try {
      state = await getDeployStore('rassmiy-cms', { consistency: 'strong' }).get('state', { type: 'json' });
    } catch {}
  }
  return state;
}

export default async () => {
  const state = await loadState();
  if (!state?.installed) {
    return new Response(JSON.stringify({ error: 'not_installed' }), {
      status: 409,
      headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }
    });
  }

  const snapshot = structuredClone(state);
  snapshot.sessions = [];
  const plain = Buffer.from(JSON.stringify(snapshot), 'utf8');

  const aesRaw = webcrypto.getRandomValues(new Uint8Array(32));
  const iv = webcrypto.getRandomValues(new Uint8Array(12));
  const aesKey = await webcrypto.subtle.importKey('raw', aesRaw, { name: 'AES-GCM' }, false, ['encrypt']);
  const ciphertext = Buffer.from(await webcrypto.subtle.encrypt({ name: 'AES-GCM', iv }, aesKey, plain));

  const der = Buffer.from(PUBLIC_KEY.replace(/-----[^-]+-----/g, '').replace(/\s+/g, ''), 'base64');
  const rsaKey = await webcrypto.subtle.importKey('spki', der, { name: 'RSA-OAEP', hash: 'SHA-256' }, false, ['encrypt']);
  const wrappedKey = Buffer.from(await webcrypto.subtle.encrypt({ name: 'RSA-OAEP' }, rsaKey, aesRaw));

  return new Response(JSON.stringify({
    v: 1,
    alg: 'RSA-OAEP-SHA256+A256GCM',
    wrappedKey: wrappedKey.toString('base64'),
    iv: Buffer.from(iv).toString('base64'),
    ciphertext: ciphertext.toString('base64'),
    sha256: createHash('sha256').update(plain).digest('hex')
  }), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store, max-age=0',
      'x-robots-tag': 'noindex, nofollow'
    }
  });
};

export const config = {
  path: '/api/migration/export'
};
