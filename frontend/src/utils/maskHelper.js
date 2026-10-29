export function maskKey(key) {
  if (!key || key === 'N/A') return '';
  const str = String(key).trim();
  if (str.length <= 4) return str;
  return `${str.slice(0, 2)}xxxx${str.slice(-2)}`;
}

export function maskKeysInText(text) {
  if (!text) return '';
  return text.replace(/\b([A-Z0-9]{2})[A-Z0-9]{12}([A-Z0-9]{2})\b/g, '$1xxxx$2');
}
