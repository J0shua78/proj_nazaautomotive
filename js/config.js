export default {
  //useMockData: import.meta.env?.MODE === 'development' || true, // Default to true in dev
  useMockData: true,
  apiBaseUrl: import.meta.env?.API_BASE_URL || 'http://localhost:3000/api'
};
