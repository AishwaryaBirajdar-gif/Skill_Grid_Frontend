import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "http://localhost:8181",
});

// This intercepts every request and adds the token from LocalStorage
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default axiosInstance;