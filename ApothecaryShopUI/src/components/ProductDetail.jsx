import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import AddStockMovementModal from './AddStockMovementModal';

const ProductDetail = ({ product }) => {
  const [stockMovements, setStockMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  useEffect(() => {
    const fetchStockMovements = async () => {
      if (!product?._id) return;
      try {
        const token = localStorage.getItem('token');
        const apiUrl = import.meta.env.VITE_API_URL;
        const response = await axios.get(`${apiUrl}/stockMovements/product/${product._id}`, {
          headers: { 'Authorization': `${token}` }
        });
        setStockMovements(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching stock movements:', err);
        setLoading(false);
      }
    };
    fetchStockMovements();
  }, [product]);
  
  const handleAddStockMovement = async (newMovement) => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await axios.post(`${apiUrl}/stockMovements`, newMovement, {
        headers: { 'Authorization': `${token}` }
      });
      const updatedMovementsRes = await axios.get(`${apiUrl}/stockMovements/product/${product._id}`, {
        headers: { 'Authorization': `${token}` }
      });
      setStockMovements(updatedMovementsRes.data);
      setIsModalOpen(false);
      return response.data.product;
    } catch (err) {
      console.error('Error adding stock movement:', err);
      alert(`Error: ${err.response?.data?.message || 'Failed to add stock movement'}`);
      return null;
    }
  };
  
  if (!product) return null;

  const isLowStock = product.stockQuantity <= product.reorderLevel;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white/80 backdrop-blur-xl border border-[#16221D]/5 rounded-3xl shadow-sm p-8"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-[#16221D]">{product.name}</h2>
          <p className="text-[#4D6E60] font-medium mt-1">{product.genericName || 'N/A'}</p>
        </div>
        <div className="flex gap-3">
          <Link
            to={`/products/edit/${product._id}`}
            className="px-5 py-2.5 bg-white border border-[#16221D]/10 text-[#16221D] font-bold text-sm rounded-xl hover:bg-[#F5F7F4] hover:text-[#4D6E60] transition-all shadow-sm"
          >
            Edit Product
          </Link>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 bg-[#4D6E60] text-white font-bold text-sm rounded-xl hover:bg-[#3A5348] transition-all shadow-sm hover:shadow-md"
          >
            Update Stock
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-[#F5F7F4]/50 border border-[#16221D]/5 p-6 rounded-2xl flex flex-col items-center text-center group"
        >
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm group-hover:shadow-md transition-all">
            <svg className="w-6 h-6 text-[#B47134]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <p className="text-xs font-bold text-[#2D3E37]/50 uppercase tracking-wider mb-1">Pricing & Category</p>
          <h3 className="text-2xl font-black text-[#16221D]">${Number(product.unitPrice || 0).toFixed(2)}</h3>
          <p className="text-sm text-[#4D6E60] font-medium mt-1">{product.category || 'Uncategorized'}</p>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className={`border p-6 rounded-2xl flex flex-col items-center text-center group transition-all ${isLowStock ? 'bg-red-50/50 border-red-100' : 'bg-[#4D6E60]/5 border-[#4D6E60]/10'}`}
        >
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm group-hover:shadow-md transition-all">
            <motion.svg animate={isLowStock ? { scale: [1, 1.2, 1] } : {}} transition={{ repeat: Infinity, duration: 1.5 }} className={`w-6 h-6 ${isLowStock ? 'text-red-500' : 'text-[#4D6E60]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </motion.svg>
          </div>
          <p className="text-xs font-bold text-[#2D3E37]/50 uppercase tracking-wider mb-1">Inventory status</p>
          <h3 className={`text-2xl font-black ${isLowStock ? 'text-red-600' : 'text-[#16221D]'}`}>{product.stockQuantity} Units</h3>
          <p className="text-sm font-medium mt-1 text-[#2D3E37]/70">Reorder at: {product.reorderLevel}</p>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-[#F5F7F4]/50 border border-[#16221D]/5 p-6 rounded-2xl flex flex-col items-center text-center group"
        >
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm group-hover:shadow-md transition-all">
            <svg className="w-6 h-6 text-[#16221D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-xs font-bold text-[#2D3E37]/50 uppercase tracking-wider mb-1">Expiry Date</p>
          <h3 className="text-xl font-black text-[#16221D]">{new Date(product.expiryDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</h3>
          <p className="text-sm text-[#2D3E37]/70 font-medium mt-1">SKU: {product.sku}</p>
        </motion.div>
      </div>
      
      <div className="mb-10">
        <h3 className="text-lg font-bold text-[#16221D] mb-4">Description</h3>
        <div className="bg-[#F5F7F4]/30 border border-[#16221D]/5 p-5 rounded-xl">
          <p className="text-[#2D3E37] leading-relaxed">{product.description || 'No description provided.'}</p>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-6">
          <h3 className="text-lg font-bold text-[#16221D]">Recent Stock Movements</h3>
          <div className="flex-1 h-px bg-[#16221D]/5"></div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-8 h-8 border-4 border-[#4D6E60]/20 border-t-[#4D6E60] rounded-full"></motion.div>
          </div>
        ) : stockMovements.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-[#16221D]/10">
            <table className="min-w-full divide-y divide-[#16221D]/10">
              <thead className="bg-[#F5F7F4]">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#2D3E37]/70 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#2D3E37]/70 uppercase tracking-wider">Type</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#2D3E37]/70 uppercase tracking-wider">Quantity</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#2D3E37]/70 uppercase tracking-wider">New Stock</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#2D3E37]/70 uppercase tracking-wider">Reason</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#16221D]/5">
                {stockMovements.slice(0, 5).map(movement => (
                  <tr key={movement._id} className="hover:bg-[#F5F7F4]/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#16221D]">
                      {new Date(movement.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs font-bold rounded-full border ${
                        movement.type === 'in' ? 'bg-[#4D6E60]/10 border-[#4D6E60]/20 text-[#4D6E60]' : 'bg-[#B47134]/10 border-[#B47134]/20 text-[#B47134]'
                      }`}>
                        {movement.type === 'in' ? '+ Stock In' : '- Stock Out'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#16221D]">{movement.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2D3E37]/70">{movement.newStock}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2D3E37]/70">{movement.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-[#F5F7F4]/30 border border-[#16221D]/5 rounded-xl p-8 text-center">
            <svg className="w-10 h-10 mx-auto text-[#2D3E37]/30 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-[#2D3E37]/60 font-medium">No stock movement records found.</p>
          </div>
        )}
      </div>
      
      {/* Add Stock Movement Modal */}
      <AddStockMovementModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddStockMovement}
        products={[product]}
      />
    </motion.div>
  );
};

export default ProductDetail;
