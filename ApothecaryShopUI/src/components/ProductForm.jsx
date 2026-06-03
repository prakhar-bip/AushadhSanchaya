import React, { useState, useEffect } from 'react';
import DatePickerWrapper from './common/DatePickerWrapper';
import { motion } from 'motion/react';

const ProductForm = ({ product, saveProduct, cancelEdit }) => {
  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    category: '',
    manufacturer: '',
    batchNumber: '',
    sku: '', 
    description: '', 
    expiryDate: '',
    stockQuantity: 0,
    unitPrice: 0,
    reorderLevel: 0
  });
  
  useEffect(() => {
    if (product) {
      const expiryDate = product.expiryDate 
        ? new Date(product.expiryDate).toISOString().split('T')[0] 
        : '';
        
      setFormData({
        name: product.name,
        genericName: product.genericName || '',
        category: product.category || '',
        manufacturer: product.manufacturer || '',
        batchNumber: product.batchNumber || '',
        sku: product.sku || '',
        description: product.description || '',
        expiryDate,
        stockQuantity: product.stockQuantity || 0,
        unitPrice: product.unitPrice || 0,
        reorderLevel: product.reorderLevel || 0
      });
    } else {
      // Clear form when adding a new product
      setFormData({
        name: '',
        genericName: '',
        category: '',
        manufacturer: '',
        batchNumber: '',
        sku: '',
        description: '',
        expiryDate: '',
        stockQuantity: 0,
        unitPrice: 0,
        reorderLevel: 0
      });
    }
  }, [product]);
  
  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const onSubmit = e => {
    e.preventDefault();
    
    let updatedData = { ...formData };
    if (!updatedData.sku) {
      const timestamp = Date.now().toString().slice(-6);
      const categoryCode = (updatedData.category || 'GEN').substring(0, 3).toUpperCase();
      updatedData.sku = `AP-${categoryCode}-${timestamp}`;
    }
    
    updatedData.stockQuantity = Number(updatedData.stockQuantity);
    updatedData.unitPrice = Number(updatedData.unitPrice);
    updatedData.reorderLevel = Number(updatedData.reorderLevel);
    
    saveProduct(updatedData);
  };
  
  // Check if product is expired or expiring soon
  const getExpiryStatus = () => {
    if (!formData.expiryDate) return { label: 'No Expiry', color: 'text-gray-400 border-gray-200 bg-gray-50' };
    const today = new Date();
    const expiry = new Date(formData.expiryDate);
    if (expiry < today) {
      return { label: 'EXPIRED', color: 'text-[#B91C1C] border-[#B91C1C]/20 bg-[#B91C1C]/5' };
    }
    const ninetyDays = new Date();
    ninetyDays.setDate(today.getDate() + 90);
    if (expiry <= ninetyDays) {
      return { label: 'EXPIRING SOON', color: 'text-[#B47134] border-[#B47134]/20 bg-[#B47134]/5' };
    }
    return { label: 'STABLE BATCH', color: 'text-[#4D6E60] border-[#4D6E60]/20 bg-[#4D6E60]/5' };
  };

  const expiryStatus = getExpiryStatus();

  return (
    <form onSubmit={onSubmit} className="w-full text-left font-sans">
      <style>{`
        @keyframes scanLaser {
          0% { top: 0%; opacity: 0.8; }
          50% { top: 100%; opacity: 0.8; }
          100% { top: 0%; opacity: 0.8; }
        }
        .laser-line {
          animation: scanLaser 4s ease-in-out infinite;
        }
      `}</style>

      <h2 className="text-lg font-bold font-serif text-[#16221D] border-b border-[#16221D]/5 pb-2 mb-4">
        {product ? 'Edit Apothecary SKU' : 'Register New Apothecary SKU'}
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LEFT COLUMN: LIVE APOTHECARY LABEL PREVIEW */}
        <div className="lg:col-span-1 bg-[#F5F7F4]/60 border border-[#16221D]/10 rounded-xl p-4 relative overflow-hidden shadow-sm h-full flex flex-col justify-between min-h-[340px]">
          {/* Laser scan line overlay */}
          <div className="absolute left-0 right-0 h-[2px] bg-red-500 laser-line shadow-[0_0_8px_#ef4444] z-10 pointer-events-none" />
          
          <div>
            {/* Header info */}
            <div className="flex justify-between items-center mb-3">
              <span className="text-[9px] font-bold tracking-widest text-[#2D3E37]/60 uppercase font-mono">AushadhSanchaya Ledger</span>
              <svg className="w-5 h-5 text-[#4D6E60] animate-spin-slow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5" />
                <circle cx="12" cy="12" r="3.5" fill="#4D6E60" opacity="0.3" />
              </svg>
            </div>
            
            {/* Live Name */}
            <div className="mb-2">
              <h3 className="text-base font-extrabold font-serif text-[#16221D] truncate leading-tight">
                {formData.name || 'Unnamed Product'}
              </h3>
              <p className="text-2xs italic text-[#2D3E37]/80 truncate mt-0.5">
                {formData.genericName || 'No Generic Name'}
              </p>
            </div>
            
            {/* Category badge */}
            <div className="mb-4">
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-[#4D6E60]/10 text-[#4D6E60] border border-[#4D6E60]/20">
                {formData.category || 'Uncategorized'}
              </span>
            </div>

            {/* Simulated Clinical Barcode representation */}
            <div className="bg-white border border-[#16221D]/5 p-2 rounded-lg mb-4 shadow-3xs flex flex-col items-center">
              <div className="flex w-full justify-between items-center h-10 px-1 opacity-80 overflow-hidden">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div 
                    key={i} 
                    className="bg-black rounded-sm" 
                    style={{ 
                      width: i % 4 === 0 ? '3px' : i % 3 === 0 ? '1.5px' : '1px',
                      height: '100%',
                      opacity: i % 7 === 0 ? 0.3 : 1
                    }} 
                  />
                ))}
              </div>
              <span className="text-[9px] font-mono tracking-widest text-[#2D3E37]/80 mt-1 select-all">
                {formData.sku || 'AP-AUTO-GEN'}
              </span>
            </div>

            {/* Info details grid */}
            <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-2xs mb-4 border-t border-[#16221D]/5 pt-3">
              <div>
                <span className="text-[#2D3E37]/65 block">MFR:</span>
                <span className="font-semibold text-[#16221D] truncate block">{formData.manufacturer || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[#2D3E37]/65 block">BATCH:</span>
                <span className="font-semibold text-[#16221D] truncate block">{formData.batchNumber || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[#2D3E37]/65 block">PRICE:</span>
                <span className="font-semibold text-[#16221D] block">${Number(formData.unitPrice || 0).toFixed(2)}</span>
              </div>
              <div>
                <span className="text-[#2D3E37]/65 block">EXPIRY:</span>
                <span className="font-semibold text-[#16221D] block">{formData.expiryDate ? new Date(formData.expiryDate).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
          </div>
          
          {/* Badges footer */}
          <div className="flex justify-between items-center pt-3 border-t border-[#16221D]/5 mt-auto">
            <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full border ${
              formData.stockQuantity <= formData.reorderLevel 
                ? 'text-[#B91C1C] border-[#B91C1C]/20 bg-[#B91C1C]/5' 
                : 'text-[#4D6E60] border-[#4D6E60]/20 bg-[#4D6E60]/5'
            }`}>
              {formData.stockQuantity <= formData.reorderLevel ? 'LOW STOCK' : 'IN STOCK'}
            </span>
            
            <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full border ${expiryStatus.color}`}>
              {expiryStatus.label}
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: FORM FIELDS (TIGHT 3-COLUMN GRID) */}
        <div className="lg:col-span-2 space-y-3">
          {/* GENERAL INFO BLOCK */}
          <div className="bg-[#F5F7F4]/30 border border-[#16221D]/5 rounded-xl p-3.5 space-y-2.5">
            <h3 className="text-2xs font-bold text-[#4D6E60] uppercase tracking-wider mb-0.5">Product Identity</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[#2D3E37]/75 text-3xs font-bold uppercase tracking-wider mb-1">Product Name*</label>
                <input
                  className="block w-full px-2.5 py-1.5 border border-[#16221D]/10 rounded-md text-xs bg-white text-[#16221D] placeholder-[#2D3E37]/45 focus:outline-none focus:ring-1 focus:ring-[#4D6E60] focus:border-[#4D6E60] transition-all"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={onChange}
                  required
                  placeholder="e.g. Paracetamol"
                />
              </div>
              <div>
                <label className="block text-[#2D3E37]/75 text-3xs font-bold uppercase tracking-wider mb-1">Generic Name*</label>
                <input
                  className="block w-full px-2.5 py-1.5 border border-[#16221D]/10 rounded-md text-xs bg-white text-[#16221D] placeholder-[#2D3E37]/45 focus:outline-none focus:ring-1 focus:ring-[#4D6E60] focus:border-[#4D6E60] transition-all"
                  type="text"
                  name="genericName"
                  value={formData.genericName}
                  onChange={onChange}
                  required
                  placeholder="Active substance"
                />
              </div>
              <div>
                <label className="block text-[#2D3E37]/75 text-3xs font-bold uppercase tracking-wider mb-1">Category*</label>
                <input
                  className="block w-full px-2.5 py-1.5 border border-[#16221D]/10 rounded-md text-xs bg-white text-[#16221D] placeholder-[#2D3E37]/45 focus:outline-none focus:ring-1 focus:ring-[#4D6E60] focus:border-[#4D6E60] transition-all"
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={onChange}
                  required
                  placeholder="e.g. Analgesic"
                />
              </div>
            </div>
          </div>

          {/* LOGISTICS & COMPLIANCE BLOCK */}
          <div className="bg-[#F5F7F4]/30 border border-[#16221D]/5 rounded-xl p-3.5 space-y-2.5">
            <h3 className="text-2xs font-bold text-[#4D6E60] uppercase tracking-wider mb-0.5">Logistics & Compliance</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[#2D3E37]/75 text-3xs font-bold uppercase tracking-wider mb-1">Manufacturer*</label>
                <input
                  className="block w-full px-2.5 py-1.5 border border-[#16221D]/10 rounded-md text-xs bg-white text-[#16221D] placeholder-[#2D3E37]/45 focus:outline-none focus:ring-1 focus:ring-[#4D6E60] focus:border-[#4D6E60] transition-all"
                  type="text"
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={onChange}
                  required
                  placeholder="Certified lab"
                />
              </div>
              <div>
                <label className="block text-[#2D3E37]/75 text-3xs font-bold uppercase tracking-wider mb-1">Batch Number*</label>
                <input
                  className="block w-full px-2.5 py-1.5 border border-[#16221D]/10 rounded-md text-xs bg-white text-[#16221D] placeholder-[#2D3E37]/45 focus:outline-none focus:ring-1 focus:ring-[#4D6E60] focus:border-[#4D6E60] transition-all"
                  type="text"
                  name="batchNumber"
                  value={formData.batchNumber}
                  onChange={onChange}
                  required
                  placeholder="e.g. BAT-2026-09"
                />
              </div>
              <div>
                <label className="block text-[#2D3E37]/75 text-3xs font-bold uppercase tracking-wider mb-1">SKU Code</label>
                <input
                  className="block w-full px-2.5 py-1.5 border border-[#16221D]/10 rounded-md text-xs bg-white text-[#16221D] placeholder-[#2D3E37]/45 focus:outline-none focus:ring-1 focus:ring-[#4D6E60] focus:border-[#4D6E60] transition-all"
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={onChange}
                  placeholder="Leave blank to auto-generate"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[#2D3E37]/75 text-3xs font-bold uppercase tracking-wider mb-1">Expiry Date*</label>
                <DatePickerWrapper
                  className="block w-full px-2.5 py-1.5 border border-[#16221D]/10 rounded-md text-xs bg-white text-[#16221D] focus:outline-none focus:ring-1 focus:ring-[#4D6E60] focus:border-[#4D6E60] transition-all"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={onChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* INVENTORY & PRICING BLOCK */}
          <div className="bg-[#F5F7F4]/30 border border-[#16221D]/5 rounded-xl p-3.5 space-y-2.5">
            <h3 className="text-2xs font-bold text-[#4D6E60] uppercase tracking-wider mb-0.5">Inventory & Pricing</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[#2D3E37]/75 text-3xs font-bold uppercase tracking-wider mb-1">Stock Quantity*</label>
                <input
                  className="block w-full px-2.5 py-1.5 border border-[#16221D]/10 rounded-md text-xs bg-white text-[#16221D] focus:outline-none focus:ring-1 focus:ring-[#4D6E60] focus:border-[#4D6E60] transition-all"
                  type="number"
                  name="stockQuantity"
                  value={formData.stockQuantity}
                  onChange={onChange}
                  required
                />
              </div>
              <div>
                <label className="block text-[#2D3E37]/75 text-3xs font-bold uppercase tracking-wider mb-1">Unit Price ($)*</label>
                <input
                  className="block w-full px-2.5 py-1.5 border border-[#16221D]/10 rounded-md text-xs bg-white text-[#16221D] focus:outline-none focus:ring-1 focus:ring-[#4D6E60] focus:border-[#4D6E60] transition-all"
                  type="number"
                  step="0.01"
                  name="unitPrice"
                  value={formData.unitPrice}
                  onChange={onChange}
                  required
                />
              </div>
              <div>
                <label className="block text-[#2D3E37]/75 text-3xs font-bold uppercase tracking-wider mb-1">Reorder Level*</label>
                <input
                  className="block w-full px-2.5 py-1.5 border border-[#16221D]/10 rounded-md text-xs bg-white text-[#16221D] focus:outline-none focus:ring-1 focus:ring-[#4D6E60] focus:border-[#4D6E60] transition-all"
                  type="number"
                  name="reorderLevel"
                  value={formData.reorderLevel}
                  onChange={onChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* DESCRIPTION BLOCK */}
          <div className="p-1">
            <label className="block text-[#2D3E37]/75 text-3xs font-bold uppercase tracking-wider mb-1">Product Description</label>
            <textarea
              className="block w-full px-2.5 py-1.5 border border-[#16221D]/10 rounded-md text-xs bg-white text-[#16221D] placeholder-[#2D3E37]/45 focus:outline-none focus:ring-1 focus:ring-[#4D6E60] focus:border-[#4D6E60] transition-all"
              rows="2"
              name="description"
              value={formData.description}
              onChange={onChange}
              placeholder="Enter packaging, storage guidelines, or clinical notes..."
            ></textarea>
          </div>
        </div>
      </div>
      
      {/* ACTION BUTTONS FOOTER */}
      <div className="flex justify-end items-center space-x-3 border-t border-[#16221D]/5 pt-3 mt-4">
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button" 
          className="px-4 py-1.5 border border-[#16221D]/10 hover:bg-[#E9ECE8] text-[#16221D] rounded-lg text-xs font-semibold transition-all duration-300 focus:outline-none"
          onClick={cancelEdit}
        >
          Cancel
        </motion.button>
        <motion.button 
          whileHover={{ scale: 1.02, boxShadow: "0 4px 12px rgba(77, 110, 96, 0.2)" }}
          whileTap={{ scale: 0.98 }}
          type="submit" 
          className="px-4 py-1.5 bg-[#4D6E60] hover:bg-[#678E7D] text-[#F5F7F4] rounded-lg text-xs font-semibold transition-all duration-300 focus:outline-none"
        >
          {product ? 'Save Changes' : 'Register Product'}
        </motion.button>
      </div>
    </form>
  );
};

export default ProductForm;