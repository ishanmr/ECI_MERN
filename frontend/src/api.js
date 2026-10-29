const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function api(path, options = {}) {
  const { auth = true, ...requestOptions } = options;
  let token = null;
  try { token = JSON.parse(localStorage.getItem('eci-session'))?.token; } catch { /* expired or invalid local session */ }
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...requestOptions,
      headers: { 'Content-Type': 'application/json', ...(auth && token ? { Authorization: `Bearer ${token}` } : {}), ...requestOptions.headers }
    });
  } catch {
    throw new Error('Can’t reach the portal server. Check that the API is running.');
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'The request could not be completed.');
  return data;
}
