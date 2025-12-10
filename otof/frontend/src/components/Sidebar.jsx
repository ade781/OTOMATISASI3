import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const baseLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/badan-publik', label: 'Data Badan Publik' },
  { to: '/history', label: 'History Log' },
  { to: '/templates', label: 'Edit Template' },
  { to: '/settings', label: 'Pengaturan' }
];

const adminLinks = [
  { to: '/penugasan', label: 'Penugasan' },
  { to: '/users', label: 'Tambah User' }
];

const Sidebar = () => {
  const { user } = useAuth();
  const links = user?.role === 'admin' ? [...baseLinks.slice(0, 4), ...adminLinks, baseLinks[4]] : baseLinks;
  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-white/90 backdrop-blur border-r border-slate-200 shadow-soft">
      <div className="px-6 py-6">
        <div className="text-xl font-bold text-primary">Otomasi Email</div>
        <p className="text-sm text-slate-500 mt-1">Versi Lite</p>
      </div>
      <nav className="px-3 space-y-1 overflow-y-auto max-h-[calc(100vh-120px)] pb-6">
        {links.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${
                isActive
                  ? 'bg-primary text-white shadow-soft'
                  : 'text-slate-700 hover:bg-slate-100'
              }`
            }
          >
            <span className="text-sm">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
