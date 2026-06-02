import { apiRequest, jsonOptions } from './client';

export const getTopics = (subjectId) => apiRequest(`/subjects/${subjectId}/topics`);
export const createTopic = (subjectId, payload) => apiRequest(`/subjects/${subjectId}/topics`, jsonOptions('POST', payload));
export const getTopic = (id) => apiRequest(`/topics/${id}`);
export const updateTopic = (id, payload) => apiRequest(`/topics/${id}`, jsonOptions('PUT', payload));
export const deleteTopic = (id) => apiRequest(`/topics/${id}`, { method: 'DELETE' });
