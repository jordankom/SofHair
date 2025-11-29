// FRONTEND
// Client axios configuré pour pointer vers ton backend.

import axios from 'axios';

export const apiClient = axios.create({
    baseURL: 'http://localhost:5000/api', // URL backend
    headers: {
        'Content-Type': 'application/json'
    }
});
