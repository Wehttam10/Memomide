import { apiRequest, jsonOptions } from './client';

export const getSubjects = () => apiRequest('/subjects');
export const getSubject = (id) => apiRequest(`/subjects/${id}`);
export const createSubject = (payload) => apiRequest('/subjects', jsonOptions('POST', payload));
export const updateSubject = (id, payload) => apiRequest(`/subjects/${id}`, jsonOptions('PUT', payload));
export const deleteSubject = (id) => apiRequest(`/subjects/${id}`, { method: 'DELETE' });
export const chatWithSubject = (id, message) => apiRequest(`/subjects/${id}/chat`, jsonOptions('POST', { message }));
export const summarizeSubjectSource = (id, payload) => apiRequest(`/subjects/${id}/summarize`, jsonOptions('POST', payload));
