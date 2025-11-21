import { Request, Response } from 'express';
import { dataStore } from '../services/dataStore';

export const getStats = (req: Request, res: Response) => {
  try {
    const stats = dataStore.getStats();
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stats',
    });
  }
};

export const getSystemHealth = (req: Request, res: Response) => {
  try {
    const health = dataStore.getSystemHealth();
    res.json({
      success: true,
      data: health,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch system health',
    });
  }
};

export const getLogs = (req: Request, res: Response) => {
  try {
    const logs = dataStore.getLogs();
    res.json({
      success: true,
      data: logs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch logs',
    });
  }
};

export const getACLs = (req: Request, res: Response) => {
  try {
    const acls = dataStore.getACLs();
    res.json({
      success: true,
      data: acls,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch ACLs',
    });
  }
};

export const createACL = (req: Request, res: Response) => {
  try {
    const acl = dataStore.addACL(req.body);
    res.status(201).json({
      success: true,
      data: acl,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create ACL',
    });
  }
};

export const deleteACL = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = dataStore.deleteACL(id);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'ACL not found',
      });
    }

    res.json({
      success: true,
      message: 'ACL deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete ACL',
    });
  }
};

export const getConfigHistory = (req: Request, res: Response) => {
  try {
    const history = dataStore.getConfigHistory();
    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch config history',
    });
  }
};

export const getCurrentConfig = (req: Request, res: Response) => {
  try {
    const config = dataStore.getCurrentConfig();
    res.json({
      success: true,
      data: config,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch current config',
    });
  }
};

export const saveConfig = (req: Request, res: Response) => {
  try {
    const { content, comment, author } = req.body;
    
    if (!content || !comment || !author) {
      return res.status(400).json({
        success: false,
        error: 'Content, comment, and author are required',
      });
    }

    const version = dataStore.saveConfig(content, comment, author);
    res.json({
      success: true,
      data: version,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to save config',
    });
  }
};

export const rollbackConfig = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = dataStore.rollbackConfig(id);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Config version not found',
      });
    }

    res.json({
      success: true,
      message: 'Config rolled back successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to rollback config',
    });
  }
};

export const getAlerts = (req: Request, res: Response) => {
  try {
    const alerts = dataStore.getAlerts();
    res.json({
      success: true,
      data: alerts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch alerts',
    });
  }
};

export const deleteAlert = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = dataStore.deleteAlert(id);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found',
      });
    }

    res.json({
      success: true,
      message: 'Alert deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete alert',
    });
  }
};

export const getCertificates = (req: Request, res: Response) => {
  try {
    const certificates = dataStore.getCertificates();
    res.json({
      success: true,
      data: certificates,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch certificates',
    });
  }
};

export const getHANodes = (req: Request, res: Response) => {
  try {
    const nodes = dataStore.getHANodes();
    res.json({
      success: true,
      data: nodes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch HA nodes',
    });
  }
};

export const getAnalytics = (req: Request, res: Response) => {
  try {
    const analytics = dataStore.getAnalytics();
    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics',
    });
  }
};

export const getUsers = (req: Request, res: Response) => {
  try {
    const users = dataStore.getUsers();
    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users',
    });
  }
};

export const createUser = (req: Request, res: Response) => {
  try {
    const user = dataStore.addUser(req.body);
    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create user',
    });
  }
};

export const deleteUser = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = dataStore.deleteUser(id);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete user',
    });
  }
};

export const getReports = (req: Request, res: Response) => {
  try {
    const reports = dataStore.getReports();
    res.json({
      success: true,
      data: reports,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reports',
    });
  }
};

export const generateReport = (req: Request, res: Response) => {
  try {
    const { title, type, generatedBy } = req.body;
    
    if (!title || !type || !generatedBy) {
      return res.status(400).json({
        success: false,
        error: 'Title, type, and generatedBy are required',
      });
    }

    const report = dataStore.addReport({
      title,
      type,
      generatedBy,
      date: new Date().toISOString(),
      size: '0 KB',
      status: 'generating',
    });

    // Simulate report generation
    setTimeout(() => {
      const reports = dataStore.getReports();
      const generatedReport = reports.find(r => r.id === report.id);
      if (generatedReport) {
        generatedReport.status = 'ready';
        generatedReport.size = `${Math.floor(Math.random() * 5000) + 500} KB`;
      }
    }, 5000);

    res.status(201).json({
      success: true,
      data: report,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate report',
    });
  }
};

export const deleteReport = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = dataStore.deleteReport(id);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Report not found',
      });
    }

    res.json({
      success: true,
      message: 'Report deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete report',
    });
  }
};

export const getDashboard = (req: Request, res: Response) => {
  try {
    const state = dataStore.getState();
    res.json({
      success: true,
      data: {
        frontends: state.frontends,
        backends: state.backends,
        statsHistory: state.statsHistory,
        logs: state.logs.slice(0, 10), // Recent logs only
        systemHealth: state.systemHealth,
        alerts: state.alerts.filter(a => a.active),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard data',
    });
  }
};

export const getSettings = (req: Request, res: Response) => {
  try {
    const state = dataStore.getState();
    res.json({
      success: true,
      data: state.settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch settings',
    });
  }
};

export const updateSettings = (req: Request, res: Response) => {
  try {
    const settings = dataStore.updateSettings(req.body);
    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update settings',
    });
  }
};
