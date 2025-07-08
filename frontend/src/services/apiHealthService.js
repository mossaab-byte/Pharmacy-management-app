import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

class ApiHealthService {
  static async checkHealth() {
    try {
      const response = await axios.get(`${API_BASE_URL}/utils/health/`, {
        timeout: 5000
      });
      return {
        isHealthy: response.status === 200,
        data: response.data,
        error: null
      };
    } catch (error) {
      console.error('API Health Check Failed:', error);
      return {
        isHealthy: false,
        data: null,
        error: error.message
      };
    }
  }

  static async getApiInfo() {
    try {
      const response = await axios.get(`${API_BASE_URL}/utils/info/`, {
        timeout: 5000
      });
      return {
        success: true,
        data: response.data,
        error: null
      };
    } catch (error) {
      console.error('API Info Failed:', error);
      return {
        success: false,
        data: null,
        error: error.message
      };
    }
  }

  static async testConnection() {
    try {
      // Try a simple request to test connectivity
      const response = await axios.get(`${API_BASE_URL}/utils/health/`, {
        timeout: 3000
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
}

export default ApiHealthService;
