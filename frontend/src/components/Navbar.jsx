import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  LayoutDashboard, 
  Store, 
  Search, 
  User, 
  LogOut, 
  Box, 
  TrendingUp, 
  ShieldCheck, 
  Layers,
  Monitor,
  Users,
  Lock,
  Truck
} from 'lucide-react';

export default function Navbar({ onOpenCart, onOpenAuthModal, onOpenSettingsModal, onOpenDailyCloseModal, onOpenTracking, activeAdminTab, setActiveAdminTab, searchTerm, setSearchTerm }) {
  const { user, viewMode, toggleViewMode, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  return (
    <header style={{
      background: 'rgba(15, 23, 42, 0.95)',
      backdropFilter: 'blur(12px)',
      color: '#ffffff',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px'
      }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }} onClick={() => toggleViewMode('storefront')}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(37, 99, 235, 0.4)'
          }}>
            <Box size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
                Stock<span style={{ color: '#38bdf8' }}>Pilot</span>
              </span>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                background: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                padding: '2px 8px',
                borderRadius: '99px',
                border: '1px solid rgba(56, 189, 248, 0.3)'
              }}>
                v2.0 Intelligent Platform
              </span>
            </div>
            <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: 0 }}>
              {viewMode === 'admin' ? 'Business Operations Command Center' : 'Customer Online Storefront'}
            </p>
          </div>
        </div>

                {viewMode === 'storefront' && (
          <div style={{ flex: 1, maxWidth: '440px', position: 'relative' }}>
            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search products by name, SKU, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px 10px 42px',
                borderRadius: '99px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                fontSize: '0.88rem',
                outline: 'none'
              }}
            />
          </div>
        )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          
                    {viewMode === 'storefront' && (
            <button
              onClick={() => {
                if (onOpenTracking) onOpenTracking();
                else navigate('/track');
              }}
              title="Track Package Status"
              style={{
                background: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                padding: '8px 12px',
                borderRadius: '99px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Truck size={15} /> Track Package
            </button>
          )}

                    {viewMode === 'admin' && user && (
            <button
              onClick={onOpenDailyCloseModal}
              title="Daily Sales Register Closing & Z-Report"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '8px 14px',
                borderRadius: '99px',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 0 12px rgba(16, 185, 129, 0.3)'
              }}
            >
              <Lock size={14} /> End of Day Close (Z-Report)
            </button>
          )}

                    <div style={{
            background: 'rgba(255, 255, 255, 0.08)',
            padding: '4px',
            borderRadius: '99px',
            display: 'flex',
            alignItems: 'center',
            border: '1px solid rgba(255, 255, 255, 0.12)'
          }}>
            <button 
              onClick={() => toggleViewMode('storefront')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '99px',
                border: 'none',
                background: viewMode === 'storefront' ? '#2563eb' : 'transparent',
                color: '#ffffff',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Store size={15} />
              Storefront
            </button>
            <button 
              onClick={() => {
                toggleViewMode('admin');
                if (!user) onOpenAuthModal();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '99px',
                border: 'none',
                background: viewMode === 'admin' ? '#2563eb' : 'transparent',
                color: '#ffffff',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <LayoutDashboard size={15} />
              Business Portal
            </button>
          </div>

                    {viewMode === 'storefront' && (
            <button 
              onClick={onOpenCart}
              style={{
                position: 'relative',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
            >
              <ShoppingBag size={20} />
              {itemCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: '#ef4444',
                  color: '#ffffff',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  width: '20px',
                  height: '20px',
                  borderRadius: '99px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #0f172a'
                }}>
                  {itemCount}
                </span>
              )}
            </button>
          )}

                    {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button 
                onClick={onOpenSettingsModal}
                title="Account & Security Settings"
                style={{
                  background: 'rgba(56, 189, 248, 0.15)',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <User size={16} />
                Settings
              </button>
              <button 
                onClick={logout}
                title="Logout"
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: '#f87171',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          ) : (
            <button 
              onClick={onOpenAuthModal}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '8px 14px',
                borderRadius: '10px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <User size={16} />
              Staff Login
            </button>
          )}

        </div>
      </div>

            {viewMode === 'admin' && (
        <div style={{ background: '#1e293b', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', display: 'flex', gap: '4px', overflowX: 'auto' }}>
            {[
              { id: 'dashboard', label: 'Dashboard & Business Pulse', icon: LayoutDashboard },
              { id: 'pos', label: 'In-Store POS Terminal', icon: Monitor },
              { id: 'inventory', label: 'Inventory & Stock History', icon: Box },
              { id: 'orders', label: 'Sales & Orders Pipeline', icon: ShoppingBag },
              { id: 'deliveries', label: 'Deliveries & Logistics', icon: Truck },
              { id: 'purchases', label: 'Supplier Purchases', icon: Layers },
              { id: 'reports', label: 'Profit Intelligence & Audit Logs', icon: TrendingUp },
              { id: 'staff', label: 'Staff Accounts & Switch User', icon: Users },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeAdminTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveAdminTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 18px',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: isActive ? '3px solid #38bdf8' : '3px solid transparent',
                    color: isActive ? '#38bdf8' : '#94a3b8',
                    fontSize: '0.85rem',
                    fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
