import api from './api';

export const createUjiAksesReport = async (payload) => {
  const res = await api.post('/api/reports', payload);
  return res.data;
};

export const submitUjiAksesReport = async (id, payload = {}) => {
  const res = await api.patch(`/api/reports/${id}/submit`, payload);
  return res.data;
};

export const listMyUjiAksesReports = async () => {
  const res = await api.get('/api/reports/me');
  return res.data;
};

export const getUjiAksesReportDetail = async (id) => {
  const res = await api.get(`/api/reports/${id}`);
  return res.data;
};

export const adminListUjiAksesReports = async (params = {}) => {
  const res = await api.get('/api/admin/reports', { params });
  return res.data;
};

export const adminGetUjiAksesReportDetail = async (id) => {
  const res = await api.get(`/api/admin/reports/${id}`);
  return res.data;
};

export const uploadUjiAksesEvidence = async (id, questionKey, files = []) => {
  const form = new FormData();
  form.append('questionKey', questionKey);
  files.forEach((file) => form.append('files', file));
  const res = await api.post(`/api/reports/${id}/upload`, form, {
    params: { questionKey },
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

export const deleteUjiAksesEvidence = async (id, questionKey, path) => {
  const res = await api.delete(`/api/reports/${id}/evidence`, {
    data: { questionKey, path }
  });
  return res.data;
};

export const getMyUjiAksesReportByBadan = async (badanPublikId) => {
  const res = await api.get(`/api/reports/by-badan/${badanPublikId}`);
  return res.data?.report || null;
};

export const getUjiAksesQuestions = async () => {
  const res = await api.get('/uji-akses/questions');
  return res.data;
};

export const createUjiAksesQuestion = async (payload) => {
  const res = await api.post('/uji-akses/questions', payload);
  return res.data;
};

export const updateUjiAksesQuestion = async (id, payload) => {
  const res = await api.put(`/uji-akses/questions/${id}`, payload);
  return res.data;
};

export const deleteUjiAksesQuestion = async (id) => {
  const res = await api.delete(`/uji-akses/questions/${id}`);
  return res.data;
};

export const deleteAllUjiAksesQuestions = async () => {
  const res = await api.delete('/uji-akses/questions/all');
  return res.data;
};

export const resetUjiAksesQuestions = async () => {
  const res = await api.post('/uji-akses/questions/reset');
  return res.data;
};
