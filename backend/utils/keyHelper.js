const crypto = require('crypto');

const ALPHANUMERIC_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function generateAlphanumericKey(length = 16) {
  const bytes = crypto.randomBytes(length);
  let key = '';
  for (let i = 0; i < length; i++) {
    key += ALPHANUMERIC_CHARS[bytes[i] % ALPHANUMERIC_CHARS.length];
  }
  return key;
}

function maskKey(key) {
  if (!key || key === 'N/A') return 'N/A';
  const str = String(key).trim();
  if (str.length <= 4) return str;
  return `${str.slice(0, 2)}xxxx${str.slice(-2)}`;
}

module.exports = { generateAlphanumericKey, maskKey };
