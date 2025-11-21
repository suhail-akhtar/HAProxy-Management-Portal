import axios from 'axios';
import { config as envConfig } from '../config';

/**
 * HAProxy Data Plane API Client
 * 
 * This client interacts with HAProxy's Data Plane API for configuration management.
 * The Data Plane API provides:
 * - Full CRUD operations for frontends, backends, servers
 * - Persistent configuration changes (writes to config file)
 * - Transaction support for atomic changes
 * - SSL certificate management
 * - ACL and map file management
 * 
 * API Documentation: https://www.haproxy.com/documentation/dataplaneapi/
 */

interface DataPlaneConfig {
  baseURL: string;
  username: string;
  password: string;
  timeout?: number;
}

export class HAProxyDataPlaneClient {
  private client: any;
  private config: DataPlaneConfig;

  constructor(dataPlaneConfig?: DataPlaneConfig) {
    this.config = dataPlaneConfig || {
      baseURL: process.env.HAPROXY_DATAPLANE_URL || 'http://localhost:5555/v2',
      username: process.env.HAPROXY_DATAPLANE_USER || 'admin',
      password: process.env.HAPROXY_DATAPLANE_PASS || 'adminpwd',
      timeout: 10000,
    };

    this.client = axios.create({
      baseURL: this.config.baseURL,
      auth: {
        username: this.config.username,
        password: this.config.password,
      },
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Get HAProxy info and version
   */
  async getInfo() {
    const response = await this.client.get('/info');
    return response.data;
  }

  /**
   * Get HAProxy statistics
   */
  async getStats() {
    const response = await this.client.get('/services/haproxy/stats/native');
    return response.data;
  }

  // ============ Frontend Operations ============

  /**
   * List all frontends
   */
  async getFrontends() {
    const response = await this.client.get('/services/haproxy/configuration/frontends');
    return response.data;
  }

  /**
   * Get specific frontend
   */
  async getFrontend(name: string) {
    const response = await this.client.get(`/services/haproxy/configuration/frontends/${name}`);
    return response.data;
  }

  /**
   * Create new frontend
   */
  async createFrontend(frontendData: any) {
    const response = await this.client.post('/services/haproxy/configuration/frontends', frontendData);
    return response.data;
  }

  /**
   * Update frontend
   */
  async updateFrontend(name: string, frontendData: any) {
    const response = await this.client.put(`/services/haproxy/configuration/frontends/${name}`, frontendData);
    return response.data;
  }

  /**
   * Delete frontend
   */
  async deleteFrontend(name: string) {
    const response = await this.client.delete(`/services/haproxy/configuration/frontends/${name}`);
    return response.data;
  }

  // ============ Backend Operations ============

  /**
   * List all backends
   */
  async getBackends() {
    const response = await this.client.get('/services/haproxy/configuration/backends');
    return response.data;
  }

  /**
   * Get specific backend
   */
  async getBackend(name: string) {
    const response = await this.client.get(`/services/haproxy/configuration/backends/${name}`);
    return response.data;
  }

  /**
   * Create new backend
   */
  async createBackend(backendData: any) {
    const response = await this.client.post('/services/haproxy/configuration/backends', backendData);
    return response.data;
  }

  /**
   * Update backend
   */
  async updateBackend(name: string, backendData: any) {
    const response = await this.client.put(`/services/haproxy/configuration/backends/${name}`, backendData);
    return response.data;
  }

  /**
   * Delete backend
   */
  async deleteBackend(name: string) {
    const response = await this.client.delete(`/services/haproxy/configuration/backends/${name}`);
    return response.data;
  }

  // ============ Server Operations ============

  /**
   * List servers in a backend
   */
  async getServers(backend: string) {
    const response = await this.client.get(`/services/haproxy/configuration/servers?backend=${backend}`);
    return response.data;
  }

  /**
   * Get specific server
   */
  async getServer(backend: string, serverName: string) {
    const response = await this.client.get(`/services/haproxy/configuration/servers/${serverName}?backend=${backend}`);
    return response.data;
  }

  /**
   * Add server to backend
   */
  async addServer(backend: string, serverData: any) {
    const response = await this.client.post(`/services/haproxy/configuration/servers?backend=${backend}`, serverData);
    return response.data;
  }

  /**
   * Update server
   */
  async updateServer(backend: string, serverName: string, serverData: any) {
    const response = await this.client.put(`/services/haproxy/configuration/servers/${serverName}?backend=${backend}`, serverData);
    return response.data;
  }

  /**
   * Delete server
   */
  async deleteServer(backend: string, serverName: string) {
    const response = await this.client.delete(`/services/haproxy/configuration/servers/${serverName}?backend=${backend}`);
    return response.data;
  }

  // ============ Configuration Operations ============

  /**
   * Get current configuration
   */
  async getConfiguration() {
    const response = await this.client.get('/services/haproxy/configuration/raw');
    return response.data;
  }

  /**
   * Update configuration (raw)
   */
  async updateConfiguration(configData: string) {
    const response = await this.client.post('/services/haproxy/configuration/raw', {
      data: configData,
    });
    return response.data;
  }

  /**
   * Get configuration version
   */
  async getConfigVersion() {
    const response = await this.client.get('/services/haproxy/configuration/version');
    return response.data;
  }

  // ============ ACL Operations ============

  /**
   * Get ACLs for a frontend
   */
  async getACLs(frontend: string) {
    const response = await this.client.get(`/services/haproxy/configuration/acls?parent_type=frontend&parent_name=${frontend}`);
    return response.data;
  }

  /**
   * Add ACL
   */
  async addACL(frontend: string, aclData: any) {
    const response = await this.client.post(`/services/haproxy/configuration/acls?parent_type=frontend&parent_name=${frontend}`, aclData);
    return response.data;
  }

  /**
   * Delete ACL
   */
  async deleteACL(frontend: string, aclId: string) {
    const response = await this.client.delete(`/services/haproxy/configuration/acls/${aclId}?parent_type=frontend&parent_name=${frontend}`);
    return response.data;
  }

  // ============ Transaction Support ============

  /**
   * Start a new transaction
   */
  async startTransaction() {
    const response = await this.client.post('/services/haproxy/transactions?version=1');
    return response.data.id;
  }

  /**
   * Commit transaction
   */
  async commitTransaction(transactionId: string) {
    const response = await this.client.put(`/services/haproxy/transactions/${transactionId}`);
    return response.data;
  }

  /**
   * Rollback transaction
   */
  async rollbackTransaction(transactionId: string) {
    const response = await this.client.delete(`/services/haproxy/transactions/${transactionId}`);
    return response.data;
  }

  // ============ Runtime Operations (via Data Plane API) ============

  /**
   * Get runtime info
   */
  async getRuntimeInfo() {
    const response = await this.client.get('/services/haproxy/runtime/info');
    return response.data;
  }

  /**
   * Reload HAProxy
   */
  async reloadHAProxy() {
    const response = await this.client.post('/services/haproxy/configuration/reload');
    return response.data;
  }
}

// Singleton instance
export const haproxyDataPlaneClient = new HAProxyDataPlaneClient();
