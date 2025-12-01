import axios from 'axios';
const API_URL = 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Critical for sending Cookies
  headers: {
    'Content-Type': 'application/json',
  },
}); 


export default api;