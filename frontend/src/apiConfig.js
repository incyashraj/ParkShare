// This file is the single source of truth for backend API and socket URLs.
// All frontend code should import API_BASE from here for backend communication.
export const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001'; 