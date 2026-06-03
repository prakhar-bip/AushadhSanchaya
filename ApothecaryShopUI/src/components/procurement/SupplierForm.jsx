import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { getSupplier, createSupplier, updateSupplier } from '../../services/supplierService';
import Dropdown from '../Dropdown';

function SupplierForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    taxId: '',
    paymentTerms: '',
    isJanAushadhi: false,
    rating: 3,
    status: 'active'
  });
  
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (isEditMode) {
      fetchSupplierData();
    }
  }, [isEditMode, id]);
  
  const fetchSupplierData = async () => {
    try {
      const data = await getSupplier(id);
      setFormData(data);
    } catch (err) {
      setError('Failed to load supplier information');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      if (isEditMode) {
        await updateSupplier(id, formData);
      } else {
        await createSupplier(formData);
      }
      navigate('/procurement/suppliers');
    } catch (err) {
      setError('Failed to save supplier');
      console.error(err);
      setLoading(false);
    }
  };
  
  if (loading && isEditMode) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-[#4D6E60]/20 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-[#4D6E60] rounded-full border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }
  
  const inputClassName = "w-full px-4 py-2.5 bg-[#F5F7F4]/50 border border-[#16221D]/10 rounded-lg shadow-sm placeholder-[#2D3E37]/30 text-[#16221D] focus:outline-none focus:ring-2 focus:ring-[#4D6E60]/20 focus:border-[#4D6E60] transition-all";
  const labelClassName = "block text-sm font-semibold text-[#2D3E37] mb-1.5";
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#16221D]">{isEditMode ? 'Edit Supplier' : 'Add New Supplier'}</h1>
      </div>
      
      {error && (
        <div className="bg-[#B47134]/10 border border-[#B47134]/20 text-[#B47134] px-4 py-3 rounded-xl mb-6 font-medium">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-[#16221D]/5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Basic Information */}
          <div>
            <h2 className="text-xl font-bold text-[#4D6E60] mb-6 pb-2 border-b border-[#16221D]/5">Basic Information</h2>
            
            <div className="mb-5">
              <label className={labelClassName}>Name <span className="text-[#B47134]">*</span></label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className={inputClassName}
              />
            </div>
            
            <div className="mb-5">
              <label className={labelClassName}>Contact Person</label>
              <input
                type="text"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                className={inputClassName}
              />
            </div>
            
            <div className="mb-5">
              <label className={labelClassName}>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={inputClassName}
              />
            </div>
            
            <div className="mb-5">
              <label className={labelClassName}>Phone</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={inputClassName}
              />
            </div>
            
            <div className="mb-5">
              <label className={labelClassName}>Tax ID</label>
              <input
                type="text"
                name="taxId"
                value={formData.taxId}
                onChange={handleChange}
                className={inputClassName}
              />
            </div>
          </div>
          
          {/* Address & Additional Information */}
          <div>
            <h2 className="text-xl font-bold text-[#4D6E60] mb-6 pb-2 border-b border-[#16221D]/5">Address</h2>
            
            <div className="mb-5">
              <label className={labelClassName}>Street</label>
              <input
                type="text"
                name="address.street"
                value={formData.address.street}
                onChange={handleChange}
                className={inputClassName}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <label className={labelClassName}>City</label>
                <input
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                  className={inputClassName}
                />
              </div>
              
              <div>
                <label className={labelClassName}>State</label>
                <input
                  type="text"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleChange}
                  className={inputClassName}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <label className={labelClassName}>Zip Code</label>
                <input
                  type="text"
                  name="address.zipCode"
                  value={formData.address.zipCode}
                  onChange={handleChange}
                  className={inputClassName}
                />
              </div>
              
              <div>
                <label className={labelClassName}>Country</label>
                <input
                  type="text"
                  name="address.country"
                  value={formData.address.country}
                  onChange={handleChange}
                  className={inputClassName}
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-[#16221D]/5">
          <h2 className="text-xl font-bold text-[#4D6E60] mb-6">Additional Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="mb-5">
              <label className={labelClassName}>Payment Terms</label>
              <input
                type="text"
                name="paymentTerms"
                value={formData.paymentTerms}
                onChange={handleChange}
                placeholder="e.g., Net 30, Cash on Delivery"
                className={inputClassName}
              />
            </div>
            
            <div className="mb-5">
              <label className={labelClassName}>Rating</label>
              <Dropdown
                name="rating"
                value={formData.rating}
                onChange={handleChange}
                options={[
                  { value: 1, label: "1 - Poor" },
                  { value: 2, label: "2 - Fair" },
                  { value: 3, label: "3 - Average" },
                  { value: 4, label: "4 - Good" },
                  { value: 5, label: "5 - Excellent" }
                ]}
              />
            </div>
            
            <div className="mb-5">
              <label className={labelClassName}>Status</label>
              <Dropdown
                name="status"
                value={formData.status}
                onChange={handleChange}
                options={[
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" }
                ]}
              />
            </div>
            
            <div className="mb-5 flex items-center h-full pt-4">
              <label className="flex items-center cursor-pointer group">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    id="isJanAushadhi"
                    name="isJanAushadhi"
                    checked={formData.isJanAushadhi}
                    onChange={handleChange}
                    className="peer sr-only"
                  />
                  <div className="w-11 h-6 bg-[#16221D]/10 rounded-full peer peer-checked:bg-[#4D6E60] transition-colors"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow-sm"></div>
                </div>
                <span className="ml-3 text-sm font-semibold text-[#2D3E37] group-hover:text-[#4D6E60] transition-colors">
                  JanAushadhi Supplier
                </span>
              </label>
            </div>
          </div>
        </div>
        
        <div className="mt-10 pt-6 border-t border-[#16221D]/5 flex gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className={`px-6 py-3 bg-[#4D6E60] text-white rounded-lg font-semibold hover:bg-[#678E7D] transition-colors flex items-center justify-center ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : 'Save Supplier'}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => navigate('/procurement/suppliers')}
            className="px-6 py-3 bg-[#F5F7F4] border border-[#16221D]/10 text-[#2D3E37] rounded-lg font-semibold hover:bg-[#16221D]/5 transition-colors"
          >
            Cancel
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}

export default SupplierForm;