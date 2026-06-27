import axios from "axios";

export const baseURL = "http://localhost:8181";

export const httpClient = axios.create({
    baseURL: baseURL,
});

// ADD THIS INTERCEPTOR
httpClient.interceptors.request.use((config) => {
    // Replace 'adminToken' with the key you use when saving your token after login
    const token = localStorage.getItem("adminToken"); 
    
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
}, (error) => {
    return Promise.reject(error);
});