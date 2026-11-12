const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('admin_token');
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers || {})
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`, {
      ...options,
      headers
    });
  } catch {
    throw new Error('Unable to connect to the server. Check your internet connection and try again.');
  }

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await response.json().catch(() => ({}))
    : { error: await response.text().catch(() => '') };

  if (!response.ok) {
    if (response.status === 401 && token) {
      localStorage.removeItem('admin_token');
      window.dispatchEvent(new CustomEvent('admin:session-expired'));
    }
    throw new Error(data.error || `Request failed (${response.status})`);
  }

  return data;
}
