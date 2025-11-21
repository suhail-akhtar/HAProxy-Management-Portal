import { Request, Response } from 'express';
import { dataStore } from '../services/dataStore';

export const getAllFrontends = (req: Request, res: Response) => {
  try {
    const frontends = dataStore.getFrontends();
    res.json({
      success: true,
      data: frontends,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch frontends',
    });
  }
};

export const getFrontendById = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const frontend = dataStore.getFrontendById(id);
    
    if (!frontend) {
      return res.status(404).json({
        success: false,
        error: 'Frontend not found',
      });
    }

    res.json({
      success: true,
      data: frontend,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch frontend',
    });
  }
};

export const createFrontend = (req: Request, res: Response) => {
  try {
    const frontend = dataStore.addFrontend(req.body);
    res.status(201).json({
      success: true,
      data: frontend,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create frontend',
    });
  }
};

export const updateFrontend = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const frontend = dataStore.updateFrontend(id, req.body);
    
    if (!frontend) {
      return res.status(404).json({
        success: false,
        error: 'Frontend not found',
      });
    }

    res.json({
      success: true,
      data: frontend,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update frontend',
    });
  }
};

export const deleteFrontend = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = dataStore.deleteFrontend(id);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Frontend not found',
      });
    }

    res.json({
      success: true,
      message: 'Frontend deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete frontend',
    });
  }
};
