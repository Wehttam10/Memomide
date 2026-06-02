import { apiRequest } from './client';

export const getDashboardSummary = () => apiRequest('/dashboard/summary');
export const getAIStatus = () => apiRequest('/dashboard/ai-status');
export const getRevisionDue = () => apiRequest('/revision/due');
