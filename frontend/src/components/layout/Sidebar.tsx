import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Video, Search, Route, ShieldAlert, Archive, Eye, Camera, BarChart3, Bot, LogOut, PanelLeftClose, PanelLeftOpen, X, ShieldCheck } from 'lucide-react';
import { Logo } from '../ui/Logo';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { DEMO_MODE } from '../../utils/demo';
const sections = [
  { title: 'OPERATIONS', items: [
    { path: '/', label: 'Overview', icon: LayoutDashboard },
    { path: '/live', label: 'Live monitor', icon: Video },
    { path: '/investigation', label: 'Investigation', icon: Search },
    { path: '/journey', label: 'Vehicle journey', icon: Route },
  ] },
  { title: 'SECURITY', items: [
    { path: '/alerts', label: 'Alert review', icon: ShieldAlert },
    { path: '/watchlist', label: 'Watchlist', icon: Eye },
    { path: '/evidence', label: 'Evidence vault', icon: Archive },
    { path: '/cameras', label: 'Camera registry', icon: Camera },
  ] },
  { title: 'INSIGHTS', items: [
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/research-agent', label: 'Research assistant', icon: Bot },
  ] },
];
export const Sidebar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar, mobileMenuOpen, setMobileMenuOpen } = useUiStore();
  const navigate = useNavigate();
  return <aside id="primary-navigation" aria-label="Primary navigation" className={`app-sidebar ${sidebarCollapsed ? 'is-collapsed' : ''} ${mobileMenuOpen ? 'is-open' : ''}`}>
    <div className="sidebar-brand"><NavLink to="/" aria-label="Sentrax overview"><Logo className="h-7" collapsed={sidebarCollapsed && !mobileMenuOpen} /></NavLink>
      <button className="desktop-collapse icon-button" onClick={toggleSidebar} aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>{sidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}</button>
      <button className="mobile-close icon-button" onClick={() => setMobileMenuOpen(false)} aria-label="Close navigation"><X size={20} /></button>
    </div>
    <nav className="sidebar-navigation">{sections.map(section => <div key={section.title} className="nav-section">
      <p className="nav-section-label">{section.title}</p>
      {section.items.filter(item => item.path !== '/research-agent' || user?.role === 'admin').map(({path, label, icon: Icon}) => (
        <NavLink key={path} to={path} end={path === '/'} title={label} className={({isActive}) => `nav-item ${isActive ? 'is-active' : ''}`}>
          <Icon size={19} /><span className="nav-label">{label}</span>
        </NavLink>
      ))}
    </div>)}</nav>
    <div className="sidebar-footer"><div className="sidebar-mode"><span className="mode-square" /><span className="nav-label">{DEMO_MODE ? 'Presentation environment' : 'Investigation workspace'}</span></div>
      <div className="sidebar-user"><div className="user-avatar">{user?.username?.slice(0,2).toUpperCase() || 'SO'}</div><div className="nav-label"><strong>{user?.username || 'Officer'}</strong><small>{DEMO_MODE ? 'Sample session' : user?.role}</small></div>
        <button className="icon-button" aria-label="Sign out" onClick={() => { logout(); navigate('/login'); }}><LogOut size={18}/></button>
      </div>
    </div>
  </aside>;
};
