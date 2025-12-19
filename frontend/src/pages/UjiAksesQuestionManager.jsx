import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  createUjiAksesQuestion,
  deleteAllUjiAksesQuestions,
  deleteUjiAksesQuestion,
  getUjiAksesQuestions,
  resetUjiAksesQuestions,
  updateUjiAksesQuestion
} from '../services/reports';

const emptyOption = () => ({ id: null, label: '', score: 0 });

const UjiAksesQuestionManager = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, message: '', type: 'info' });
  const [confirmState, setConfirmState] = useState({ open: false, type: '', payload: null, message: '' });
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    section: '',
    text: '',
    options: [emptyOption(), emptyOption()]
  });

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const data = await getUjiAksesQuestions();
      setQuestions(data || []);
    } catch (err) {
      setModal({
        open: true,
        message: err.response?.data?.message || 'Gagal memuat pertanyaan',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) loadQuestions();
  }, [isAdmin]);

  const resetForm = () => {
    setEditingId(null);
    setForm({
      section: '',
      text: '',
      options: [emptyOption(), emptyOption()]
    });
  };

  const handleEdit = (q) => {
    setEditingId(q.id);
    setForm({
      section: q.section || '',
      text: q.text || '',
      options: (q.options || []).map((o) => ({
        id: o.id,
        label: o.label,
        score: o.score
      }))
    });
  };

  const updateOption = (idx, patch) => {
    setForm((prev) => {
      const next = prev.options.map((opt, i) => (i === idx ? { ...opt, ...patch } : opt));
      return { ...prev, options: next };
    });
  };

  const addOption = () => {
    setForm((prev) => ({
      ...prev,
      options: [...prev.options, emptyOption()]
    }));
  };

  const removeOption = (idx) => {
    setForm((prev) => {
      const next = prev.options.filter((_, i) => i !== idx);
      return { ...prev, options: next };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanedOptions = form.options
      .map((o) => ({
        id: o.id,
        label: String(o.label || '').trim(),
        score: Number(o.score) || 0
      }))
      .filter((o) => o.label);

    if (!form.text.trim()) {
      setModal({ open: true, message: 'Pertanyaan wajib diisi.', type: 'error' });
      return;
    }
    if (cleanedOptions.length < 2) {
      setModal({ open: true, message: 'Minimal 2 opsi jawaban.', type: 'error' });
      return;
    }

    const payload = {
      section: form.section || null,
      text: form.text,
      options: cleanedOptions
    };

    try {
      if (editingId) {
        await updateUjiAksesQuestion(editingId, payload);
        setModal({ open: true, message: 'Pertanyaan diperbarui.', type: 'success' });
      } else {
        await createUjiAksesQuestion(payload);
        setModal({ open: true, message: 'Pertanyaan dibuat.', type: 'success' });
      }
      resetForm();
      await loadQuestions();
    } catch (err) {
      setModal({
        open: true,
        message: err.response?.data?.message || 'Gagal menyimpan pertanyaan',
        type: 'error'
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteUjiAksesQuestion(id);
      setModal({ open: true, message: 'Pertanyaan dihapus.', type: 'success' });
      await loadQuestions();
    } catch (err) {
      setModal({
        open: true,
        message: err.response?.data?.message || 'Gagal menghapus pertanyaan',
        type: 'error'
      });
    }
  };

  const handleDeleteAll = async () => {
    try {
      await deleteAllUjiAksesQuestions();
      resetForm();
      await loadQuestions();
    } catch (err) {
      setModal({
        open: true,
        message: err.response?.data?.message || 'Gagal menghapus semua pertanyaan',
        type: 'error'
      });
    }
  };

  const handleResetTemplate = async () => {
    try {
      const res = await resetUjiAksesQuestions();
      resetForm();
      await loadQuestions();
    } catch (err) {
      setModal({
        open: true,
        message: err.response?.data?.message || 'Gagal mereset pertanyaan',
        type: 'error'
      });
    }
  };

  const totalQuestions = useMemo(() => questions.length, [questions]);

  const requestConfirm = (type, payload, message) => {
    setConfirmState({ open: true, type, payload, message });
  };

  const closeConfirm = () => {
    setConfirmState({ open: false, type: '', payload: null, message: '' });
  };

  const runConfirm = async () => {
    const { type, payload } = confirmState;
    closeConfirm();
    if (type === 'delete' && payload?.id) {
      await handleDelete(payload.id);
      return;
    }
    if (type === 'deleteAll') {
      await handleDeleteAll();
      return;
    }
    if (type === 'resetTemplate') {
      await handleResetTemplate();
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-6 rounded-2xl border border-slate-200 bg-white text-slate-700">
        Halaman ini hanya untuk admin.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-sm text-slate-500">Kelola rubrik uji akses</p>
          <h1 className="text-2xl font-bold text-slate-900">Pertanyaan Uji Akses</h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs px-3 py-2 rounded-full bg-slate-100 border border-slate-200 text-slate-600">
            {totalQuestions} pertanyaan
          </span>
          <button
            type="button"
            onClick={() =>
              requestConfirm('resetTemplate', null, 'Pulihkan ke pertanyaan template? Semua perubahan akan diganti.')
            }
            className="px-3 py-2 rounded-xl border border-emerald-200 text-emerald-700 text-xs hover:bg-emerald-50"
          >
            Reset ke template
          </button>
          <button
            type="button"
            onClick={() =>
              requestConfirm('deleteAll', null, 'Hapus semua pertanyaan? Tindakan ini tidak bisa dibatalkan.')
            }
            className="px-3 py-2 rounded-xl border border-rose-200 text-rose-600 text-xs hover:bg-rose-50"
          >
            Hapus semua
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          {loading ? (
            <div className="p-4 rounded-2xl border border-slate-200 bg-white text-slate-600">Memuat...</div>
          ) : questions.length === 0 ? (
            <div className="p-4 rounded-2xl border border-slate-200 bg-white text-slate-600">Belum ada pertanyaan.</div>
          ) : (
            questions.map((q) => (
              <div key={q.id} className="bg-white rounded-3xl border border-slate-200 shadow-soft p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{q.text}</div>
                    {q.section && <div className="text-xs text-slate-500 mt-1">{q.section}</div>}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(q)}
                      className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs hover:bg-slate-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => requestConfirm('delete', { id: q.id }, 'Hapus pertanyaan ini?')}
                      className="px-3 py-2 rounded-xl border border-rose-200 text-rose-600 text-xs hover:bg-rose-50"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options?.map((opt) => (
                    <div
                      key={opt.id}
                      className="flex items-center justify-between px-3 py-2 rounded-2xl border border-slate-200 bg-slate-50"
                    >
                      <div className="text-sm text-slate-800">{opt.label}</div>
                      <div className="text-xs font-semibold text-slate-600">Skor {opt.score}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-soft p-4 space-y-4">
          <div>
            <div className="text-sm font-semibold text-slate-900">
              {editingId ? 'Edit Pertanyaan' : 'Tambah Pertanyaan'}
            </div>
            <p className="text-xs text-slate-500">Semua opsi adalah pilihan tunggal (radio).</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-600">Section</label>
              <input
                value={form.section}
                onChange={(e) => setForm((prev) => ({ ...prev, section: e.target.value }))}
                className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm"
                placeholder="Contoh: A. Kemudahan Cara"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Pertanyaan</label>
              <textarea
                value={form.text}
                onChange={(e) => setForm((prev) => ({ ...prev, text: e.target.value }))}
                rows={4}
                className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm"
                placeholder="Tulis pertanyaan"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-600">Opsi & skor</label>
                <button
                  type="button"
                  onClick={addOption}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  + Tambah opsi
                </button>
              </div>
              {form.options.map((opt, idx) => (
                <div key={`${opt.id || 'new'}-${idx}`} className="grid grid-cols-1 gap-2">
                  <input
                    value={opt.label}
                    onChange={(e) => updateOption(idx, { label: e.target.value })}
                    className="border border-slate-200 rounded-xl px-3 py-2 text-sm"
                    placeholder={`Opsi ${idx + 1}`}
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={opt.score}
                      onChange={(e) => updateOption(idx, { score: e.target.value })}
                      className="w-24 border border-slate-200 rounded-xl px-3 py-2 text-sm"
                      placeholder="Skor"
                    />

                    {form.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(idx)}
                        className="text-xs text-rose-600 hover:underline"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold shadow-soft hover:bg-emerald-700"
              >
                {editingId ? 'Simpan Perubahan' : 'Tambah Pertanyaan'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-sm hover:bg-slate-50"
                >
                  Batal
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
      {modal.open && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Notifikasi</h3>
            <p
              className={`text-sm ${
                modal.type === 'error' ? 'text-rose-700' : modal.type === 'success' ? 'text-emerald-700' : 'text-slate-700'
              }`}
            >
              {modal.message}
            </p>
            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={() => setModal({ open: false, message: '', type: 'info' })}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold shadow-soft hover:bg-slate-800"
              >
                Oke
              </button>
            </div>
          </div>
        </div>
      )}
      {confirmState.open && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Konfirmasi</h3>
            <p className="text-sm text-slate-700">{confirmState.message}</p>
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={closeConfirm}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={runConfirm}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold shadow-soft hover:bg-slate-800"
              >
                Ya, lanjut
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UjiAksesQuestionManager;
