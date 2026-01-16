// FRONTEND
// Client axios configuré pour pointer vers ton backend.

import axios from 'axios';

export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:,5000/api',
    headers: {
        'Content-Type': 'application/json'
    }

});

apiClient.interceptors.request.use((config) => {
    const token = sessionStorage.getItem("auth_token");
    if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    console.log("VITE_API_URL =", import.meta.env.VITE_API_URL);
    return config;
});