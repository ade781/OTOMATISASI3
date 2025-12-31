import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import UjiAksesQuestionCard from '../components/reports/UjiAksesQuestionCard';
import { computeUjiAksesScores, isUjiAksesComplete, normalizeAnswers } from '../constants/ujiAksesRubric';
import {
  createUjiAksesReport,
  deleteUjiAksesEvidence,
  getMyUjiAksesReportByBadan,
  getUjiAksesQuestions,
  getUjiAksesReportDetail,
  listMyUjiAksesReports,
  submitUjiAksesReport,
  uploadUjiAksesEvidence
} from '../services/reports';

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
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
  return `${datePart}: ${timePart}`;
};

const UjiAksesReportForm = ({ reportId }) => {
  const navigate = useNavigate();
  const [badanPublik, setBadanPublik] = useState([]);
  const [loadingBadan, setLoadingBadan] = useState(true);
  const [loadingReport, setLoadingReport] = useState(Boolean(reportId));
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [reportedBadanIds, setReportedBadanIds] = useState(() => new Set());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [questions, setQuestions] = useState([]);

  const [selectedBadanId, setSelectedBadanId] = useState('');
  const [report, setReport] = useState(null);
  const [answers, setAnswers] = useState({});
  const [evidences, setEvidences] = useState({});
  const [pendingFiles, setPendingFiles] = useState(() => ({}));

  const computed = useMemo(() => computeUjiAksesScores(questions, answers), [questions, answers]);
  const totalMax = useMemo(() => {
    return questions.reduce((sum, q) => {
      const maxScore = Math.max(0, ...((q.options || []).map((o) => Number(o.score) || 0)));
      return sum + maxScore;
    }, 0);
  }, [questions]);
  const canEdit = true;
  const MAX_FILE_SIZE = 2 * 1024 * 1024;
  const MAX_FILES_PER_QUESTION = 2;

  const loadBadanPublik = useCallback(async () => {
    setLoadingBadan(true);
    try {
      const res = await api.get('/badan-publik');
      setBadanPublik(res.data || []);
    } catch (_err) {
      setBadanPublik([]);
    } finally {
      setLoadingBadan(false);
    }
  }, []);

  const loadReport = useCallback(async () => {
    if (!reportId) return;
    setLoadingReport(true);
    setError('');
    try {
      const data = await getUjiAksesReportDetail(reportId);
      const r = data?.report;
      const rubric = data?.rubric || [];
      setReport(r);
      setQuestions(rubric);
      setSelectedBadanId(String(r?.badan_publik_id || ''));
      setAnswers(normalizeAnswers(rubric, r?.answers || {}));
      setEvidences(r?.evidences || {});
      setPendingFiles({});
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat laporan');
    } finally {
      setLoadingReport(false);
    }
  }, [reportId]);

  const loadQuestions = useCallback(async () => {
    if (reportId) return;
    setLoadingQuestions(true);
    try {
      const data = await getUjiAksesQuestions();
      setQuestions(data || []);
      setAnswers(normalizeAnswers(data || [], {}));
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat pertanyaan');
    } finally {
      setLoadingQuestions(false);
    }
  }, [reportId]);

  useEffect(() => {
    loadBadanPublik();
  }, [loadBadanPublik]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  useEffect(() => {
    if (reportId) return;
    let active = true;
    const loadReported = async () => {
      try {
        const data = await listMyUjiAksesReports();
        if (!active) return;
        const ids = new Set((data || []).map((item) => item?.badan_publik_id).filter(Boolean));
        setReportedBadanIds(ids);
      } catch (_err) {
        if (active) setReportedBadanIds(new Set());
      }
    };
    loadReported();
    return () => {
      active = false;
    };
  }, [reportId]);

  useEffect(() => {
    if (!selectedBadanId || reportId) return;
    let active = true;
    const checkExisting = async () => {
      try {
        const existing = await getMyUjiAksesReportByBadan(selectedBadanId);
        if (active && existing?.id) {
          navigate(`/laporan/uji-akses/${existing.id}`, { replace: true });
        }
      } catch (err) {
        // abaikan jika belum ada laporan
      }
    };
    checkExisting();
    return () => {
      active = false;
    };
  }, [selectedBadanId, reportId, navigate]);

  const updateAnswer = (key, patch) => {
    setAnswers((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  };

  const pickFiles = (questionKey, files) => {
    setPendingFiles((prev) => {
      const current = Array.isArray(prev[questionKey]) ? prev[questionKey] : [];
      const existingCount = Array.isArray(evidences?.[questionKey]) ? evidences[questionKey].length : 0;
      const allowedCount = Math.max(0, MAX_FILES_PER_QUESTION - existingCount);
      const remainingSlots = Math.max(0, allowedCount - current.length);
      const normalized = Array.isArray(files) ? files : [];
      const validFiles = normalized.filter((file) => file.size <= MAX_FILE_SIZE);
      const rejectedCount = normalized.length - validFiles.length;

      if (rejectedCount > 0) {
        setError('Ukuran file maksimal 2MB per file.');
      }
      if (remainingSlots <= 0) {
        setError('Maksimal 2 file per pertanyaan.');
        return prev;
      }

      return { ...prev, [questionKey]: [...current, ...validFiles.slice(0, remainingSlots)] };
    });
  };

  const doUploadForQuestion = async (id, questionKey) => {
    const files = pendingFiles?.[questionKey] || [];
    if (!files.length) return;
    const res = await uploadUjiAksesEvidence(id, questionKey, files);
    setEvidences(res?.evidences || {});
    setPendingFiles((prev) => ({ ...prev, [questionKey]: [] }));
  };

  const buildPayloadAnswers = () => {
    const payload = {};
    for (const q of questions) {
      payload[q.key] = {
        optionKey: answers?.[q.key]?.optionKey || null,
        catatan: answers?.[q.key]?.catatan || ''
      };
    }
    return payload;
  };

  const submit = async () => {
    setError('');
    setInfo('');
    if (!selectedBadanId) {
      setError('Pilih badan publik terlebih dulu.');
      return;
    }
    if (!isUjiAksesComplete(questions, answers)) {
      setError('Semua pertanyaan wajib dijawab untuk submit.');
      return;
    }

    setSaving(true);
    try {
      let current = report;
      const answersPayload = buildPayloadAnswers();

      if (!current?.id) {
        const badanPublikId = Number(selectedBadanId);
        current = await createUjiAksesReport({
          badanPublikId,
          answers: answersPayload
        });
        setReport(current);
        setEvidences(current?.evidences || {});
      }

      const id = current.id;
      for (const q of questions) {
        await doUploadForQuestion(id, q.key);
      }

      const updated = await submitUjiAksesReport(id, { answers: answersPayload });
      setReport(updated);
      setInfo('Laporan berhasil disimpan.');
      navigate(`/laporan/uji-akses/${id}`, { replace: true });
    } catch (err) {
      if (err.response?.status === 409 && err.response?.data?.report?.id) {
        navigate(`/laporan/uji-akses/${err.response.data.report.id}`, { replace: true });
        return;
      }
      setError(err.response?.data?.message || 'Gagal menyimpan laporan');
    } finally {
      setSaving(false);
    }
  };

  const selectedBadan = useMemo(
    () => badanPublik.find((b) => String(b.id) === String(selectedBadanId)),
    [badanPublik, selectedBadanId]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{reportId ? 'Detail Laporan Uji Akses' : 'Buat Laporan Uji Akses'}</h1>
          <p className="text-sm text-slate-600">Rubrik: {questions.length} pertanyaan.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to="/laporan/uji-akses"
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm"
          >
            Kembali
          </Link>
          {canEdit && (
            <>
              <button
                onClick={submit}
                className="px-4 py-2 rounded-xl bg-primary text-white font-semibold shadow-soft hover:bg-emerald-700 text-sm"
                disabled={saving}
                type="button"
              >
                Simpan
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">{error}</div>
      )}
      {info && (
        <div className="px-4 py-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">{info}</div>
      )}

      <div className="bg-white rounded-3xl border border-slate-200 shadow-soft p-5 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-slate-700">Badan Publik yang diuji</label>
            <select
              value={selectedBadanId}
              onChange={(e) => setSelectedBadanId(e.target.value)}
              disabled={!canEdit || loadingBadan || loadingReport || Boolean(report?.id || reportId)}
              className="w-full border border-slate-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            >
              <option value="">{loadingBadan ? 'Memuat...' : 'Pilih badan publik'}</option>
              {badanPublik.map((b) => (
                <option
                  key={b.id}
                  value={b.id}
                  style={reportedBadanIds.has(b.id) ? { backgroundColor: '#ecfdf3' } : undefined}
                >
                  {b.nama_badan_publik} - {b.kategori}
                </option>
              ))}
            </select>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-xs font-semibold text-slate-500">Total Skor</div>
            <div className="text-3xl font-extrabold text-slate-900">{computed.totalSkor}</div>
            <div className="text-xs text-slate-500">Maks: {totalMax}</div>
          </div>
        </div>

        {report?.id && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-slate-600">
            <div>
              <span className="font-semibold text-slate-700">ID:</span> {report.id}
            </div>
            <div>
              <span className="font-semibold text-slate-700">Status:</span>{' '}
              <span
                className={`text-xs px-2 py-1 rounded-full border ${
                  report.status === 'submitted'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                {report.status}
              </span>
            </div>
            <div>
              <span className="font-semibold text-slate-700">Dibuat:</span> {formatDate(report.created_at || report.createdAt)}
            </div>
          </div>
        )}
        {selectedBadan && (
          <div className="text-sm text-slate-600">
            <span className="font-semibold text-slate-700">Terpilih:</span> {selectedBadan.nama_badan_publik}
          </div>
        )}
      </div>

      <div className="space-y-4">
        {(loadingReport || loadingQuestions) && (
          <div className="px-4 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-600">
            Memuat pertanyaan...
          </div>
        )}
        {!loadingReport &&
          !loadingQuestions &&
          questions.map((q, idx) => (
            <UjiAksesQuestionCard
              key={q.key}
              number={idx + 1}
              text={q.text}
              options={q.options}
              value={answers?.[q.key]?.optionKey || null}
              catatan={answers?.[q.key]?.catatan || ''}
              onChangeOption={(optKey) => updateAnswer(q.key, { optionKey: optKey })}
              onChangeCatatan={(val) => updateAnswer(q.key, { catatan: val })}
              disabled={!canEdit || loadingReport}
              evidences={evidences?.[q.key] || []}
              pendingFiles={pendingFiles?.[q.key] || []}
              onPickFiles={(files) => pickFiles(q.key, files)}
              onRemovePending={(idx) =>
                setPendingFiles((prev) => {
                  const current = Array.isArray(prev[q.key]) ? prev[q.key] : [];
                  const next = current.filter((_, i) => i !== idx);
                  return { ...prev, [q.key]: next };
                })
              }
              onDeleteEvidence={async (filePath) => {
                if (!report?.id) return;
                setError('');
                setInfo('');
                try {
                  setSaving(true);
                  const res = await deleteUjiAksesEvidence(report.id, q.key, filePath);
                  setEvidences(res?.evidences || {});
                  setInfo('Bukti berhasil dihapus.');
                } catch (err) {
                  setError(err.response?.data?.message || 'Gagal menghapus bukti');
                } finally {
                  setSaving(false);
                }
              }}
              onUploadNow={
                report?.id
                  ? async () => {
                      setError('');
                      setInfo('');
                      try {
                        setSaving(true);
                        await doUploadForQuestion(report.id, q.key);
                        setInfo('Bukti berhasil diupload.');
                      } catch (err) {
                        setError(err.response?.data?.message || 'Gagal upload bukti');
                      } finally {
                        setSaving(false);
                      }
                    }
                  : null
              }
            />
          ))}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-soft p-5 space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Ringkasan Skor</h2>
            <p className="text-sm text-slate-600">Skor otomatis mengikuti pilihan Anda.</p>
          </div>
          <div className="text-sm text-slate-700">
            <span className="font-semibold">Total:</span> {computed.totalSkor}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600">
                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.08em]">Pertanyaan</th>
                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.08em]">Skor</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q, idx) => (
                <tr key={q.key} className="border-t border-slate-100">
                  <td className="px-4 py-3">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      Pertanyaan {idx + 1}
                    </div>
                    <div className="text-sm text-slate-900">{q.text}</div>
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-900">{computed.answers?.[q.key]?.score ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UjiAksesReportForm;
