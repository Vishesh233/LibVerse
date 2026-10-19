/**
 * Uploaded images (avatars, book covers) are stored by the API as host-independent paths,
 * "/api/files/<id>". This puts the API's origin in front so the browser loads them from the API
 * (the frontend is served from another host in production). Other URLs are returned unchanged.
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
// "https://libverse-api.onrender.com/api" -> "https://libverse-api.onrender.com"
const API_ROOT = API_BASE_URL.replace(/\/api\/?$/, '');

export const assetUrl = (url) => {
  if (typeof url !== 'string' || !url) return url;
  return url.startsWith('/api/files/') ? `${API_ROOT}${url}` : url;
};
