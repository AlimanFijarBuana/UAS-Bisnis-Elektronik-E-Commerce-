import axios from "axios";

const API_URL = "http://localhost:8080/backend/web/user"; // ganti sesuai URL Yii backend

export const registerApi = (data) =>
  axios
    .post(`${API_URL}/register`, data, {
      headers: { "Content-Type": "application/json" },
    })
    .then(res => res.data);

export const loginApi = (data) =>
  axios
    .post(`${API_URL}/login`, data, {
      headers: { "Content-Type": "application/json" },
    })
    .then(res => res.data);