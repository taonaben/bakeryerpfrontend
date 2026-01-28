import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'https://bakeryerpbackend.onrender.com',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken"); // Match what LoginPage stores

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;