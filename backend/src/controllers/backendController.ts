import { Request, Response } from 'express';
import { dataStore } from '../services/dataStore';

export const getAllBackends = (req: Request, res: Response) => {
  try {
    const backends = dataStore.getBackends();
    res.json({
      success: true,
      data: backends,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch backends',
    });
  }
};

export const getBackendById = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const backend = dataStore.getBackendById(id);
    
    if (!backend) {
      return res.status(404).json({
        success: false,
        error: 'Backend not found',
      });
    }

    res.json({
      success: true,
      data: backend,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch backend',
    });
  }
};

export const createBackend = (req: Request, res: Response) => {
  try {
    const backend = dataStore.addBackend(req.body);
    res.status(201).json({
      success: true,
      data: backend,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create backend',
    });
  }
};

export const deleteBackend = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = dataStore.deleteBackend(id);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Backend not found',
      });
    }

    res.json({
      success: true,
      message: 'Backend deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete backend',
    });
  }
};

export const updateServerStatus = (req: Request, res: Response) => {
  try {
    const { backendId, serverId } = req.params;
    const { status } = req.body;

    if (!['up', 'down', 'maint'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be up, down, or maint',
      });
    }

    const success = dataStore.updateServerStatus(backendId, serverId, status);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Backend or server not found',
      });
    }

    res.json({
      success: true,
      message: 'Server status updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update server status',
    });
  }
};
