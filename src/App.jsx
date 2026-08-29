import { BrowserRouter, Routes, Route, useLocation, Link } from 'react-router-dom';
import { Home, UserPlus, Share2, Key } from 'lucide-react';
import { useEffect } from 'react';
import Landing from './pages/Landing';
import Register from './pages/Register';
import Social from './pages/Social';
import Admin from './pages/Admin';
import { GOOGLE_SHEET_SCRIPT_URL, STORAGE_KEY, getRegistrations } from './data/eventData';

const NAV = [
  { to: '/',         label: 'Home',     icon: Home },
  { to: '/register', label: 'Register', icon: UserPlus },
  { to: '/connect',  label: 'Connect',  icon: Share2 },
];

function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav className="bottom-nav safe-bottom">
      {NAV.map(({ to, label, icon: Icon }) => {
        const active = pathname === to;
        return (
          <Link key={to} to={to} className={`bottom-nav-item${active ? ' active' : ''}`}>
            <Icon size={20} className="nav-icon" />
            <span className="nav-label">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function AppLayout() {
  const { pathname } = useLocation();
  const isAdmin = pathname === '/admin';

  useEffect(() => {
    if (isAdmin) {
      document.body.classList.add('admin-page');
    } else {
      document.body.classList.remove('admin-page');
    }
    return () => document.body.classList.remove('admin-page');
  }, [isAdmin]);

  // Silent auto-sync for offline/unsynced registrations
  useEffect(() => {
    const syncOffline = async () => {
      if (!GOOGLE_SHEET_SCRIPT_URL) return;
      try {
        const regs = getRegistrations();
        if (Array.isArray(regs) && regs.length > 0) {
          let updated = false;
          const list = [...regs];
          for (let i = 0; i < list.length; i++) {
            if (!list[i].synced) {
              try {
                await fetch(GOOGLE_SHEET_SCRIPT_URL, {
                  method: 'POST',
                  mode: 'no-cors',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(list[i]),
                });
                list[i].synced = true;
                updated = true;
              } catch (_) {}
            }
          }
          if (updated) localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        }
      } catch (e) {
        console.error('Silent sync error:', e);
      }
    };
    const t = setTimeout(syncOffline, 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <Routes>
        <Route path="/"         element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/connect"  element={<Social />} />
        <Route path="/admin"    element={<Admin />} />
        <Route path="*"         element={<Landing />} />
      </Routes>
      {!isAdmin && <BottomNav />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
