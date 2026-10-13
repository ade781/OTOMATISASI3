import { useAuth } from '../context/AuthContext';
import { useSmtp } from '../context/SmtpContext';

const Navbar = ({ onOpenSmtp, onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { hasConfig, loading } = useSmtp();

  const indicatorColor = hasConfig ? 'bg-emerald-500' : 'bg-rose-500';
  const indicatorLabel = hasConfig ? 'SMTP Siap' : 'SMTP Belum Siap';

  return (
    <header className="flex items-center justify-between px-4 sm:px-8 py-4 bg-white/80 backdrop-blur border-b border-slate-200 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="md:hidden p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <img
          src="/icon.png"
          alt="Logo Portal Keterbukaan Informasi"
          className="h-9 w-auto max-w-[160px] object-contain hidden sm:block"
        />
        <div
          onClick={onOpenSmtp}
          className="flex items-center gap-2 cursor-pointer group select-none py-1 px-2 rounded-lg hover:bg-slate-100/60 transition"
          title="Klik untuk mengatur SMTP"
        >
          <span
            className={`w-3 h-3 rounded-full ${indicatorColor} shadow-inner transition`}
            aria-label={indicatorLabel}
          />
          <span className="text-xs sm:text-sm font-semibold text-slate-700 group-hover:text-primary transition">
            {loading ? 'Mengecek...' : indicatorLabel}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden lg:flex flex-col text-right">
          <span className="text-sm font-semibold text-slate-800">Portal Keterbukaan Informasi</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col text-right">
            <span className="text-xs sm:text-sm font-semibold text-slate-800 truncate max-w-[120px] sm:max-w-none">{user?.username}</span>
            <span className="text-[10px] sm:text-xs text-slate-500 capitalize">{user?.role}</span>
          </div>
          <button
            onClick={logout}
            className="bg-slate-900 text-white px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold hover:bg-slate-800 transition"
          >
            Keluar
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
