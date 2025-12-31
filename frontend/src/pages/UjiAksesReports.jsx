import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { listMyUjiAksesReports, getUjiAksesQuestions } from '../services/reports';
import {
  buildQuestionColumns,
  exportUjiAksesCsv,
  exportUjiAksesPdf,
  exportUjiAksesXlsx,
  formatDate
} from '../utils/ujiAksesReportExport';

const UjiAksesReports = () => {
  const [reports, setReports] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listMyUjiAksesReports();
      setReports(data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat laporan');
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const loadQuestions = useCallback(async () => {
    setQuestionsLoading(true);
    try {
      const data = await getUjiAksesQuestions();
      setQuestions(data || []);
      return data || [];
    } catch (_err) {
      setQuestions([]);
      return [];
    } finally {
      setQuestionsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const sorted = useMemo(() => {
    return (reports || []).slice().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [reports]);

  const questionColumns = useMemo(() => buildQuestionColumns(questions), [questions]);

  const ensureQuestionsLoaded = useCallback(async () => {
    if (questions.length) return questions;
    return loadQuestions();
  }, [questions, loadQuestions]);

  const exportCsv = async () => {
    const questionList = await ensureQuestionsLoaded();
    exportUjiAksesCsv({
      reports: sorted,
      questionList,
      includeUser: false,
      filename: 'uji-akses-reports.csv'
    });
  };

  const exportXlsx = async () => {
    const questionList = await ensureQuestionsLoaded();
    await exportUjiAksesXlsx({
      reports: sorted,
      questionList,
      includeUser: false,
      filename: 'uji-akses-reports.xlsx'
    });
  };

  const exportPdf = async () => {
    const questionList = await ensureQuestionsLoaded();
    await exportUjiAksesPdf({
      reports: sorted,
      questionList,
      includeUser: false,
      filename: 'uji-akses-reports.pdf',
      title: 'Laporan Uji Akses'
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Laporan Uji Akses</h1>
          <p className="text-sm text-slate-600">Daftar laporan uji akses yang Anda buat.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={exportCsv}
            disabled={questionsLoading}
            className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm"
          >
            Export CSV
          </button>
          <button
            onClick={exportXlsx}
            disabled={questionsLoading}
            className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm"
          >
            Export Excel
          </button>
          <button
            onClick={exportPdf}
            disabled={questionsLoading}
            className="px-3 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-sm disabled:opacity-50"
          >
            Export PDF
          </button>
          <Link
            to="/laporan/uji-akses/new"
            className="px-4 py-2 rounded-xl bg-primary text-white font-semibold shadow-soft hover:bg-emerald-700 text-sm"
          >
            Buat Laporan
          </Link>
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">{error}</div>
      )}

      <div className="bg-white rounded-3xl border border-slate-200 shadow-soft p-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-600">
              <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.08em]">Tanggal</th>
              <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.08em]">Badan Publik</th>
              <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.08em]">Status</th>
              <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.08em]">Total Skor</th>
              <th className="px-4 py-3 text-right text-[11px] uppercase tracking-[0.08em]">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-6 text-center text-slate-500" colSpan={5}>
                  Memuat...
                </td>
              </tr>
            ) : sorted.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center text-slate-500" colSpan={5}>
                  Belum ada laporan.
                </td>
              </tr>
            ) : (
              sorted.map((r) => (
                <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3">{formatDate(r.created_at || r.createdAt)}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900">{r.badanPublik?.nama_badan_publik || '-'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full border ${
                        r.status === 'submitted'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{r.total_skor ?? 0}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/laporan/uji-akses/${r.id}`}
                      className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm"
                    >
                      Detail
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UjiAksesReports;
