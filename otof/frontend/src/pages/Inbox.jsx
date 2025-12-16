import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchConversations, fetchThread, sendMessage } from '../services/messages';
import api from '../services/api';
import { formatDateTime } from '../utils/date';

const Inbox = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [selectedPeerId, setSelectedPeerId] = useState(null);
  const [thread, setThread] = useState(null);
  const [loadingThread, setLoadingThread] = useState(false);
  const [composer, setComposer] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [userOptions, setUserOptions] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(false);

  const formatPeerName = useCallback(
    (peer) => {
      if (!peer) return '';
      if (peer.role === 'admin') return 'Bos';
      return peer.username || '';
    },
    []
  );

  const activePeer = useMemo(() => {
    if (!thread?.peer && selectedPeerId) {
      const fallback = conversations.find((c) => c.peer.id === selectedPeerId);
      return fallback?.peer;
    }
    return thread?.peer || null;
  }, [thread, selectedPeerId, conversations]);

  const loadConversations = useCallback(
    async ({ skipAutoSelect } = {}) => {
      setLoadingConversations(true);
      try {
        const data = await fetchConversations();
        setConversations(data);
        if (!skipAutoSelect && !selectedPeerId && data.length > 0) {
          setSelectedPeerId(data[0].peer.id);
        }
      } catch (err) {
        console.error(err);
        setConversations([]);
      } finally {
        setLoadingConversations(false);
      }
    },
    [selectedPeerId]
  );

  const loadThread = useCallback(
    async (peerId = null) => {
      const target = peerId ?? selectedPeerId;
      if (!target) {
        setThread(null);
        return;
      }

      setLoadingThread(true);
      setError('');
      try {
        const data = await fetchThread(target);
        setThread(data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Gagal memuat percakapan');
      } finally {
        setLoadingThread(false);
      }
    },
    [selectedPeerId]
  );

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (selectedPeerId) {
      loadThread(selectedPeerId);
    } else {
      setThread(null);
    }
  }, [selectedPeerId, loadThread]);

  useEffect(() => {
    setComposer('');
  }, [selectedPeerId]);

  useEffect(() => {
    const interval = setInterval(() => {
      loadConversations({ skipAutoSelect: true });
      if (selectedPeerId) {
        loadThread(selectedPeerId);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [loadConversations, loadThread, selectedPeerId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!selectedPeerId || !composer.trim()) return;
    setSending(true);
    setError('');
    try {
      await sendMessage(selectedPeerId, composer.trim());
      setComposer('');
      await loadThread(selectedPeerId);
      await loadConversations({ skipAutoSelect: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengirim pesan');
    } finally {
      setSending(false);
    }
  };

  const initiateNewChat = async () => {
    setShowNewChat(true);
    setOptionsLoading(true);
    setError('');
    try {
      const res = await api.get('/users');
      const nonAdmins = (res.data || []).filter((u) => u.role !== 'admin');
      setUserOptions(nonAdmins);
    } catch (err) {
      console.error(err);
      setUserOptions([]);
      setError('Gagal memuat daftar user');
    } finally {
      setOptionsLoading(false);
    }
  };

  const handlePickUser = (targetUser) => {
    setShowNewChat(false);
    setSelectedPeerId(targetUser.id);
    setConversations((prev) => {
      if (prev.some((c) => c.peer.id === targetUser.id)) {
        return prev;
      }
      return [
        {
          peer: { id: targetUser.id, username: targetUser.username, role: targetUser.role },
          lastMessage: null,
          unreadCount: 0
        },
        ...prev
      ];
    });
    loadThread(targetUser.id);
  };

  const renderConversation = (item) => {
    const isActive = selectedPeerId === item.peer.id;
    return (
      <button
        key={item.peer.id}
        onClick={() => setSelectedPeerId(item.peer.id)}
        className={`w-full text-left px-4 py-3 rounded-2xl border transition flex flex-col gap-1 ${
          isActive ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-slate-50'
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold text-slate-800 text-sm">{formatPeerName(item.peer)}</span>
          {item.unreadCount > 0 && (
            <span className="text-xs font-semibold bg-rose-500 text-white px-2 py-0.5 rounded-full">
              {item.unreadCount}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 line-clamp-2">
          {item.lastMessage?.content || 'Belum ada pesan'}
        </p>
        {item.lastMessage?.createdAt && (
          <span className="text-[11px] text-slate-400">{formatDateTime(item.lastMessage.createdAt)}</span>
        )}
      </button>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Inbox</h1>
        <p className="text-sm text-slate-500">
          Komunikasi aman antara admin dan user. Sesi otomatis berakhir setelah 300 detik tanpa aktivasi ulang.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-soft p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Percakapan</p>
              <h2 className="text-lg font-semibold text-slate-900">Daftar Kontak</h2>
            </div>
            {user?.role === 'admin' && (
              <button
                onClick={initiateNewChat}
                className="text-xs font-semibold text-white bg-slate-900 px-3 py-2 rounded-xl hover:bg-slate-800 transition"
              >
                Pesan Baru
              </button>
            )}
          </div>
          <div className="max-h-[70vh] overflow-y-auto space-y-2">
            {loadingConversations ? (
              <div className="text-sm text-slate-500">Memuat percakapan...</div>
            ) : conversations.length === 0 ? (
              <div className="text-sm text-slate-500">
                {user?.role === 'admin'
                  ? 'Belum ada pesan. Mulai percakapan baru dengan user.'
                  : 'Belum ada pesan dari admin.'}
              </div>
            ) : (
              conversations.map((item) => renderConversation(item))
            )}
          </div>
        </div>
        <div className="bg-white rounded-3xl border border-slate-200 shadow-soft p-6 lg:col-span-3 flex flex-col min-h-[50vh]">
          {error && <div className="text-sm text-rose-500 mb-2">{error}</div>}
          {activePeer ? (
            <>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Percakapan dengan</p>
                  <h3 className="text-xl font-semibold text-slate-900">{formatPeerName(activePeer)}</h3>
                  <p className="text-xs text-slate-400 capitalize">{activePeer.role}</p>
                </div>
                <div className="text-xs text-slate-500 text-right">
                  Status: <span className="font-semibold">{loadingThread ? 'Memuat...' : 'Aktif'}</span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {loadingThread ? (
                  <div className="text-sm text-slate-500">Memuat percakapan...</div>
                ) : thread?.messages?.length ? (
                  thread.messages.map((msg) => {
                    const isMine = msg.senderId === user?.id;
                    return (
                      <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-2xl px-4 py-3 rounded-2xl shadow-soft ${
                            isMine ? 'bg-primary text-white rounded-br-sm' : 'bg-slate-100 text-slate-900 rounded-bl-sm'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                          <div
                            className={`text-[10px] mt-2 flex items-center gap-2 ${
                              isMine ? 'text-white/70' : 'text-slate-500'
                            }`}
                          >
                            <span>{formatDateTime(msg.createdAt)}</span>
                            {isMine && (
                              <span>{msg.readAt ? 'Terbaca' : 'Terkirim'}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-sm text-slate-500">
                    {user?.role === 'admin'
                      ? 'Belum ada pesan. Tulis pesan pertama untuk user ini.'
                      : 'Belum ada pesan dari admin. Tunggu arahan atau kabari admin jika sudah tersedia.'}
                  </div>
                )}
              </div>
              <form onSubmit={handleSend} className="mt-4 flex flex-col gap-3">
                <textarea
                  value={composer}
                  onChange={(e) => setComposer(e.target.value)}
                  placeholder={
                    user?.role === 'admin'
                      ? `Tulis pesan untuk ${formatPeerName(activePeer)}`
                      : 'Balas pesan admin di sini'
                  }
                  className="w-full border border-slate-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary text-sm min-h-[100px]"
                  disabled={sending}
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-slate-500">
                    Status baca diperbarui otomatis saat penerima membuka percakapan.
                  </p>
                  <button
                    type="submit"
                    disabled={!composer.trim() || sending}
                    className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-800 disabled:opacity-50"
                  >
                    {sending ? 'Mengirim...' : 'Kirim'}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500">
              <p className="text-sm">Pilih percakapan untuk mulai membaca pesan.</p>
            </div>
          )}
        </div>
      </div>

      {showNewChat && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-xl space-y-4 border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold text-slate-900">Mulai Percakapan Baru</h4>
                <p className="text-sm text-slate-500">Pilih user untuk mengirim pesan pertama.</p>
              </div>
              <button
                onClick={() => setShowNewChat(false)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold"
                type="button"
              >
                X
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto space-y-2">
              {optionsLoading ? (
                <div className="text-sm text-slate-500">Memuat daftar user...</div>
              ) : userOptions.length === 0 ? (
                <div className="text-sm text-slate-500">Belum ada user tersedia.</div>
              ) : (
                userOptions.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handlePickUser(item)}
                    className="w-full text-left px-4 py-3 rounded-2xl border border-slate-200 hover:border-primary hover:bg-primary/5 transition text-sm"
                  >
                    <div className="font-semibold text-slate-900">{item.username}</div>
                    <div className="text-xs text-slate-500">ID: {item.id}</div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inbox;
