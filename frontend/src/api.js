import axios from 'axios';

const BASE = 'http://localhost:5000'; // change if your backend runs elsewhere
const api = axios.create({ baseURL: BASE });

export default api;
