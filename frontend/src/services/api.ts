// Re-export the canonical axios instance (with refresh token interceptors)
// All services should use this to get automatic token management.
export { default } from '../api/axiosConfig';
