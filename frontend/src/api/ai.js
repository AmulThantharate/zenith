import api from './client';

export default {
  chat: async (message) => {
    const response = await api.post('/ai/chat', { message });
    return response.data;
  },
};