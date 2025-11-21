/**
 * API Service for HAProxy Management Portal Frontend
 * 
 * This service provides methods to interact with the backend API.
 * It handles authentication, error handling, and provides a clean interface
 * for all API operations.
 */

// API Configuration
const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5555/api',
  WS_URL: import.meta.env.VITE_WS_URL || 'ws://localhost:5555/ws',
};

class APIError extends Error {
  constructor(message: string, public status?: number, public response?: any) {
    super(message);
    this.name = 'APIError';
  }
}

class APIService {
  private token: string | null = null;

  constructor() {
    // Load token from localStorage if available
    const storedToken = localStorage.getItem('haproxy_token');
    if (storedToken) {
      this.token = storedToken;
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('haproxy_token', token);
    } else {
      localStorage.removeItem('haproxy_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request(
    method: string,
    endpoint: string,
    data?: any,
    options: RequestInit = {}
  ): Promise<any> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      method,
      headers,
      ...options,
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, config);
      
      // Handle different response types
      const contentType = response.headers.get('content-type');
      let responseData;
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      if (!response.ok) {
        throw new APIError(
          responseData?.error || responseData?.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          responseData
        );
      }

      return responseData;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      
      // Network or other errors
      throw new APIError(
        error instanceof Error ? error.message : 'An unknown error occurred',
        undefined,
        error
      );
    }
  }

  // ========== Authentication ==========

  async login(email: string, password: string) {
    const response = await this.request('POST', '/auth/login', { email, password });
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async logout() {
    try {
      await this.request('POST', '/auth/logout');
    } finally {
      this.setToken(null);
    }
  }

  async validateToken() {
    return this.request('GET', '/auth/validate');
  }

  // ========== Dashboard ==========

  async getDashboard() {
    return this.request('GET', '/dashboard');
  }

  // ========== Frontends ==========

  async getFrontends() {
    return this.request('GET', '/frontends');
  }

  async getFrontend(id: string) {
    return this.request('GET', `/frontends/${id}`);
  }

  async createFrontend(frontend: any) {
    return this.request('POST', '/frontends', frontend);
  }

  async updateFrontend(id: string, updates: any) {
    return this.request('PUT', `/frontends/${id}`, updates);
  }

  async deleteFrontend(id: string) {
    return this.request('DELETE', `/frontends/${id}`);
  }

  // ========== Backends ==========

  async getBackends() {
    return this.request('GET', '/backends');
  }

  async getBackend(id: string) {
    return this.request('GET', `/backends/${id}`);
  }

  async createBackend(backend: any) {
    return this.request('POST', '/backends', backend);
  }

  async deleteBackend(id: string) {
    return this.request('DELETE', `/backends/${id}`);
  }

  async updateServerStatus(backendId: string, serverId: string, status: string) {
    return this.request('PUT', `/backends/${backendId}/servers/${serverId}/status`, { status });
  }

  // ========== Statistics ==========

  async getStats() {
    return this.request('GET', '/stats');
  }

  async getHealth() {
    return this.request('GET', '/health');
  }

  // ========== Logs ==========

  async getLogs() {
    return this.request('GET', '/logs');
  }

  // ========== ACLs ==========

  async getACLs() {
    return this.request('GET', '/acls');
  }

  async createACL(acl: any) {
    return this.request('POST', '/acls', acl);
  }

  async deleteACL(id: string) {
    return this.request('DELETE', `/acls/${id}`);
  }

  // ========== Configuration ==========

  async getCurrentConfig() {
    return this.request('GET', '/config/current');
  }

  async getConfigHistory() {
    return this.request('GET', '/config/history');
  }

  async saveConfig(content: string, comment: string, author: string) {
    return this.request('POST', '/config/save', { content, comment, author });
  }

  async rollbackConfig(versionId: string) {
    return this.request('POST', `/config/rollback/${versionId}`);
  }

  // ========== Alerts ==========

  async getAlerts() {
    return this.request('GET', '/alerts');
  }

  async deleteAlert(id: string) {
    return this.request('DELETE', `/alerts/${id}`);
  }

  // ========== Certificates ==========

  async getCertificates() {
    return this.request('GET', '/certificates');
  }

  // ========== HA Nodes ==========

  async getHANodes() {
    return this.request('GET', '/ha-nodes');
  }

  // ========== Analytics ==========

  async getAnalytics() {
    return this.request('GET', '/analytics');
  }

  // ========== Users ==========

  async getUsers() {
    return this.request('GET', '/users');
  }

  async createUser(user: any) {
    return this.request('POST', '/users', user);
  }

  async deleteUser(id: string) {
    return this.request('DELETE', `/users/${id}`);
  }

  // ========== Reports ==========

  async getReports() {
    return this.request('GET', '/reports');
  }

  async generateReport(title: string, type: 'pdf' | 'csv', generatedBy: string) {
    return this.request('POST', '/reports', { title, type, generatedBy });
  }

  async deleteReport(id: string) {
    return this.request('DELETE', `/reports/${id}`);
  }

  // ========== Settings ==========

  async getSettings() {
    return this.request('GET', '/settings');
  }

  async updateSettings(settings: any) {
    return this.request('PUT', '/settings', settings);
  }

  // ========== WebSocket ==========

  createWebSocket(onMessage: (data: any) => void, onError?: (error: Event) => void): WebSocket {
    const ws = new WebSocket(API_CONFIG.WS_URL);
    
    ws.onopen = () => {
      console.log('WebSocket connected');
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      if (onError) {
        onError(error);
      }
    };
    
    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };
    
    return ws;
  }
}

// Export singleton instance
export const apiService = new APIService();
export { APIError };
export type { APIService };
