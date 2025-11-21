import { haproxyDataPlaneClient } from './haproxyDataPlaneClient';
import { haproxyRuntimeClient } from './haproxyRuntimeClient';
import { Frontend, Backend, Server, Stats } from '../models/types';

/**
 * HAProxy Service - Unified Interface
 * 
 * This service combines both Data Plane API and Runtime API to provide:
 * - Configuration management (persistent via Data Plane API)
 * - Real-time statistics (via Runtime API)
 * - Server control (hybrid approach for best performance)
 * 
 * Architecture:
 * - Data Plane API: For configuration CRUD operations
 * - Runtime API: For real-time stats and quick state changes
 * - Hybrid: Use Runtime API for speed, Data Plane API for persistence
 */

export class HAProxyService {
  private dataPlaneEnabled: boolean = false;
  private runtimeEnabled: boolean = false;
  private initPromise: Promise<void>;

  constructor() {
    // Start availability check but don't block constructor
    this.initPromise = this.checkAvailability();
  }

  /**
   * Wait for initialization to complete
   */
  async waitForInit(): Promise<void> {
    await this.initPromise;
  }

  /**
   * Check if HAProxy APIs are available
   */
  private async checkAvailability() {
    // Check Data Plane API
    try {
      await haproxyDataPlaneClient.getInfo();
      this.dataPlaneEnabled = true;
      console.log('✓ HAProxy Data Plane API connected');
    } catch (error) {
      console.warn('⚠ HAProxy Data Plane API not available:', (error as Error).message);
      console.warn('  Using mock data instead. To enable:');
      console.warn('  1. Install HAProxy Data Plane API');
      console.warn('  2. Set HAPROXY_DATAPLANE_URL in .env');
    }

    // Check Runtime API
    try {
      await haproxyRuntimeClient.showInfo();
      this.runtimeEnabled = true;
      console.log('✓ HAProxy Runtime API connected');
    } catch (error) {
      console.warn('⚠ HAProxy Runtime API not available:', (error as Error).message);
      console.warn('  Using mock data instead. To enable:');
      console.warn('  1. Configure stats socket in HAProxy config');
      console.warn('  2. Set HAPROXY_SOCKET_PATH in .env');
    }
  }

  /**
   * Check if APIs are enabled
   */
  isConnected(): { dataPlane: boolean; runtime: boolean } {
    return {
      dataPlane: this.dataPlaneEnabled,
      runtime: this.runtimeEnabled,
    };
  }

  // ============ Frontend Operations ============

  /**
   * Get all frontends with real-time stats
   */
  async getFrontends(): Promise<any[]> {
    if (!this.dataPlaneEnabled) {
      throw new Error('Data Plane API not available');
    }

    // Get configuration from Data Plane API
    const frontends = await haproxyDataPlaneClient.getFrontends();

    // Enhance with real-time stats if Runtime API is available
    if (this.runtimeEnabled) {
      const stats = await haproxyRuntimeClient.showStat();
      const frontendStats = stats.filter(s => s.svname === 'FRONTEND');

      frontends.data?.forEach((frontend: any) => {
        const stat = frontendStats.find(s => s.pxname === frontend.name);
        if (stat) {
          frontend.currentSessions = parseInt(stat.scur) || 0;
          frontend.maxSessions = parseInt(stat.smax) || 0;
          frontend.totalSessions = parseInt(stat.stot) || 0;
          frontend.bytesIn = parseInt(stat.bin) || 0;
          frontend.bytesOut = parseInt(stat.bout) || 0;
          frontend.requestRate = parseInt(stat.req_rate) || 0;
        }
      });
    }

    return frontends.data || [];
  }

  /**
   * Get frontend by name
   */
  async getFrontend(name: string): Promise<any> {
    if (!this.dataPlaneEnabled) {
      throw new Error('Data Plane API not available');
    }

    const frontend = await haproxyDataPlaneClient.getFrontend(name);

    // Add real-time stats
    if (this.runtimeEnabled) {
      const stats = await haproxyRuntimeClient.showStat();
      const stat = stats.find(s => s.pxname === name && s.svname === 'FRONTEND');
      if (stat) {
        frontend.data.stats = {
          currentSessions: parseInt(stat.scur) || 0,
          maxSessions: parseInt(stat.smax) || 0,
          totalSessions: parseInt(stat.stot) || 0,
          requestRate: parseInt(stat.req_rate) || 0,
        };
      }
    }

    return frontend.data;
  }

  /**
   * Create frontend
   */
  async createFrontend(frontendData: any): Promise<any> {
    if (!this.dataPlaneEnabled) {
      throw new Error('Data Plane API not available');
    }

    return await haproxyDataPlaneClient.createFrontend(frontendData);
  }

  /**
   * Update frontend
   */
  async updateFrontend(name: string, frontendData: any): Promise<any> {
    if (!this.dataPlaneEnabled) {
      throw new Error('Data Plane API not available');
    }

    return await haproxyDataPlaneClient.updateFrontend(name, frontendData);
  }

  /**
   * Delete frontend
   */
  async deleteFrontend(name: string): Promise<any> {
    if (!this.dataPlaneEnabled) {
      throw new Error('Data Plane API not available');
    }

    return await haproxyDataPlaneClient.deleteFrontend(name);
  }

  // ============ Backend Operations ============

  /**
   * Get all backends with real-time stats
   */
  async getBackends(): Promise<any[]> {
    if (!this.dataPlaneEnabled) {
      throw new Error('Data Plane API not available');
    }

    const backends = await haproxyDataPlaneClient.getBackends();

    // Enhance with real-time stats
    if (this.runtimeEnabled) {
      const stats = await haproxyRuntimeClient.showStat();
      
      backends.data?.forEach((backend: any) => {
        const backendStats = stats.filter(s => s.pxname === backend.name);
        const backendSummary = backendStats.find(s => s.svname === 'BACKEND');
        
        if (backendSummary) {
          backend.currentSessions = parseInt(backendSummary.scur) || 0;
          backend.totalSessions = parseInt(backendSummary.stot) || 0;
          backend.activeServers = parseInt(backendSummary.act) || 0;
          backend.backupServers = parseInt(backendSummary.bck) || 0;
        }
      });
    }

    return backends.data || [];
  }

  /**
   * Get backend with servers
   */
  async getBackend(name: string): Promise<any> {
    if (!this.dataPlaneEnabled) {
      throw new Error('Data Plane API not available');
    }

    const backend = await haproxyDataPlaneClient.getBackend(name);
    const servers = await haproxyDataPlaneClient.getServers(name);

    // Add servers to backend
    backend.data.servers = servers.data || [];

    // Add real-time stats
    if (this.runtimeEnabled) {
      const stats = await haproxyRuntimeClient.showStat();
      const backendStats = stats.filter(s => s.pxname === name);

      // Update server stats
      backend.data.servers.forEach((server: any) => {
        const stat = backendStats.find(s => s.svname === server.name);
        if (stat) {
          server.status = stat.status;
          server.currentSessions = parseInt(stat.scur) || 0;
          server.totalSessions = parseInt(stat.stot) || 0;
          server.bytesIn = parseInt(stat.bin) || 0;
          server.bytesOut = parseInt(stat.bout) || 0;
        }
      });
    }

    return backend.data;
  }

  /**
   * Create backend
   */
  async createBackend(backendData: any): Promise<any> {
    if (!this.dataPlaneEnabled) {
      throw new Error('Data Plane API not available');
    }

    return await haproxyDataPlaneClient.createBackend(backendData);
  }

  /**
   * Delete backend
   */
  async deleteBackend(name: string): Promise<any> {
    if (!this.dataPlaneEnabled) {
      throw new Error('Data Plane API not available');
    }

    return await haproxyDataPlaneClient.deleteBackend(name);
  }

  // ============ Server Operations ============

  /**
   * Add server to backend
   */
  async addServer(backend: string, serverData: any): Promise<any> {
    if (!this.dataPlaneEnabled) {
      throw new Error('Data Plane API not available');
    }

    return await haproxyDataPlaneClient.addServer(backend, serverData);
  }

  /**
   * Update server status (hybrid approach)
   * Uses Runtime API for immediate effect, then Data Plane API for persistence
   */
  async updateServerStatus(backend: string, server: string, status: 'up' | 'down' | 'maint'): Promise<{ success: boolean; message?: string }> {
    // Apply immediately via Runtime API
    if (this.runtimeEnabled) {
      try {
        switch (status) {
          case 'up':
            await haproxyRuntimeClient.enableServer(backend, server);
            break;
          case 'down':
            await haproxyRuntimeClient.disableServer(backend, server);
            break;
          case 'maint':
            await haproxyRuntimeClient.setServerMaint(backend, server);
            break;
        }
      } catch (error) {
        console.warn('Runtime API update failed:', (error as Error).message);
      }
    }

    // Persist via Data Plane API
    if (this.dataPlaneEnabled) {
      try {
        const serverConfig = await haproxyDataPlaneClient.getServer(backend, server);
        serverConfig.data.maintenance = status === 'maint' ? 'enabled' : 'disabled';
        await haproxyDataPlaneClient.updateServer(backend, server, serverConfig.data);
        return { success: true, message: 'Server status updated successfully' };
      } catch (error) {
        return { success: false, message: (error as Error).message };
      }
    }

    return { success: true, message: 'Server status updated (runtime only)' };
  }

  /**
   * Delete server
   */
  async deleteServer(backend: string, server: string): Promise<any> {
    if (!this.dataPlaneEnabled) {
      throw new Error('Data Plane API not available');
    }

    return await haproxyDataPlaneClient.deleteServer(backend, server);
  }

  // ============ Statistics Operations ============

  /**
   * Get real-time statistics
   */
  async getStats(): Promise<any[]> {
    if (!this.runtimeEnabled) {
      throw new Error('Runtime API not available');
    }

    return await haproxyRuntimeClient.showStat();
  }

  /**
   * Get HAProxy info
   */
  async getInfo(): Promise<any> {
    const info: any = {};

    // Get info from Data Plane API
    if (this.dataPlaneEnabled) {
      try {
        const dpInfo = await haproxyDataPlaneClient.getInfo();
        Object.assign(info, dpInfo);
      } catch (error) {
        console.warn('Could not get Data Plane info:', (error as Error).message);
      }
    }

    // Get info from Runtime API
    if (this.runtimeEnabled) {
      try {
        const rtInfo = await haproxyRuntimeClient.showInfo();
        Object.assign(info, { runtime: rtInfo });
      } catch (error) {
        console.warn('Could not get Runtime info:', (error as Error).message);
      }
    }

    return info;
  }

  /**
   * Get system health metrics
   */
  async getSystemHealth(): Promise<any> {
    if (!this.runtimeEnabled) {
      throw new Error('Runtime API not available');
    }

    const info = await haproxyRuntimeClient.showInfo();
    
    return {
      uptime: info.Uptime || 'unknown',
      currentConnections: parseInt(info.CurrConns) || 0,
      maxConnections: parseInt(info.MaxConn) || 0,
      cpuUsage: parseFloat(info.Idle_pct) ? 100 - parseFloat(info.Idle_pct) : 0,
      tasksRunning: parseInt(info.Run_queue) || 0,
      processNum: parseInt(info.Nbproc) || 1,
    };
  }

  // ============ Configuration Operations ============

  /**
   * Get current configuration
   */
  async getConfiguration(): Promise<string> {
    if (!this.dataPlaneEnabled) {
      throw new Error('Data Plane API not available');
    }

    const config = await haproxyDataPlaneClient.getConfiguration();
    return config.data;
  }

  /**
   * Update configuration
   */
  async updateConfiguration(configData: string): Promise<any> {
    if (!this.dataPlaneEnabled) {
      throw new Error('Data Plane API not available');
    }

    return await haproxyDataPlaneClient.updateConfiguration(configData);
  }

  /**
   * Reload HAProxy
   */
  async reload(): Promise<any> {
    if (!this.dataPlaneEnabled) {
      throw new Error('Data Plane API not available');
    }

    return await haproxyDataPlaneClient.reloadHAProxy();
  }
}

// Singleton instance
export const haproxyService = new HAProxyService();
