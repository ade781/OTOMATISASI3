import api from './api';

export const fetchConversations = async () => {
  const res = await api.get('/messages/conversations');
  return res.data || [];
};

export const fetchThread = async (peerId) => {
  const res = await api.get(`/messages/thread/${peerId}`);
  return res.data;
};

export const sendMessage = async (recipientId, content) => {
  const res = await api.post('/messages', { recipientId, content });
  return res.data;
};
