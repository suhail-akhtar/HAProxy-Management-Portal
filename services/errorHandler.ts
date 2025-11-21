/**
 * Shared utility functions for error handling across contexts
 */

import { APIError } from './apiService';

/**
 * Get user-friendly error message from API error
 */
export function getErrorMessage(error: unknown, defaultMessage: string): string {
  if (error instanceof APIError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return defaultMessage;
}

/**
 * Handle API errors consistently across contexts
 * @param error - The error that occurred
 * @param operation - Description of the operation (e.g., "fetch data", "create frontend")
 * @param showToast - Function to show toast notification
 * @returns Error message string
 */
export function handleAPIError(
  error: unknown,
  operation: string,
  showToast?: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void
): string {
  const errorMessage = error instanceof APIError 
    ? error.message 
    : `Failed to ${operation}. Please check your connection.`;
  
  if (showToast) {
    showToast(errorMessage, 'error');
  }
  
  console.error(`Error in ${operation}:`, error);
  
  return errorMessage;
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.includes('fetch') || 
           error.message.includes('network') ||
           error.message.includes('Failed to');
  }
  return false;
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  if (error instanceof APIError) {
    return error.status === 401 || error.status === 403;
  }
  return false;
}
