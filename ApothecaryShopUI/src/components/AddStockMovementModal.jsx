import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Dropdown from './Dropdown';

const AddStockMovementModal = ({ isOpen, onClose, onSubmit, products }) => {
  const [formData, setFormData] = useState({
    productId: '',
    type: 'in',
    quantity: '',
    reason: ''
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      quantity: Number(formData.quantity)
    });
    
    // Reset form
    setFormData({
      productId: '',
      type: 'in',
      quantity: '',
      reason: ''
    });
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-[#16221D]/40 backdrop-blur-sm flex justify-center items-center z-50 p-4"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white rounded-2xl shadow-xl border border-[#16221D]/5 p-6 w-full max-w-md overflow-hidden"
          >
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#16221D]/5">
              <h3 className="text-xl font-bold text-[#16221D]">Add Stock Movement</h3>
              <button 
                onClick={onClose} 
                className="text-[#2D3E37]/50 hover:text-[#16221D] transition-colors focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="productId" className="block text-sm font-semibold text-[#2D3E37] mb-1.5">Product</label>
                <Dropdown
                  id="productId"
                  name="productId"
              value={formData.productId}
              onChange={handleChange}
              placeholder="-- Select a product --"
              options={products.map(product => ({
                value: product._id,
                label: `${product.name} (Current Stock: ${product.stockQuantity})`
              }))}
                required
                className="border-[#16221D]/10 bg-[#F5F7F4]/50 focus:ring-[#4D6E60] focus:border-[#4D6E60]"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-semibold text-[#2D3E37] mb-2">Movement Type</label>
              <div className="flex space-x-4 bg-[#F5F7F4]/50 p-3 rounded-lg border border-[#16221D]/5">
                <div className="flex items-center">
                  <input
                    id="type-in"
                    name="type"
                    type="radio"
                    value="in"
                    checked={formData.type === 'in'}
                    onChange={handleChange}
                    className="h-4 w-4 text-[#4D6E60] focus:ring-[#4D6E60] border-[#16221D]/20 cursor-pointer"
                  />
                  <label htmlFor="type-in" className="ml-2 block text-sm font-medium text-[#2D3E37] cursor-pointer">
                    Stock In
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="type-out"
                    name="type"
                    type="radio"
                    value="out"
                    checked={formData.type === 'out'}
                    onChange={handleChange}
                    className="h-4 w-4 text-[#B47134] focus:ring-[#B47134] border-[#16221D]/20 cursor-pointer"
                  />
                  <label htmlFor="type-out" className="ml-2 block text-sm font-medium text-[#2D3E37] cursor-pointer">
                    Stock Out
                  </label>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="quantity" className="block text-sm font-semibold text-[#2D3E37] mb-1.5">Quantity</label>
              <input
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={handleChange}
                className="block w-full px-3 py-2.5 border border-[#16221D]/10 rounded-lg shadow-sm placeholder-[#2D3E37]/30 text-[#16221D] focus:outline-none focus:ring-1 focus:ring-[#4D6E60] focus:border-[#4D6E60] bg-[#F5F7F4]/50 sm:text-sm transition-all"
                required
              />
            </div>
            
            <div className="mb-8">
              <label htmlFor="reason" className="block text-sm font-semibold text-[#2D3E37] mb-1.5">Reason</label>
              <input
                id="reason"
                name="reason"
                type="text"
                value={formData.reason}
                onChange={handleChange}
                placeholder="e.g., New purchase, Sale, Damage, etc."
                className="block w-full px-3 py-2.5 border border-[#16221D]/10 rounded-lg shadow-sm placeholder-[#2D3E37]/30 text-[#16221D] focus:outline-none focus:ring-1 focus:ring-[#4D6E60] focus:border-[#4D6E60] bg-[#F5F7F4]/50 sm:text-sm transition-all"
                required
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <motion.button
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-[#16221D]/10 rounded-lg shadow-sm text-sm font-semibold text-[#2D3E37] bg-white hover:bg-[#F5F7F4] focus:outline-none transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-[#4D6E60] hover:bg-[#678E7D] focus:outline-none transition-colors"
              >
                Save Movement
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddStockMovementModal;
