import axios from "axios";

// IMPORTANT: This configuration ensures all API calls go through the Vite proxy
// The Vite proxy forwards /api/* requests to http://localhost:5000

// Clear any existing axios defaults to prevent conflicts
axios.defaults.baseURL = undefined;
axios.defaults.headers.common = {};

const api = axios.create({
  baseURL: "/api", // This will be proxied to localhost:5000 by Vite
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 second timeout
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    // Log the actual URL being called
    const fullUrl = `${window.location.origin}${config.baseURL}${config.url}`;
    console.log("🚀 API Request:", {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullUrl: fullUrl,
      proxyTarget: "http://localhost:5000",
      data: config.data,
      headers: config.headers,
    });

    // Ensure the baseURL is set correctly
    if (config.baseURL !== "/api") {
      console.warn("⚠️ Warning: baseURL is not /api, setting it now");
      config.baseURL = "/api";
    }

    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log("✅ API Response:", {
      status: response.status,
      url: response.config.url,
      baseURL: response.config.baseURL,
      fullUrl: (response.config.baseURL || "") + (response.config.url || ""),
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error("❌ API Error:", {
      status: error.response?.status,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      fullUrl: (error.config?.baseURL || "") + (error.config?.url || ""),
      message: error.response?.data?.message || error.message,
      data: error.response?.data,
      config: error.config,
    });
    return Promise.reject(error);
  }
);

// Log the configuration when the module is loaded
console.log("🔧 Axios Configuration Loaded:", {
  baseURL: api.defaults.baseURL,
  timeout: api.defaults.timeout,
  headers: api.defaults.headers.common,
});

export default api;
