import { EmailTemplate } from '../models/index.js';

export const getAllTemplates = async (req, res) => {
  try {
    const templates = await EmailTemplate.findAll({
      order: [['is_default', 'DESC'], ['created_at', 'ASC']],
    });
    return res.status(200).json({ success: true, data: templates });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengambil template email' });
  }
};

export const getTemplateById = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await EmailTemplate.findByPk(id);
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template tidak ditemukan' });
    }
    return res.status(200).json({ success: true, data: template });
  } catch (error) {
    console.error('Error fetching template by ID:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengambil template email' });
  }
};

export const upsertTemplate = async (req, res) => {
  try {
    const { id, name, description, subject, body, is_default } = req.body;
    const userId = req.user?.id;

    if (!id || !name || !subject || !body) {
      return res.status(400).json({ success: false, message: 'ID, Nama, Subjek, dan Isi wajib diisi' });
    }

    const [template, created] = await EmailTemplate.upsert({
      id,
      name,
      description: description || null,
      subject,
      body,
      is_default: !!is_default,
      user_id: userId,
    });

    return res.status(200).json({
      success: true,
      message: created ? 'Template berhasil dibuat' : 'Template berhasil diperbarui',
      data: template,
    });
  } catch (error) {
    console.error('Error upserting template:', error);
    return res.status(500).json({ success: false, message: 'Gagal menyimpan template email' });
  }
};

export const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await EmailTemplate.findByPk(id);
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template tidak ditemukan' });
    }

    await template.destroy();
    return res.status(200).json({ success: true, message: 'Template berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting template:', error);
    return res.status(500).json({ success: false, message: 'Gagal menghapus template email' });
  }
};
