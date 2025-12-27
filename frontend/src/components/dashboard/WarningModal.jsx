const formatDateTime = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  const datePart = date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  const timePart = date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  });
  return `${datePart} ${timePart}`;
};

const WarningModal = ({ open, items = [], onCancel, onConfirm }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg border border-amber-100">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-700 border border-amber-200">
            Peringatan
          </span>
          <h3 className="text-lg font-bold text-slate-900">Sudah pernah dikirimi email</h3>
        </div>
        <p className="text-sm text-slate-600 mb-4">
          Beberapa badan publik di daftar penerima sudah pernah dikirimi email. Anda tetap boleh mengirim ulang.
        </p>
        <div className="max-h-48 overflow-auto border border-slate-100 rounded-xl mb-4">
          {items.length === 0 ? (
            <div className="px-4 py-3 text-sm text-slate-500">Tidak ada data.</div>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500">
                  <th className="px-4 py-2 text-left text-[11px] uppercase tracking-[0.08em]">Badan Publik</th>
                  <th className="px-4 py-2 text-left text-[11px] uppercase tracking-[0.08em]">Terakhir Kirim</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-t border-slate-100">
                    <td className="px-4 py-2 text-slate-800">{item.name || '-'}</td>
                    <td className="px-4 py-2 text-slate-600">{formatDateTime(item.lastSentAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 rounded-xl bg-amber-500 text-white font-semibold shadow-soft hover:bg-amber-600"
          >
            Lanjut Kirim
          </button>
        </div>
      </div>
    </div>
  );
};

export default WarningModal;
