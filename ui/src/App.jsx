import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import LandingPage from './components/landing/LandingPage';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import StockMovements from './pages/StockMovements';
import ProductDetailPage from './pages/ProductDetailPage';
import ProductFormPage from './pages/ProductFormPage';
import UserManagement from './pages/UserManagement';
import Navbar from './components/Navbar';
import { AuthProvider, AuthContext } from './context/AuthContext.jsx';
import PrivateRoute from './components/routing/PrivateRoute';
import ProcurementLayout from './components/procurement/ProcurementLayout';
import SupplierList from './components/procurement/SupplierList';
import SupplierForm from './components/procurement/SupplierForm';
import PurchaseOrderList from './components/procurement/PurchaseOrderList';
import PurchaseOrderForm from './components/procurement/PurchaseOrderForm';
import PurchaseReceiptForm from './components/procurement/PurchaseReceiptForm';
import PurchaseReceiptList from './components/procurement/PurchaseReceiptList';
import PurchaseOrderDetail from './components/procurement/PurchaseOrderDetail';
import SupplierDetail from './components/procurement/SupplierDetail';
import PurchaseReceiptDetail from './components/procurement/PurchaseReceiptDetail';
import DistributionList from './components/distribution/DistributionList';
import DistributionForm from './components/distribution/DistributionForm';
import DistributionDetail from './components/distribution/DistributionDetail';
import DistributionDashboard from './components/distribution/DistributionDashboard';
import './App.css';

// Premium page transition wrapper component
const PageWrapper = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.28, ease: [0.25, 1, 0.5, 1] }}
      className="w-full flex-grow flex flex-col"
    >
      {children}
    </motion.div>
  );
};

// App content component that uses AuthContext
function AppContent() {
  const { isAuthenticated } = useContext(AuthContext);
  const location = useLocation();
  
  return (
    <div className="app">
      {isAuthenticated && <Navbar />}
      <div className="container">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <PageWrapper><LandingPage /></PageWrapper>} />
            <Route path="/login" element={<Navigate to="/?auth=login" />} />
            <Route path="/register" element={<Navigate to="/?auth=register" />} />
            
            {/* Protected Routes */}
            <Route path="/" element={<PrivateRoute />}>
              <Route path="dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />
              <Route path="inventory" element={<PageWrapper><Inventory /></PageWrapper>} />
              <Route path="user-management" element={<PageWrapper><UserManagement /></PageWrapper>} />
              <Route path="stock-movements" element={<PageWrapper><StockMovements /></PageWrapper>} />
              
              {/* Order matters for these routes - most specific first */}
              <Route path="products/new" element={<PageWrapper><ProductFormPage /></PageWrapper>} />
              <Route path="products/edit/:id" element={<PageWrapper><ProductFormPage /></PageWrapper>} />
              <Route path="products/:id/edit" element={<PageWrapper><ProductFormPage /></PageWrapper>} />
              <Route path="products/:id" element={<PageWrapper><ProductDetailPage /></PageWrapper>} />

              <Route path="procurement" element={<PageWrapper><ProcurementLayout /></PageWrapper>}>
                <Route path="suppliers" element={<PageWrapper><SupplierList /></PageWrapper>} />
                <Route path="suppliers/new" element={<PageWrapper><SupplierForm /></PageWrapper>} />
                <Route path="suppliers/:id" element={<PageWrapper><SupplierDetail /></PageWrapper>} />
                <Route path="suppliers/:id/edit" element={<PageWrapper><SupplierForm /></PageWrapper>} />
                
                <Route path="purchase-orders" element={<PageWrapper><PurchaseOrderList /></PageWrapper>} />
                <Route path="purchase-orders/new" element={<PageWrapper><PurchaseOrderForm /></PageWrapper>} />
                <Route path="purchase-orders/:id" element={<PageWrapper><PurchaseOrderDetail /></PageWrapper>} />
                <Route path="purchase-orders/:id/edit" element={<PageWrapper><PurchaseOrderForm /></PageWrapper>} />
                
                <Route path="purchase-receipts" element={<PageWrapper><PurchaseReceiptList /></PageWrapper>} />
                <Route path="receive/:id" element={<PageWrapper><PurchaseReceiptForm /></PageWrapper>} />
                <Route path="purchase-receipts/:id" element={<PageWrapper><PurchaseReceiptDetail /></PageWrapper>} />
              </Route>
              <Route path="distributions" element={<PageWrapper><DistributionList /></PageWrapper>} />
              <Route path="distributions/new" element={<PageWrapper><DistributionForm /></PageWrapper>} />
              <Route path="distributions/:id" element={<PageWrapper><DistributionDetail /></PageWrapper>} />
              <Route path="distribution-dashboard" element={<PageWrapper><DistributionDashboard /></PageWrapper>} />
            </Route>
          </Routes>
        </AnimatePresence>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;