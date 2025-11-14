/**
 * API Configuration
 * Uses environment variable for API URL, falls back to localhost for development
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default API_URL;

