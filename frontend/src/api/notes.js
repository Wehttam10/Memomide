import { apiRequest, jsonOptions } from './client';

export const getNotes = (topicId) => apiRequest(`/topics/${topicId}/notes`);
export const createNote = (topicId, payload) => apiRequest(`/topics/${topicId}/notes`, jsonOptions('POST', payload));
export const updateNote = (id, payload) => apiRequest(`/notes/${id}`, jsonOptions('PUT', payload));
export const deleteNote = (id) => apiRequest(`/notes/${id}`, { method: 'DELETE' });
