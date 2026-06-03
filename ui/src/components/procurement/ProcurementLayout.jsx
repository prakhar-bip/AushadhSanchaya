import React, { useContext } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';
import { motion, AnimatePresence } from 'motion/react';

function ProcurementLayout() {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';
  const location = useLocation();
  
  return (
    <div className="min-h-screen bg-[#F5F7F4] pt-8 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-[#16221D] mb-8">Procurement Management</h1>
        
        <div className="flex mb-8 border-b border-[#16221D]/10 overflow-x-auto hide-scrollbar">
          {isAdmin && (
            <NavLink 
              to="/procurement/suppliers" 
              className={({ isActive }) => 
                `mr-8 pb-3 relative whitespace-nowrap transition-colors ${isActive 
                  ? 'text-[#4D6E60] font-semibold' 
                  : 'text-[#2D3E37]/60 hover:text-[#4D6E60]'}`
              }
            >
              {({ isActive }) => (
                <>
                  Suppliers
                  {isActive && (
                    <motion.div
                      layoutId="procurementTab"
                      className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-[#4D6E60]"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          )}
          <NavLink 
            to="/procurement/purchase-orders" 
            className={({ isActive }) => 
              `mr-8 pb-3 relative whitespace-nowrap transition-colors ${isActive 
                ? 'text-[#4D6E60] font-semibold' 
                : 'text-[#2D3E37]/60 hover:text-[#4D6E60]'}`
            }
          >
            {({ isActive }) => (
              <>
                Purchase Orders
                {isActive && (
                  <motion.div
                    layoutId="procurementTab"
                    className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-[#4D6E60]"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </>
            )}
          </NavLink>
          <NavLink 
            to="/procurement/purchase-receipts" 
            className={({ isActive }) => 
              `mr-8 pb-3 relative whitespace-nowrap transition-colors ${isActive 
                ? 'text-[#4D6E60] font-semibold' 
                : 'text-[#2D3E37]/60 hover:text-[#4D6E60]'}`
            }
          >
            {({ isActive }) => (
              <>
                Receipts
                {isActive && (
                  <motion.div
                    layoutId="procurementTab"
                    className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-[#4D6E60]"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </>
            )}
          </NavLink>
        </div>
        
        <div className="relative w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default ProcurementLayout;