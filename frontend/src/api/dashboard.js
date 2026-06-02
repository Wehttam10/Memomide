import { apiRequest } from './client';

export const getDashboardSummary = () => apiRequest('/dashboard/summary');
export const getAIStatus = () => apiRequest('/dashboard/ai-status');
export const getRevisionDue = () => apiRequest('/revision/due');
export const searchWorkspace = (query) => apiRequest(`/dashboard/search?q=${encodeURIComponent(query)}`);
export const getAwards = () => apiRequest('/dashboard/awards');

