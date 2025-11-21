import net from 'net';
import { promisify } from 'util';

/**
 * HAProxy Runtime API Client (Stats Socket)
 * 
 * This client interacts with HAProxy's Runtime API via Unix socket for:
 * - Real-time statistics (show stat)
 * - Runtime server control (enable/disable/drain servers)
 * - Live traffic management
 * - In-memory changes (not persisted to config file)
 * 
 * Documentation: https://www.haproxy.com/documentation/haproxy-runtime-api/
 */

interface RuntimeConfig {
  socketPath: string;
  timeout?: number;
}

export class HAProxyRuntimeClient {
  private config: RuntimeConfig;

  constructor(runtimeConfig?: RuntimeConfig) {
    this.config = runtimeConfig || {
      socketPath: process.env.HAPROXY_SOCKET_PATH || '/var/run/haproxy/admin.sock',
      timeout: 5000,
    };
  }

  /**
   * Send command to HAProxy stats socket
   */
  private async sendCommand(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const client = net.createConnection(this.config.socketPath);
      let data = '';

      const timeout = setTimeout(() => {
        client.destroy();
        reject(new Error('Socket command timeout'));
      }, this.config.timeout);

      client.on('connect', () => {
        client.write(command + '\n');
      });

      client.on('data', (chunk) => {
        data += chunk.toString();
      });

      client.on('end', () => {
        clearTimeout(timeout);
        resolve(data);
      });

      client.on('error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });
  }

  /**
   * Parse CSV output from show stat command
   */
  private parseStats(csvData: string): any[] {
    const lines = csvData.trim().split('\n');
    if (lines.length < 2) return [];

    // First line contains headers
    const headers = lines[0].substring(2).split(','); // Remove '# ' prefix
    const stats = [];

    // Parse each data line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith('#')) continue;

      const values = line.split(',');
      const stat: any = {};

      headers.forEach((header, index) => {
        const value = values[index];
        stat[header.trim()] = value === '' ? null : value;
      });

      stats.push(stat);
    }

    return stats;
  }

  // ============ Information Commands ============

  /**
   * Get general HAProxy information
   */
  async showInfo(): Promise<Record<string, string>> {
    const data = await this.sendCommand('show info');
    const lines = data.trim().split('\n');
    const info: Record<string, string> = {};

    lines.forEach(line => {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length > 0) {
        info[key.trim()] = valueParts.join(':').trim();
      }
    });

    return info;
  }

  /**
   * Get real-time statistics
   * Returns stats for all frontends, backends, and servers
   */
  async showStat(): Promise<any[]> {
    const data = await this.sendCommand('show stat');
    return this.parseStats(data);
  }

  /**
   * Get statistics in typed format with descriptions
   */
  async showStatTyped(): Promise<string> {
    return await this.sendCommand('show stat typed');
  }

  /**
   * Get errors for frontends and listeners
   */
  async showErrors(): Promise<string> {
    return await this.sendCommand('show errors');
  }

  // ============ Server Management ============

  /**
   * Enable a server
   */
  async enableServer(backend: string, server: string): Promise<string> {
    return await this.sendCommand(`enable server ${backend}/${server}`);
  }

  /**
   * Disable a server (hard stop - drops connections)
   */
  async disableServer(backend: string, server: string): Promise<string> {
    return await this.sendCommand(`disable server ${backend}/${server}`);
  }

  /**
   * Set server to maintenance mode (graceful drain)
   */
  async setServerMaint(backend: string, server: string): Promise<string> {
    return await this.sendCommand(`set server ${backend}/${server} state maint`);
  }

  /**
   * Set server to ready mode
   */
  async setServerReady(backend: string, server: string): Promise<string> {
    return await this.sendCommand(`set server ${backend}/${server} state ready`);
  }

  /**
   * Set server to drain mode (no new sessions, existing continue)
   */
  async setServerDrain(backend: string, server: string): Promise<string> {
    return await this.sendCommand(`set server ${backend}/${server} state drain`);
  }

  /**
   * Set server weight
   */
  async setServerWeight(backend: string, server: string, weight: number): Promise<string> {
    return await this.sendCommand(`set server ${backend}/${server} weight ${weight}`);
  }

  /**
   * Get server state
   */
  async getServerState(backend: string, server: string): Promise<string> {
    return await this.sendCommand(`show servers state ${backend}`);
  }

  // ============ Session Management ============

  /**
   * Show current sessions
   */
  async showSessions(): Promise<string> {
    return await this.sendCommand('show sess');
  }

  /**
   * Shutdown a specific session
   */
  async shutdownSession(sessionId: string): Promise<string> {
    return await this.sendCommand(`shutdown session ${sessionId}`);
  }

  /**
   * Shutdown all sessions for a server
   */
  async shutdownSessionsServer(backend: string, server: string): Promise<string> {
    return await this.sendCommand(`shutdown sessions server ${backend}/${server}`);
  }

  // ============ Backend Operations ============

  /**
   * Show backend information
   */
  async showBackends(): Promise<string> {
    return await this.sendCommand('show backend');
  }

  /**
   * Enable backend
   */
  async enableBackend(backend: string): Promise<string> {
    return await this.sendCommand(`enable backend ${backend}`);
  }

  /**
   * Disable backend
   */
  async disableBackend(backend: string): Promise<string> {
    return await this.sendCommand(`disable backend ${backend}`);
  }

  // ============ Map and ACL Operations ============

  /**
   * Show map entries
   */
  async showMap(mapFile: string): Promise<string> {
    return await this.sendCommand(`show map ${mapFile}`);
  }

  /**
   * Add map entry
   */
  async addMapEntry(mapFile: string, key: string, value: string): Promise<string> {
    return await this.sendCommand(`add map ${mapFile} ${key} ${value}`);
  }

  /**
   * Delete map entry
   */
  async deleteMapEntry(mapFile: string, key: string): Promise<string> {
    return await this.sendCommand(`del map ${mapFile} ${key}`);
  }

  /**
   * Show ACL entries
   */
  async showACL(aclId: string): Promise<string> {
    return await this.sendCommand(`show acl ${aclId}`);
  }

  /**
   * Add ACL entry
   */
  async addACLEntry(aclId: string, pattern: string): Promise<string> {
    return await this.sendCommand(`add acl ${aclId} ${pattern}`);
  }

  /**
   * Delete ACL entry
   */
  async deleteACLEntry(aclId: string, pattern: string): Promise<string> {
    return await this.sendCommand(`del acl ${aclId} ${pattern}`);
  }

  // ============ Stick Table Operations ============

  /**
   * Show stick table
   */
  async showTable(table: string): Promise<string> {
    return await this.sendCommand(`show table ${table}`);
  }

  /**
   * Clear stick table
   */
  async clearTable(table: string): Promise<string> {
    return await this.sendCommand(`clear table ${table}`);
  }

  // ============ Connection and Rate Operations ============

  /**
   * Show connection information
   */
  async showConnections(): Promise<string> {
    return await this.sendCommand('show info');
  }

  /**
   * Set maxconn (maximum connections)
   */
  async setMaxconn(maxconn: number): Promise<string> {
    return await this.sendCommand(`set maxconn global ${maxconn}`);
  }

  /**
   * Set rate limit
   */
  async setRateLimit(limit: number): Promise<string> {
    return await this.sendCommand(`set rate-limit connections global ${limit}`);
  }

  // ============ Health Check Operations ============

  /**
   * Disable health checks for a server
   */
  async disableHealthCheck(backend: string, server: string): Promise<string> {
    return await this.sendCommand(`disable health ${backend}/${server}`);
  }

  /**
   * Enable health checks for a server
   */
  async enableHealthCheck(backend: string, server: string): Promise<string> {
    return await this.sendCommand(`enable health ${backend}/${server}`);
  }

  // ============ Utility Commands ============

  /**
   * Get command help
   */
  async help(): Promise<string> {
    return await this.sendCommand('help');
  }

  /**
   * Clear counters
   */
  async clearCounters(): Promise<string> {
    return await this.sendCommand('clear counters all');
  }

  /**
   * Show CLI version
   */
  async showCLIVersion(): Promise<string> {
    return await this.sendCommand('show cli version');
  }
}

// Singleton instance
export const haproxyRuntimeClient = new HAProxyRuntimeClient();
