import api from './api';

export const getApiTemplates = async () => {
  try {
    const res = await api.get('/templates');
    return res.data?.data || [];
  } catch (err) {
    console.error('Failed to fetch templates from API:', err);
    return null;
  }
};

export const saveApiTemplate = async (templateData) => {
  try {
    const res = await api.post('/templates', templateData);
    return res.data;
  } catch (err) {
    console.error('Failed to save template to API:', err);
    throw err;
  }
};

export const deleteApiTemplate = async (templateId) => {
  try {
    const res = await api.delete(`/templates/${templateId}`);
    return res.data;
  } catch (err) {
    console.error('Failed to delete template from API:', err);
    throw err;
  }
};
