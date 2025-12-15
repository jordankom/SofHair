// FRONTEND
// Client axios configuré pour pointer vers ton backend.

import axios from 'axios';

export const apiClient = axios.create({
    baseURL: 'http://localhost:5000/api', // URL backend
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
    return config;
});