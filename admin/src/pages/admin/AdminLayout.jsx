import { useEffect, useState } from 'react';
import { Outlet, Navigate, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, UploadCloud, Settings, LogOut, Heart, ChevronLeft, Menu, SlidersHorizontal, CreditCard, Download } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import * as adminApi from '../../api/adminApi';

const AdminLayout = () => {
  const { isAuthenticated, user, signOut } = useAuthStore();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const verifyAdmin = async () => {
      if (isAuthenticated && user?.email) {
        const adminStatus = await adminApi.checkIsAdmin(user.email);
        setIsAdmin(adminStatus);
      } else {
        setIsAdmin(false);
      }
    };
    verifyAdmin();
  }, [isAuthenticated, user]);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center text-white gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center animate-pulse">
          <Heart size={24} className="text-white" fill="white" />
        </div>
        <p className="text-neutral-400 text-sm">Verifying access…</p>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  const navGroups = [
    {
      label: 'Overview',
      items: [{ to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' }],
    },
    {
      label: 'Management',
      items: [
        { to: '/users', icon: Users, label: 'Manage Users' },
        { to: '/bulk-upload', icon: UploadCloud, label: 'Bulk Upload' },
        { to: '/payments', icon: CreditCard, label: 'Payments' },
      ],
    },
    {
      label: 'Configuration',
      items: [
        { to: '/settings', icon: Settings, label: 'Premium Plans' },
        { to: '/distribution', icon: SlidersHorizontal, label: 'Distribution' },
        { to: '/reports', icon: Download, label: 'Reports' },
      ],
    },
  ];

  const initials = (user?.email || 'A').charAt(0).toUpperCase();

  const SidebarBody = () => (
    <>
      {/* Brand */}
      <div className={`flex items-center gap-3 px-5 h-[68px] border-b border-white/5 ${collapsed ? 'justify-center px-0' : ''}`}>
        <div className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-900/40">
          <Heart size={18} className="text-white" fill="white" />
        </div>
        {!collapsed && (
          <div className="leading-tight">
            <p className="font-bold text-white tracking-tight">Wedring</p>
            <p className="text-[11px] text-neutral-500 font-medium">Admin Portal</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-6">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-600">
                {group.label}
              </p>
            )}
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  title={collapsed ? item.label : undefined}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      collapsed ? 'justify-center' : ''
                    } ${
                      isActive
                        ? 'bg-gradient-to-r from-primary-500/15 to-transparent text-white'
                        : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-primary-500" />
                      )}
                      <item.icon
                        size={19}
                        className={isActive ? 'text-primary-400' : 'text-neutral-500 group-hover:text-neutral-300'}
                      />
                      {!collapsed && <span>{item.label}</span>}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User + logout */}
      <div className="p-3 border-t border-white/5">
        <div className={`flex items-center gap-3 px-2 py-2 mb-1 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-9 h-9 shrink-0 rounded-full bg-gradient-to-br from-neutral-600 to-neutral-700 flex items-center justify-center text-white text-sm font-bold ring-2 ring-white/10">
            {initials}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-neutral-200 truncate">{user?.email}</p>
              <p className="text-[10px] text-primary-400 font-medium">Super Admin</p>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          title={collapsed ? 'Sign Out' : undefined}
          className={`flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-neutral-400 hover:bg-error-500/10 hover:text-error-400 transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut size={18} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-neutral-900 transition-all duration-300 relative ${
          collapsed ? 'w-[76px]' : 'w-64'
        }`}
      >
        <SidebarBody />
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-white border border-neutral-200 shadow-md flex items-center justify-center text-neutral-500 hover:text-primary-600 hover:border-primary-200 transition-colors z-10"
        >
          <ChevronLeft size={14} className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-neutral-950/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 bg-neutral-900 flex flex-col animate-rise">
            <SidebarBody />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center gap-3 h-14 px-4 bg-white border-b border-neutral-200">
          <button onClick={() => setMobileOpen(true)} className="p-2 -ml-2 text-neutral-600">
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
              <Heart size={14} className="text-white" fill="white" />
            </div>
            <span className="font-bold text-xl text-neutral-900">Wedring Admin</span>
          </div>
        </div>

        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-8 animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
