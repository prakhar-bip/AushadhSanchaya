import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { PERMISSIONS, canAccess } from '../utils/roles';
import { motion, AnimatePresence } from 'motion/react';
import Dropdown from './Dropdown';
import logoImage from '../assets/logo.png';

const Navbar = () => {
  const { isAuthenticated, setAuth, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      setAuth({
        token: null,
        isAuthenticated: false,
        user: null
      });
      
      navigate('/');
    } catch (error) {
      console.error("Logout failed:", error);
      navigate('/');
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-[#F5F7F4]/80 backdrop-blur-md text-[#16221D] p-4 shadow-sm w-full relative z-50 border-b border-[#16221D]/10 font-sans">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Brand Area */}
        <div className="text-xl font-bold tracking-wide">
          <Link to="/" className="flex items-center space-x-3 group">
            <img src={logoImage} alt="AushadhSanchaya Logo" className="w-8 h-8 inline-block align-middle transform group-hover:scale-105 transition-transform duration-300 rounded-full border border-[#16221D]/10" />
            <span className="font-serif tracking-normal text-[#16221D] hover:text-[#4D6E60] transition-colors duration-300">
              AushadhSanchaya
            </span>
          </Link>
        </div>
        
        {/* Hamburger menu button (mobile only) */}
        <div className="md:hidden">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-[#16221D] focus:outline-none hover:text-[#4D6E60] transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
        
        {/* Desktop menu */}
        <div className="hidden md:flex items-center space-x-6">
          {isAuthenticated && (
            <>
              <Link to="/dashboard" className="relative px-3 py-2 text-sm font-medium transition-colors duration-300">
                <span className={isActive('/dashboard') ? 'text-[#4D6E60] font-semibold' : 'text-[#2D3E37] hover:text-[#4D6E60]'}>
                  Dashboard
                </span>
                {isActive('/dashboard') && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4D6E60]" />
                )}
              </Link>
              
              {/* Inventory - Admin, Inventory Manager, Staff */}
              {canAccess(user?.role, 'CAN_VIEW_INVENTORY') && (
                <Link to="/inventory" className="relative px-3 py-2 text-sm font-medium transition-colors duration-300">
                  <span className={isActive('/inventory') ? 'text-[#4D6E60] font-semibold' : 'text-[#2D3E37] hover:text-[#4D6E60]'}>
                    Inventory
                  </span>
                  {isActive('/inventory') && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4D6E60]" />
                  )}
                </Link>
              )}
              
              {/* Procurement - Admin, Inventory Manager, Procurement Staff, Staff */}
              {canAccess(user?.role, 'CAN_VIEW_PROCUREMENT') && (
                <Link to="/procurement/purchase-orders" className="relative px-3 py-2 text-sm font-medium transition-colors duration-300">
                  <span className={isActive('/procurement/purchase-orders') ? 'text-[#4D6E60] font-semibold' : 'text-[#2D3E37] hover:text-[#4D6E60]'}>
                    Procurement
                  </span>
                  {isActive('/procurement/purchase-orders') && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4D6E60]" />
                  )}
                </Link>
              )}
              
              {/* Distribution - Admin, Inventory Manager, Distribution Staff, Staff */}
              {canAccess(user?.role, 'CAN_VIEW_DISTRIBUTION') && (
                <Link to="/distributions" className="relative px-3 py-2 text-sm font-medium transition-colors duration-300">
                  <span className={isActive('/distributions') ? 'text-[#4D6E60] font-semibold' : 'text-[#2D3E37] hover:text-[#4D6E60]'}>
                    Distribution
                  </span>
                  {isActive('/distributions') && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4D6E60]" />
                  )}
                </Link>
              )}
              
              {/* Profile Dropdown */}
              <Dropdown
                align="right"
                className="w-auto"
                triggerClassName="flex items-center space-x-2 px-3 py-1.5 rounded-lg hover:bg-[#16221D]/5 border border-transparent hover:border-[#16221D]/10 transition-all duration-300 focus:outline-none"
                trigger={
                  <>
                    <div className="h-8 w-8 rounded-full bg-[#4D6E60] flex items-center justify-center border border-[#16221D]/10 shadow-sm">
                      <span className="text-[#F5F7F4] font-semibold text-sm">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                  </>
                }
                menuClassName="w-64 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-200"
              >
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-[#16221D]">{user?.name}</p>
                  <p className="text-xs text-[#2D3E37]/75 mt-0.5">{user?.email}</p>
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-semibold uppercase tracking-wider bg-[#4D6E60]/10 text-[#4D6E60] border border-[#4D6E60]/20">
                      {user?.role || 'USER'}
                    </span>
                  </div>
                </div>
                
                {user?.role === 'admin' && (
                  <Link
                    to="/user-management"
                    className="flex items-center px-4 py-2 text-sm text-[#16221D] hover:bg-[#F5F7F4] transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2.5 text-[#4D6E60]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    User Management
                  </Link>
                )}
                
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </Dropdown>
            </>
          )}
          {!isAuthenticated && (
            <Link to="/" className="px-4 py-1.5 bg-[#4D6E60] hover:bg-[#678E7D] text-[#F5F7F4] rounded-md shadow-md hover:shadow-lg transition-all duration-300 text-sm font-semibold">
              Login
            </Link>
          )}
        </div>
      </div>

      {/* Mobile menu dropdown */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden mt-3 px-2 pt-2 pb-4 bg-white rounded-lg shadow-lg border border-[#16221D]/10 overflow-hidden"
          >
            {isAuthenticated ? (
              <div className="flex flex-col space-y-2">
                {/* User Info */}
                <div className="px-3 py-3 bg-[#F5F7F4] rounded-md mb-2 border border-[#16221D]/5">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-[#4D6E60] flex items-center justify-center border border-[#16221D]/10 shadow-md">
                      <span className="text-[#F5F7F4] font-semibold">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[#16221D]">{user?.name}</p>
                      <p className="text-xs text-[#2D3E37]/75 mt-0.5">{user?.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-2xs font-semibold uppercase tracking-wider bg-[#4D6E60]/10 text-[#4D6E60] border border-[#4D6E60]/20">
                        {user?.role || 'USER'}
                      </span>
                    </div>
                  </div>
                </div>

                <Link 
                  to="/dashboard" 
                  className={`block px-3 py-2 rounded text-sm ${isActive('/dashboard') ? 'bg-[#4D6E60]/10 text-[#4D6E60] font-semibold' : 'text-[#2D3E37] hover:bg-[#16221D]/5'}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                
                {/* Inventory - Admin, Inventory Manager, Staff */}
                {canAccess(user?.role, 'CAN_VIEW_INVENTORY') && (
                  <Link 
                    to="/inventory" 
                    className={`block px-3 py-2 rounded text-sm ${isActive('/inventory') ? 'bg-[#4D6E60]/10 text-[#4D6E60] font-semibold' : 'text-[#2D3E37] hover:bg-[#16221D]/5'}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Inventory
                  </Link>
                )}
                
                {/* Procurement - Admin, Inventory Manager, Procurement Staff, Staff */}
                {canAccess(user?.role, 'CAN_VIEW_PROCUREMENT') && (
                  <Link 
                    to="/procurement/purchase-orders" 
                    className={`block px-3 py-2 rounded text-sm ${isActive('/procurement/purchase-orders') ? 'bg-[#4D6E60]/10 text-[#4D6E60] font-semibold' : 'text-[#2D3E37] hover:bg-[#16221D]/5'}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Procurement
                  </Link>
                )}
                
                {/* Distribution - Admin, Inventory Manager, Distribution Staff, Staff */}
                {canAccess(user?.role, 'CAN_VIEW_DISTRIBUTION') && (
                  <Link 
                    to="/distributions" 
                    className={`block px-3 py-2 rounded text-sm ${isActive('/distributions') ? 'bg-[#4D6E60]/10 text-[#4D6E60] font-semibold' : 'text-[#2D3E37] hover:bg-[#16221D]/5'}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Distribution
                  </Link>
                )}
                
                {user?.role === 'admin' && (
                  <Link 
                    to="/user-management" 
                    className="block px-3 py-2 rounded text-sm text-[#2D3E37] hover:bg-[#16221D]/5 border-t border-[#16221D]/5 mt-1 pt-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2.5 text-[#4D6E60]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      User Management
                    </div>
                  </Link>
                )}
                
                <button 
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleLogout();
                  }}
                  className="text-left px-3 py-2 rounded text-sm text-red-500 hover:bg-red-50 border-t border-[#16221D]/5 mt-1 pt-2 w-full"
                >
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </div>
                </button>
              </div>
            ) : (
              <Link 
                to="/" 
                className="block px-3 py-2 rounded text-sm text-[#2D3E37] hover:bg-[#16221D]/5"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
