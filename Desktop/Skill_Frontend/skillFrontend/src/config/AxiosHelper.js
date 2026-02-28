import axios from "axios";

// Your backend URL
export const baseURL = "http://localhost:8181";

// This is the 'httpClient' the service is looking for
export const httpClient = axios.create({
    baseURL: baseURL,
});