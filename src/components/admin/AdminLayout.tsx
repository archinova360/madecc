import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  Users, 
  CreditCard, 
  Receipt, 
  LogOut, 
  Menu, 
  X, 
  ChevronRight,
  Bell,
  Globe,
  ShieldCheck,
  FileCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  key?: string | number;
}

const SidebarItem = ({ to, icon, label, onClick }: SidebarItemProps) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
        isActive 
          ? 'bg-orange-600 text-white shadow-md' 
          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
      }`
    }
  >
    {icon}
    <span className="font-medium">{label}</span>
    <ChevronRight size={14} className="ml-auto opacity-50" />
  </NavLink>
);

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const [forceOffline, setForceOffline] = useState(localStorage.getItem('madecc_force_offline') === 'true');
  const [isOnline, setIsOnline] = useState(navigator.onLine && !forceOffline);

  useEffect(() => {
    const handleConnectivityChange = () => {
      const targetForce = localStorage.getItem('madecc_force_offline') === 'true';
      setForceOffline(targetForce);
      setIsOnline(navigator.onLine && !targetForce);
    };

    window.addEventListener('online', handleConnectivityChange);
    window.addEventListener('offline', handleConnectivityChange);
    window.addEventListener('on-site-network-toggle', handleConnectivityChange);

    return () => {
      window.removeEventListener('online', handleConnectivityChange);
      window.removeEventListener('offline', handleConnectivityChange);
      window.removeEventListener('on-site-network-toggle', handleConnectivityChange);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navigationLinks = [
    { to: '/admin/dashboard', icon: <LayoutDashboard size={20} />, label: 'Overview', roles: ['CEO', 'PROJECT_MANAGER', 'FINANCIAL_OFFICER', 'ACCOUNTANT', 'SECRETARY', 'GENERAL_MANAGER', 'PROJECTS_EXECUTION_ENGINEER', 'ARCHITECT'] as const },
    { to: '/admin/projects', icon: <Briefcase size={20} />, label: 'Projects', roles: ['CEO', 'PROJECT_MANAGER', 'CONTENT_EDITOR', 'SECRETARY', 'GENERAL_MANAGER', 'PROJECTS_EXECUTION_ENGINEER', 'ARCHITECT'] as const },
    { to: '/admin/contracts', icon: <FileText size={20} />, label: 'Contracts', roles: ['CEO', 'FINANCIAL_OFFICER', 'ACCOUNTANT', 'SECRETARY', 'GENERAL_MANAGER'] as const },
    { to: '/admin/payments', icon: <CreditCard size={20} />, label: 'Labor Payments', roles: ['CEO', 'FINANCIAL_OFFICER', 'ACCOUNTANT', 'GENERAL_MANAGER'] as const },
    { to: '/admin/employees', icon: <Users size={20} />, label: 'Employees', roles: ['CEO', 'SECRETARY', 'GENERAL_MANAGER'] as const },
    { to: '/admin/invoices', icon: <Receipt size={20} />, label: 'Invoices', roles: ['CEO', 'FINANCIAL_OFFICER', 'ACCOUNTANT', 'GENERAL_MANAGER'] as const },
    { to: '/admin/receipts', icon: <FileCheck size={20} />, label: 'Digital Receipts', roles: ['CEO', 'FINANCIAL_OFFICER', 'ACCOUNTANT', 'SECRETARY', 'GENERAL_MANAGER', 'PROJECTS_EXECUTION_ENGINEER'] as const },
    { to: '/admin/content', icon: <Globe size={20} />, label: 'Web Content', roles: ['CEO', 'CONTENT_EDITOR', 'GENERAL_MANAGER', 'ARCHITECT'] as const },
    { to: '/admin/security', icon: <ShieldCheck size={20} />, label: 'Security Terminal', roles: ['CEO', 'GENERAL_MANAGER'] as const },
  ];

  const filteredLinks = navigationLinks.filter(link => 
    user && link.roles.includes(user.role as any)
  );

  const getRoleLabel = (role?: string) => {
    switch(role) {
      case 'CEO': return 'Chief Executive';
      case 'PROJECT_MANAGER': return 'Project Manager';
      case 'CONTENT_EDITOR': return 'Content Editor';
      case 'FINANCIAL_OFFICER': return 'Financial Officer';
      case 'ACCOUNTANT': return 'Accountant';
      case 'SECRETARY': return 'Secretary';
      case 'GENERAL_MANAGER': return 'General Manager';
      case 'PROJECTS_EXECUTION_ENGINEER': return 'Projects Execution Engineer';
      case 'ARCHITECT': return 'Architect';
      default: return 'Admin';
    }
  };

  const getInitials = (role?: string) => {
    if (!role) return 'A';
    return role.split('_').map(n => n[0]).join('');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-black border-r border-gray-800 p-6 fixed h-full z-20">
        <div className="flex items-center gap-3 mb-10 px-2">
          <img src="/logo.png" alt="MADECC" className="h-10 w-auto" />
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tighter text-white uppercase">MADECC</span>
            <span className="text-[10px] text-orange-600 font-bold tracking-[0.2em] -mt-1">ADMIN SYSTEM</span>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {filteredLinks.map((link) => (
            <SidebarItem key={link.to} to={link.to} icon={link.icon} label={link.label} />
          ))}
        </nav>

        <div className="pt-6 border-t border-gray-800 mt-auto">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-500/10"
          >
            <LogOut size={20} />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 min-h-screen">
        {/* Header */}
        <header className="h-20 bg-gray-900/50 backdrop-blur-md border-b border-gray-800 flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="lg:hidden">
            <img src="/logo.png" alt="MADECC" className="h-8 w-auto" />
          </div>
          
          <div className="hidden lg:flex items-center gap-4 flex-1">
            <h1 className="text-sm font-medium text-gray-400 uppercase tracking-widest mr-4">Construction Management Suite</h1>
            
            {/* On-Site Cache & Connectivity Monitor */}
            <div className="flex items-center gap-3 px-3 py-1.5 bg-gray-950 border border-gray-800 rounded-full text-[10px] uppercase tracking-wider">
              {isOnline ? (
                <div className="flex items-center gap-2 text-green-500 font-black">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span>On-Site Uplink: Active</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-orange-500 font-black">
                  <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                  </div>
                  <span>On-Site Offline Cache Active</span>
                </div>
              )}
              <div className="w-px h-3 bg-gray-800" />
              <button 
                onClick={() => {
                  const newVal = !forceOffline;
                  localStorage.setItem('madecc_force_offline', newVal ? 'true' : 'false');
                  window.dispatchEvent(new Event('on-site-network-toggle'));
                }}
                className={`px-2 py-0.5 rounded text-[9px] font-black cursor-pointer uppercase transition-all ${
                  forceOffline 
                    ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-600/30' 
                    : 'bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white'
                }`}
                title="Toggle unstable network behavior"
              >
                {forceOffline ? 'Force Offline [ACTIVE]' : 'Test Offline'}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end mr-2">
              <span className="text-xs font-black text-white uppercase tracking-wider">{getRoleLabel(user?.role)}</span>
              <span className="text-[9px] text-orange-600 font-bold uppercase tracking-widest">Authorized Access</span>
            </div>
            <button className="p-2 text-gray-400 hover:text-white transition-colors relative">
              < Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-orange-600 rounded-full border-2 border-gray-900"></span>
            </button>
            <div className="flex items-center gap-2 pl-2 border-l border-gray-800">
              <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center font-bold text-white shadow-lg text-sm tracking-tighter">
                {getInitials(user?.role)}
              </div>
              <button 
                onClick={handleLogout}
                title="Sign Out"
                className="p-2 text-gray-400 hover:text-red-500 transition-colors hidden md:block"
              >
                <LogOut size={20} />
              </button>
            </div>
            <button 
              className="lg:hidden p-2 text-gray-400"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 lg:hidden">
          <div className="w-72 bg-gray-900 h-full p-6 animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between mb-10">
              <img src="/logo.png" alt="MADECC" className="h-8 w-auto" />
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-gray-400"
              >
                <X size={24} />
              </button>
            </div>
            <nav className="space-y-2">
              {filteredLinks.map((link) => (
                <SidebarItem 
                  key={link.to} 
                  to={link.to} 
                  icon={link.icon} 
                  label={link.label} 
                  onClick={() => setIsMobileMenuOpen(false)} 
                />
              ))}
            </nav>
            <div className="mt-auto pt-10 border-t border-gray-800 absolute bottom-6 left-6 right-6">
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-500 rounded-lg bg-red-500/10"
              >
                <LogOut size={20} />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
