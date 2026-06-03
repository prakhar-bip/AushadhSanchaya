import React, { useState } from 'react';
import { motion } from 'motion/react';
import Dropdown from './Dropdown';

const StockMovementForm = ({ productId, onSubmit }) => {
  const [formData, setFormData] = useState({
    type: 'in',
    quantity: 1,
    reason: ''
  });
  
  const { type, quantity, reason } = formData;
  
  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = e => {
    e.preventDefault();
    onSubmit({
      productId,
      type,
      quantity,
      reason
    });
    
    // Reset form
    setFormData({
      type: 'in',
      quantity: 1,
      reason: ''
    });
  };
  
  return (
    <motion.form 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit} 
      className="bg-white rounded-xl shadow-sm border border-[#16221D]/5 p-6"
    >
      <h3 className="text-xl font-bold text-[#16221D] mb-6 pb-4 border-b border-[#16221D]/5">Add Stock Movement</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-semibold text-[#2D3E37] mb-2">Movement Type</label>
        <div className="flex space-x-4 bg-[#F5F7F4]/50 p-3 rounded-lg border border-[#16221D]/5">
          <div className="flex items-center">
            <input
              id="inline-type-in"
              name="type"
              type="radio"
              value="in"
              checked={type === 'in'}
              onChange={onChange}
              className="h-4 w-4 text-[#4D6E60] focus:ring-[#4D6E60] border-[#16221D]/20 cursor-pointer"
            />
            <label htmlFor="inline-type-in" className="ml-2 block text-sm font-medium text-[#2D3E37] cursor-pointer">
              Stock In
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="inline-type-out"
              name="type"
              type="radio"
              value="out"
              checked={type === 'out'}
              onChange={onChange}
              className="h-4 w-4 text-[#B47134] focus:ring-[#B47134] border-[#16221D]/20 cursor-pointer"
            />
            <label htmlFor="inline-type-out" className="ml-2 block text-sm font-medium text-[#2D3E37] cursor-pointer">
              Stock Out
            </label>
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-semibold text-[#2D3E37] mb-1.5">Quantity</label>
        <input
          type="number"
          name="quantity"
          value={quantity}
          onChange={onChange}
          min="1"
          className="block w-full px-3 py-2.5 border border-[#16221D]/10 rounded-lg shadow-sm placeholder-[#2D3E37]/30 text-[#16221D] focus:outline-none focus:ring-1 focus:ring-[#4D6E60] focus:border-[#4D6E60] bg-[#F5F7F4]/50 sm:text-sm transition-all"
          required
        />
      </div>
      
      <div className="mb-8">
        <label className="block text-sm font-semibold text-[#2D3E37] mb-1.5">Reason</label>
        <input
          type="text"
          name="reason"
          value={reason}
          onChange={onChange}
          placeholder="Purpose of movement"
          className="block w-full px-3 py-2.5 border border-[#16221D]/10 rounded-lg shadow-sm placeholder-[#2D3E37]/30 text-[#16221D] focus:outline-none focus:ring-1 focus:ring-[#4D6E60] focus:border-[#4D6E60] bg-[#F5F7F4]/50 sm:text-sm transition-all"
          required
        />
      </div>
      
      <div className="flex justify-end">
        <motion.button 
          whileTap={{ scale: 0.95 }}
          type="submit" 
          className="px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-[#4D6E60] hover:bg-[#678E7D] focus:outline-none transition-colors w-full sm:w-auto"
        >
          Submit Movement
        </motion.button>
      </div>
    </motion.form>
  );
};

export default StockMovementForm;