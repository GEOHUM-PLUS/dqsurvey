<<<<<<< HEAD
// config.js
// Detect environment: localhost vs live
const CONFIG = {
  API_URL: window.location.hostname === "localhost"
    ? "http://localhost:8020"           // your local backend
    : "https://dqsurvey.onrender.com"  // live backend
};
=======
export const CONFIG = {
  API_URL: window.location.hostname === "localhost"
    ? "http://localhost:8020"
    : "https://dqsurvey.onrender.com"
};

// export const CONFIG = {
//   API_URL: "https://dqsurvey.onrender.com"
// };
>>>>>>> 4e9388e4f6b80b04c55edba31a3be3cfd441644c
