import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

const ProductList = ({ products, deleteProduct, editProduct, adjustStock }) => {
  const isLowStock = product => product.stockQuantity <= product.reorderLevel;
  
  const isExpiringSoon = product => {
    const expiryDate = new Date(product.expiryDate);
    const today = new Date();
    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);
    return expiryDate <= ninetyDaysFromNow && expiryDate >= today;
  };
  
  const isExpired = product => {
    const expiryDate = new Date(product.expiryDate);
    const today = new Date();
    return expiryDate < today;
  };

  // SVGs for statuses
  const WarningIcon = () => (
    <motion.svg animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2 }} className="w-4 h-4 mr-1 text-[#B47134]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </motion.svg>
  );

  const ExpiredIcon = () => (
    <motion.svg animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-4 h-4 mr-1 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </motion.svg>
  );

  const GoodIcon = () => (
    <svg className="w-4 h-4 mr-1 text-[#4D6E60]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
  
  return (
    <div className="overflow-x-auto bg-white/60 backdrop-blur-md shadow-sm border border-[#16221D]/5 rounded-2xl">
      <table className="min-w-full table-auto">
        <thead className="bg-[#4D6E60]/5 border-b border-[#16221D]/10">
          <tr>
            <th className="px-5 py-4 text-left text-xs font-bold text-[#2D3E37]/70 uppercase tracking-wider">Name</th>
            <th className="px-5 py-4 text-left text-xs font-bold text-[#2D3E37]/70 uppercase tracking-wider">Generic Name</th>
            <th className="px-5 py-4 text-left text-xs font-bold text-[#2D3E37]/70 uppercase tracking-wider">Stock</th>
            <th className="px-5 py-4 text-left text-xs font-bold text-[#2D3E37]/70 uppercase tracking-wider">Unit Price</th>
            <th className="px-5 py-4 text-left text-xs font-bold text-[#2D3E37]/70 uppercase tracking-wider">Expiry Date</th>
            <th className="px-5 py-4 text-left text-xs font-bold text-[#2D3E37]/70 uppercase tracking-wider">Status</th>
            <th className="px-5 py-4 text-left text-xs font-bold text-[#2D3E37]/70 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#16221D]/5 bg-white/40">
          {products.length === 0 ? (
            <tr>
              <td colSpan="7" className="px-5 py-8 text-center text-sm text-[#2D3E37]/50">No products found. Add your first product.</td>
            </tr>
          ) : (
            products.map((product, i) => (
              <motion.tr 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                key={product._id} 
                className="hover:bg-[#4D6E60]/5 transition-colors duration-200 group"
              >
                <td className="px-5 py-4 whitespace-nowrap text-sm font-semibold text-[#16221D]">
                  <Link to={`/products/${product._id}`} className="hover:text-[#4D6E60] transition-colors">
                    {product.name}
                  </Link>
                </td>
                <td className="px-5 py-4 whitespace-nowrap text-sm text-[#2D3E37]/80">{product.genericName || 'N/A'}</td>
                <td className="px-5 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <span className={`font-bold ${isLowStock(product) ? 'text-red-500' : 'text-[#16221D]'}`}>
                      {product.stockQuantity}
                    </span>
                    <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => adjustStock(product._id, 1)} className="text-[#4D6E60] hover:text-[#16221D] transition-colors"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 15l7-7 7 7" /></svg></button>
                      <button onClick={() => adjustStock(product._id, -1)} className="text-[#B47134] hover:text-[#16221D] transition-colors"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg></button>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 whitespace-nowrap text-sm font-medium text-[#16221D]">
                  ${Number(product.unitPrice || 0).toFixed(2)}
                </td>
                <td className="px-5 py-4 whitespace-nowrap">
                  <span className={`text-sm ${isExpired(product) ? 'text-red-500 font-bold' : isExpiringSoon(product) ? 'text-[#B47134] font-semibold' : 'text-[#2D3E37]/80'}`}>
                    {new Date(product.expiryDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </td>
                <td className="px-5 py-4 whitespace-nowrap">
                  <div className="flex flex-col gap-1.5 items-start">
                    {isLowStock(product) && (
                      <span className="flex items-center px-2.5 py-1 text-xs font-bold rounded-full bg-red-50 border border-red-100 text-red-600">
                        Low Stock
                      </span>
                    )}
                    {isExpiringSoon(product) && !isExpired(product) && (
                      <span className="flex items-center px-2.5 py-1 text-xs font-bold rounded-full bg-[#B47134]/10 border border-[#B47134]/20 text-[#B47134]">
                        <WarningIcon />
                        Expiring Soon
                      </span>
                    )}
                    {isExpired(product) && (
                      <span className="flex items-center px-2.5 py-1 text-xs font-bold rounded-full bg-red-50 border border-red-100 text-red-600">
                        <ExpiredIcon />
                        Expired
                      </span>
                    )}
                    {!isLowStock(product) && !isExpiringSoon(product) && !isExpired(product) && (
                      <span className="flex items-center px-2.5 py-1 text-xs font-bold rounded-full bg-[#4D6E60]/10 border border-[#4D6E60]/20 text-[#4D6E60]">
                        <GoodIcon />
                        Healthy
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-4 whitespace-nowrap text-sm">
                  <div className="flex space-x-3 items-center">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => editProduct(product)}
                      className="text-[#4D6E60] hover:text-[#16221D] font-medium transition-colors p-1 bg-white border border-[#16221D]/10 rounded-lg shadow-sm"
                      title="Edit Product"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => deleteProduct(product._id)}
                      className="text-red-400 hover:text-red-600 font-medium transition-colors p-1 bg-white border border-[#16221D]/10 rounded-lg shadow-sm"
                      title="Delete Product"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </motion.button>
                  </div>
                </td>
              </motion.tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProductList;