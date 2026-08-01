const ENVIRONMENT = import.meta.env.VITE_ENVIRONMENT;
console.log("ENVIRONMENT", ENVIRONMENT);
let backendAPIURL;

if (ENVIRONMENT === "local") {
  backendAPIURL = "http://localhost:3001/api";
} else {
  backendAPIURL = "https://refer-ai-develop-1.onrender.com/api";
}

export default {
  apiUrl: backendAPIURL,
};