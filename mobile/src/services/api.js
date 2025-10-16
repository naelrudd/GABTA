import axios from 'axios';

const baseURL = process.env.API_URL || 'http://10.0.2.2:5000/api'; // Android emulator host to PC

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

export default api;
