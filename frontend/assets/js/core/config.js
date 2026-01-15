// config.js
// Detect environment: localhost vs live
const CONFIG = {
  API_URL: window.location.hostname === "localhost"
    ? "http://localhost:8020"           // your local backend
    : "https://dqsurvey.onrender.com"  // live backend
};
