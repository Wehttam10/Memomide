import { apiRequest, apiResponse, jsonOptions } from './client';

export async function generateQuestions(topicId) {
  const { data, response } = await apiResponse(`/topics/${topicId}/generate-questions`, { method: 'POST' });
  return {
    questions: data,
    aiMode: response.headers.get('X-AI-Mode') || 'mock',
    fallbackReason: response.headers.get('X-AI-Fallback-Reason') || '',
  };
}
export const getQuestions = (topicId) => apiRequest(`/topics/${topicId}/questions`);
export const submitAttempt = (questionId, payload) => apiRequest(`/questions/${questionId}/attempt`, jsonOptions('POST', payload));
export const getAttempts = (topicId) => apiRequest(`/topics/${topicId}/attempts`);
