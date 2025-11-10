// src/api/authService.js
import axios from "./axiosInstance";

/**
 * signup(payload)
 * payload: { name, email, password, role }
 * returns: backend JwtResponse { token, userId, email, name, role } on success
 */
export const signup = async (payload) => {
  const res = await axios.post("/api/auth/signup", payload);
  return res.data;
};

/**
 * login(payload)
 * payload: { email, password }
 * returns: backend JwtResponse { token, userId, email, name, role } on success
 */
export const login = async (payload) => {
  const res = await axios.post("/api/auth/login", payload);
  return res.data;
};
