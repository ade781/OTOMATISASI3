import { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const AddUser = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [form, setForm] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAdmin) {
    return (
      <div className="p-6 rounded-2xl border border-slate-200 bg-white text-slate-700">
        Halaman ini hanya untuk admin.
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await api.post('/users', {
        username: form.username,
        password: form.password
      });
      setMessage(res.data?.message || 'User berhasil dibuat');
      setForm({ username: '', password: '' });
    } catch (err) {
      setMessage(err.response?.data?.message || 'Gagal membuat user');
    } finally {
      setLoading(false);
    }
  };

  const infoItems = [
    'Role otomatis "user" (tanpa akses admin).',
    'User hanya dapat melihat badan publik yang ditugaskan.',
    'Siapkan SMTP pribadi di halaman Pengaturan agar bisa mengirim.',
    'Gunakan password kuat, admin bisa reset lewat DB jika lupa.'
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Kelola akun</p>
          <h1 className="text-2xl font-bold text-slate-900">Tambah User Baru</h1>
        </div>
        <span className="px-3 py-2 rounded-full bg-primary/10 text-primary text-xs font-semibold">
          Admin only
        </span>
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl shadow-soft p-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 space-y-3">
            <div className="text-sm text-slate-600">
              Buat akun dengan cepat. Role default <span className="font-semibold">user</span> sehingga akses terbatas
              hanya pada penugasan.
            </div>
            {message && (
              <div className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700">
                {message}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-3 max-w-md">
              <div>
                <label className="text-sm font-semibold text-slate-700">Username</label>
            <input
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
              autoComplete="username"
              className="mt-1 w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="contoh: user01"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              autoComplete="new-password"
              className="mt-1 w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="minimal 8 karakter"
            />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-3 rounded-xl bg-primary text-white font-semibold shadow-soft hover:bg-emerald-700 disabled:opacity-60"
                >
                  {loading ? 'Memproses...' : 'Tambah User'}
                </button>
                <span className="text-xs text-slate-500">Role: user (default)</span>
              </div>
            </form>
          </div>
          <div className="md:w-80 rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2">
            <div className="text-sm font-semibold text-slate-800">Catatan cepat</div>
            <ul className="list-disc pl-4 text-xs text-slate-600 space-y-1">
              {infoItems.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddUser;
