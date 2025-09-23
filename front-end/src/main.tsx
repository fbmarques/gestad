import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import axios from 'axios'

// Configure Axios for Laravel Sanctum SPA authentication
axios.defaults.withCredentials = true;
axios.defaults.xsrfCookieName = 'XSRF-TOKEN';
axios.defaults.xsrfHeaderName = 'X-XSRF-TOKEN';

createRoot(document.getElementById("root")!).render(<App />);
