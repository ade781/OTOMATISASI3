import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import SmtpModal from './SmtpModal';

const Layout = () => {
  const [showSmtpModal, setShowSmtpModal] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col md:ml-64 ml-0 transition-all duration-300 min-w-0">
        <Navbar
          onOpenSmtp={() => setShowSmtpModal(true)}
          onToggleSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
        />
        <main className="flex-1 px-4 sm:px-8 py-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      <SmtpModal open={showSmtpModal} onClose={() => setShowSmtpModal(false)} />
    </div>
  );
};

export default Layout;
