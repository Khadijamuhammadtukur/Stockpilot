import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';

import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import CartDrawer from './components/CartDrawer';
import ProductDetailModal from './components/ProductDetailModal';
import ReceiptModal from './components/ReceiptModal';
import SettingsModal from './components/SettingsModal';
import DailyCloseModal from './components/DailyCloseModal';

import StorefrontHome from './pages/StorefrontHome';
import AdminDashboard from './pages/AdminDashboard';
import AdminInventory from './pages/AdminInventory';
import AdminOrders from './pages/AdminOrders';
import AdminPurchases from './pages/AdminPurchases';
import AdminReports from './pages/AdminReports';
import AdminPos from './pages/AdminPos';
import AdminStaff from './pages/AdminStaff';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminDeliveries from './pages/AdminDeliveries';
import CustomerTracking from './pages/CustomerTracking';
import DeliveryStaffTerminal from './pages/DeliveryStaffTerminal';

function AppContent() {
  const { viewMode, user } = useAuth();
  const { toast } = useCart();

  const [activeAdminTab, setActiveAdminTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDailyCloseOpen, setIsDailyCloseOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [completedOrder, setCompletedOrder] = useState(null);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      
      {/* Toast Overlay */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: toast.type === 'error' ? '#ef4444' : (toast.type === 'warning' ? '#f59e0b' : '#0f172a'),
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '10px',
          fontSize: '0.88rem',
          fontWeight: 700,
          boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
          zIndex: 300,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {toast.message}
        </div>
      )}

      {/* Main Navbar */}
      <Navbar 
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuthModal={() => setIsAuthOpen(true)}
        onOpenSettingsModal={() => setIsSettingsOpen(true)}
        onOpenDailyCloseModal={() => setIsDailyCloseOpen(true)}
        activeAdminTab={activeAdminTab}
        setActiveAdminTab={setActiveAdminTab}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/track" element={<CustomerTracking />} />
          <Route path="/track/:trackingNumber" element={<CustomerTracking />} />
          <Route path="/courier" element={<DeliveryStaffTerminal />} />
          <Route path="*" element={
            viewMode === 'storefront' ? (
              <StorefrontHome 
                searchTerm={searchTerm}
                onSelectProduct={(product) => setSelectedProduct(product)}
                onOpenCart={() => setIsCartOpen(true)}
              />
            ) : (
              /* Admin Portal Interface */
              !user ? (
                <div style={{ textAlign: 'center', padding: '100px 20px' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                    Authentication Required
                  </h2>
                  <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '20px' }}>
                    Please sign in with staff credentials to access the Business Portal.
                  </p>
                  <button className="btn btn-primary" onClick={() => setIsAuthOpen(true)}>
                    Open Staff Login
                  </button>
                </div>
              ) : (
                <>
                  {activeAdminTab === 'dashboard' && <AdminDashboard onNavigateTab={setActiveAdminTab} />}
                  {activeAdminTab === 'pos' && <AdminPos />}
                  {activeAdminTab === 'inventory' && <AdminInventory />}
                  {activeAdminTab === 'orders' && <AdminOrders />}
                  {activeAdminTab === 'deliveries' && <AdminDeliveries />}
                  {activeAdminTab === 'purchases' && <AdminPurchases />}
                  {activeAdminTab === 'reports' && <AdminReports />}
                  {activeAdminTab === 'staff' && <AdminStaff />}
                </>
              )
            )
          } />
        </Routes>
      </main>

      {/* Global Modals */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <DailyCloseModal isOpen={isDailyCloseOpen} onClose={() => setIsDailyCloseOpen(false)} />
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        onOrderSuccess={(order) => setCompletedOrder(order)} 
      />
      <ProductDetailModal 
        product={selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
      />
      <ReceiptModal 
        order={completedOrder} 
        onClose={() => setCompletedOrder(null)} 
      />

    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
