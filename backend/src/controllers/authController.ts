import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { dataStore } from '../services/dataStore';
import { LoginRequest, LoginResponse } from '../models/types';

export const login = async (req: Request<{}, {}, LoginRequest>, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }

    // Find user
    const user = dataStore.getUserByEmail(email);
    
    if (!user || user.password !== password) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    // Generate JWT token
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const options: jwt.SignOptions = { 
      expiresIn: config.jwt.expiresIn as any
    };
    const token = jwt.sign(payload, config.jwt.secret, options);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    const response: LoginResponse = {
      success: true,
      token,
      user: userWithoutPassword,
    };

    res.json(response);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
};

export const validateToken = async (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Token is valid',
  });
};
