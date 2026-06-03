import React, { useState, useEffect } from 'react';
import DatePickerWrapper from '../common/DatePickerWrapper';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { getSuppliers } from '../../services/supplierService';
import { getPurchaseOrder, createPurchaseOrder, updatePurchaseOrder } from '../../services/purchaseOrderService';
import Dropdown from '../Dropdown';
import { getProducts } from '../../services/productService';
import { getExternalProducts } from '../../services/externalProductService';
import DiseaseTrendSuggestions from './DiseaseTrendSuggestions';

function PurchaseOrderForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  
  const [loading, setLoading] = useState(isEditMode);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [externalProducts, setExternalProducts] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  
  const [formData, setFormData] = useState({
    supplier: '',
    orderDate: new Date().toISOString().split('T')[0],
    expectedDeliveryDate: '',
    items: [],
    shippingCost: 0,
    discountAmount: 0,
    notes: ''
  });
  
  // Calculate totals
  const subtotal = formData.items.reduce((acc, item) => {
    // Ensure we're working with numbers, not strings
    const quantity = Number(item.quantity);
    const unitPrice = Number(item.unitPrice);
    const discount = Number(item.discount || 0);
    const tax = Number(item.tax || 0);
    
    const totalPrice = quantity * unitPrice * 
                     (1 - discount / 100) * 
                     (1 + tax / 100);
    return acc + totalPrice;
  }, 0);
  
  // Fix: Ensure all values are treated as numbers during calculation
  const totalAmount = Number(subtotal) + 
                     Number(parseFloat(formData.shippingCost || 0)) - 
                     Number(parseFloat(formData.discountAmount || 0));
  
  useEffect(() => {
    fetchSuppliers();
    fetchProducts();
    if (isEditMode) {
      fetchPurchaseOrderData();
    }
  }, [isEditMode, id]);

  // Load suppliers
  const fetchSuppliers = async () => {
    try {
      const data = await getSuppliers();
      setSuppliers(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setError('Failed to load suppliers');
      console.error(err);
    }
  };

  // Load inventory products
  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      // Ensure products is always an array to prevent .map() errors
      setProducts(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setError('Failed to load products');
      console.error(err);
    }
  };

  // Load purchase order data if in edit mode
  const fetchPurchaseOrderData = async () => {
    try {
      const data = await getPurchaseOrder(id);
      setFormData({
        ...data,
        supplier: data.supplier._id,
        orderDate: new Date(data.orderDate).toISOString().split('T')[0],
        expectedDeliveryDate: data.expectedDeliveryDate ? 
          new Date(data.expectedDeliveryDate).toISOString().split('T')[0] : ''
      });
      // Set selected supplier
      setSelectedSupplier(data.supplier);
    } catch (err) {
      setError('Failed to load purchase order');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch external products if supplier is JanAushadhi
  useEffect(() => {
    if (selectedSupplier?.isJanAushadhi) {
      fetchExternalProducts();
    }
  }, [selectedSupplier]);

  // Modified to accept an optional searchText parameter
  const fetchExternalProducts = async (customSearchTerm = null) => {
    try {
      setLoading(true);
      // Use the custom search term if provided, otherwise use the state value
      const searchTextToUse = customSearchTerm !== null ? customSearchTerm : searchTerm;
      
      const response = await getExternalProducts({
        searchText: searchTextToUse,
        pageSize: 100
      });
      if (response && response.responseBody) {
        setExternalProducts(response.responseBody.newProductResponsesList || []);
      }
    } catch (err) {
      console.error('Failed to fetch external products', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'supplier') {
      const selected = suppliers.find(s => s._id === value);
      setSelectedSupplier(selected);
    }
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddProduct = (product, isExternal = false) => {
    // Check if product is already in the list
    const existingItemIndex = formData.items.findIndex(item => 
      isExternal ? 
        item.externalProductId === product.productId :
        item.product === product._id
    );
    if (existingItemIndex !== -1) {
      // Update quantity if product already exists
      const updatedItems = [...formData.items];
      updatedItems[existingItemIndex].quantity += 1;
      setFormData(prev => ({
        ...prev,
        items: updatedItems
      }));
      return;
    }
    // Add new product
    const newItem = isExternal ? {
      externalProductId: product.productId,
      genericName: product.genericName,
      drugCode: product.drugCode,
      groupName: product.groupName,
      unitSize: product.unitSize,
      quantity: 1,
      unitPrice: Number(product.mrp || 0),
      discount: 0,
      tax: 0,
      totalPrice: Number(product.mrp || 0)
    } : {
      product: product._id,
      genericName: product.name || product.genericName,
      quantity: 1,
      unitPrice: Number(product.unitPrice || 0),
      discount: 0,
      tax: 0,
      totalPrice: Number(product.unitPrice || 0)
    };
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const handleRemoveItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    // Ensure value is a number for numeric fields
    updatedItems[index][field] = field === 'quantity' ? Number(value) : 
                                field === 'unitPrice' ? Number(value) :
                                field === 'discount' ? Number(value) :
                                field === 'tax' ? Number(value) : value;
    
    // Fix: Ensure numeric calculation
    const item = updatedItems[index];
    const quantity = Number(item.quantity);
    const unitPrice = Number(item.unitPrice);
    const discount = Number(item.discount || 0);
    const tax = Number(item.tax || 0);
    
    item.totalPrice = quantity * unitPrice *
                     (1 - discount / 100) *
                     (1 + tax / 100);
    
    setFormData(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.items.length === 0) {
      setError('Please add at least one item to the purchase order');
      return;
    }
    try {
      setLoading(true);
      
      // Prepare data for submission
      const orderData = {
        ...formData,
        subtotal,
        totalAmount
      };
      if (isEditMode) {
        await updatePurchaseOrder(id, orderData);
      } else {
        await createPurchaseOrder(orderData);
      }
      navigate('/procurement/purchase-orders');
    } catch (err) {
      setError('Failed to save purchase order');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Updated handler for AI suggestion selection with improved search functionality
  const handleAISuggestion = (suggestion, searchImmediately = false) => {
    // Update state with the new search term
    setSearchTerm(suggestion);
    
    // If searchImmediately is true, trigger the search right away
    if (searchImmediately && selectedSupplier) {
      if (selectedSupplier.isJanAushadhi) {
        // For JanAushadhi suppliers, directly pass the suggestion to the search
        fetchExternalProducts(suggestion);
      }
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
      className="max-w-6xl mx-auto pb-10"
    >
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#16221D]">{isEditMode ? 'Edit Purchase Order' : 'Create New Purchase Order'}</h1>
      </div>
      
      {error && (
        <div className="bg-[#B47134]/10 border border-[#B47134]/20 text-[#B47134] px-4 py-3 rounded-xl mb-6 font-medium">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-[#16221D]/5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Basic Information */}
          <div>
            <h2 className="text-xl font-bold text-[#4D6E60] mb-6 pb-2 border-b border-[#16221D]/5">Order Information</h2>
            
            <div className="mb-5">
              <label className={labelClassName}>Supplier <span className="text-[#B47134]">*</span></label>
              <Dropdown
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
                required
                disabled={isEditMode}
                placeholder="Select a supplier"
                options={suppliers.map(supplier => ({
                  value: supplier._id,
                  label: `${supplier.name} ${supplier.isJanAushadhi ? '(JanAushadhi)' : ''}`
                }))}
              />
            </div>
            
            <div className="mb-5">
              <label className={labelClassName}>Order Date <span className="text-[#B47134]">*</span></label>
              <DatePickerWrapper
                name="orderDate"
                value={formData.orderDate}
                onChange={handleChange}
                required
                className={inputClassName}
              />
            </div>
            
            <div className="mb-5">
              <label className={labelClassName}>Expected Delivery Date</label>
              <DatePickerWrapper
                name="expectedDeliveryDate"
                value={formData.expectedDeliveryDate}
                onChange={handleChange}
                className={inputClassName}
              />
            </div>
          </div>
          
          {/* Additional Details */}
          <div>
            <h2 className="text-xl font-bold text-[#4D6E60] mb-6 pb-2 border-b border-[#16221D]/5">Additional Details</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="mb-5">
                <label className={labelClassName}>Shipping Cost</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#2D3E37]/60 font-medium">₹</span>
                  <input
                    type="number"
                    name="shippingCost"
                    value={formData.shippingCost}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className={`${inputClassName} pl-8`}
                  />
                </div>
              </div>
              
              <div className="mb-5">
                <label className={labelClassName}>Discount Amount</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#2D3E37]/60 font-medium">₹</span>
                  <input
                    type="number"
                    name="discountAmount"
                    value={formData.discountAmount}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className={`${inputClassName} pl-8`}
                  />
                </div>
              </div>
            </div>
            
            <div className="mb-5">
              <label className={labelClassName}>Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                className={`${inputClassName} resize-none`}
              ></textarea>
            </div>
          </div>
        </div>
        
        {/* Product Selection */}
        <div className="mt-8 pt-6 border-t border-[#16221D]/5">
          <h2 className="text-xl font-bold text-[#4D6E60] mb-6">Add Products</h2>
          
          {selectedSupplier && (
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-[#2D3E37]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search for products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`${inputClassName} pl-10`}
                  />
                </div>
                {selectedSupplier.isJanAushadhi && (
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => fetchExternalProducts()}
                    className="px-6 py-2.5 bg-[#B47134] text-white rounded-lg font-semibold hover:bg-[#8C5523] transition-colors whitespace-nowrap shadow-sm"
                  >
                    Search JanAushadhi
                  </motion.button>
                )}
              </div>
              
              {/* Disease Trend Suggestions - only shown for JanAushadhi suppliers */}
              {selectedSupplier.isJanAushadhi && (
                <DiseaseTrendSuggestions 
                  onProductSelect={handleAISuggestion} 
                  isJanAushadhi={true} 
                />
              )}
            </div>
          )}
          
          {/* Product Lists */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Regular Products */}
            {!selectedSupplier?.isJanAushadhi && (
              <div className="border border-[#16221D]/10 bg-[#F5F7F4]/30 rounded-xl p-5 h-[32rem] flex flex-col">
                <h3 className="text-md font-bold text-[#2D3E37] mb-4 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                  Inventory Products
                </h3>
                <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar">
                  {products.length === 0 ? (
                    <div className="h-full flex flex-col justify-center items-center opacity-50">
                      <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                      <p>No products found</p>
                    </div>
                  ) : (
                    <ul className="space-y-3">
                      {products
                        .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map(product => (
                          <motion.li 
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={product._id} 
                            className="bg-white p-4 rounded-xl border border-[#16221D]/5 shadow-sm hover:border-[#4D6E60]/30 transition-colors"
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-bold text-[#16221D]">{product.name}</p>
                                <p className="text-sm text-[#2D3E37]/70 font-medium mt-1">
                                  Stock: {product.stockQuantity} • Price: ₹{product.unitPrice}
                                </p>
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                type="button"
                                onClick={() => handleAddProduct(product)}
                                className="px-4 py-1.5 bg-[#4D6E60]/10 text-[#4D6E60] font-semibold rounded-lg hover:bg-[#4D6E60] hover:text-white transition-colors"
                              >
                                Add
                              </motion.button>
                            </div>
                          </motion.li>
                        ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
            
            {/* JanAushadhi Products */}
            {selectedSupplier?.isJanAushadhi && (
              <div className="border border-[#16221D]/10 bg-[#F5F7F4]/30 rounded-xl p-5 h-[32rem] flex flex-col">
                <h3 className="text-md font-bold text-[#2D3E37] mb-4 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-[#B47134]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                  JanAushadhi Products
                </h3>
                <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar">
                  {loading ? (
                    <div className="h-full flex flex-col justify-center items-center opacity-70">
                      <div className="w-8 h-8 border-4 border-[#4D6E60]/20 border-t-[#4D6E60] rounded-full animate-spin mb-3"></div>
                      <p className="font-medium text-[#2D3E37]">Searching catalogue...</p>
                    </div>
                  ) : externalProducts.length === 0 ? (
                    <div className="h-full flex flex-col justify-center items-center opacity-50">
                      <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                      <p>Use search to find products</p>
                    </div>
                  ) : (
                    <ul className="space-y-3">
                      {externalProducts.map(product => (
                        <motion.li 
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          key={product.productId} 
                          className="bg-white p-4 rounded-xl border border-[#16221D]/5 shadow-sm hover:border-[#4D6E60]/30 transition-colors"
                        >
                          <div className="flex justify-between items-center">
                            <div className="pr-4">
                              <p className="font-bold text-[#16221D] line-clamp-2">{product.genericName}</p>
                              <p className="text-[11px] font-bold tracking-wider uppercase text-[#B47134] mt-1 mb-1">
                                {product.groupName}
                              </p>
                              <p className="text-sm text-[#2D3E37]/80 font-medium">
                                {product.unitSize} • MRP: ₹{product.mrp || 'N/A'}
                              </p>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                              type="button"
                              onClick={() => handleAddProduct(product, true)}
                              className="px-4 py-1.5 bg-[#4D6E60]/10 text-[#4D6E60] font-semibold rounded-lg hover:bg-[#4D6E60] hover:text-white transition-colors whitespace-nowrap flex-shrink-0"
                            >
                              Add
                            </motion.button>
                          </div>
                        </motion.li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
            
            {/* Selected Items */}
            <div className="border-2 border-[#4D6E60]/20 bg-white rounded-xl p-5 h-[32rem] flex flex-col shadow-sm">
              <h3 className="text-md font-bold text-[#4D6E60] mb-4 flex items-center justify-between">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                  Selected Items
                </span>
                <span className="bg-[#4D6E60] text-white text-xs py-0.5 px-2.5 rounded-full">{formData.items.length}</span>
              </h3>
              
              <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar">
                {formData.items.length === 0 ? (
                  <div className="h-full flex flex-col justify-center items-center opacity-40">
                    <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    <p className="font-medium">No items added yet</p>
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {formData.items.map((item, index) => (
                      <motion.li 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={index} 
                        className="bg-[#F5F7F4]/50 p-4 rounded-xl border border-[#16221D]/5"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <p className="font-bold text-[#16221D] line-clamp-2 pr-2">{item.genericName}</p>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="text-red-400 hover:text-red-600 transition-colors p-1"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                          </button>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 items-center">
                          <div className="flex flex-col w-20">
                            <label className="text-[10px] uppercase font-bold text-[#2D3E37]/60 mb-1">Qty</label>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                              min="1"
                              className="w-full p-1.5 border border-[#16221D]/10 rounded-md text-sm font-semibold text-center focus:ring-1 focus:ring-[#4D6E60] focus:border-[#4D6E60] outline-none"
                            />
                          </div>
                          <span className="text-[#2D3E37]/40 font-bold self-end mb-2">×</span>
                          <div className="flex flex-col w-24">
                            <label className="text-[10px] uppercase font-bold text-[#2D3E37]/60 mb-1">Price (₹)</label>
                            <input
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                              min="0"
                              step="0.01"
                              className="w-full p-1.5 border border-[#16221D]/10 rounded-md text-sm font-semibold text-center focus:ring-1 focus:ring-[#4D6E60] focus:border-[#4D6E60] outline-none"
                            />
                          </div>
                          <span className="text-[#2D3E37]/40 font-bold self-end mb-2">=</span>
                          <div className="flex flex-col ml-auto text-right">
                            <label className="text-[10px] uppercase font-bold text-[#2D3E37]/60 mb-1">Total</label>
                            <span className="text-sm font-bold text-[#16221D] mt-1.5">
                              ₹{item.totalPrice ? item.totalPrice.toFixed(2) : '0.00'}
                            </span>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="mt-10 border-t border-[#16221D]/10 pt-8">
          <div className="bg-[#F5F7F4]/50 p-6 rounded-xl border border-[#16221D]/5 max-w-sm ml-auto">
            <h2 className="text-lg font-bold text-[#4D6E60] mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-4 text-sm font-medium text-[#2D3E37]">
              <div className="flex justify-between items-center">
                <span>Subtotal:</span>
                <span>₹{Number(subtotal).toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Shipping Cost:</span>
                <span>₹{Number(parseFloat(formData.shippingCost || 0)).toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center text-[#B47134]">
                <span>Discount:</span>
                <span>-₹{Number(parseFloat(formData.discountAmount || 0)).toFixed(2)}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center border-t border-[#16221D]/10 pt-4">
              <span className="font-bold text-[#16221D] text-lg">Total Amount:</span>
              <span className="font-bold text-2xl text-[#16221D]">₹{Number(totalAmount).toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-[#16221D]/5 flex gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading || formData.items.length === 0}
            className={`px-8 py-3 bg-[#4D6E60] text-white rounded-lg font-bold text-lg hover:bg-[#678E7D] transition-colors flex items-center justify-center ${
              (loading || formData.items.length === 0) ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : isEditMode ? 'Update Order' : 'Create Order'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => navigate('/procurement/purchase-orders')}
            className="px-8 py-3 bg-white border-2 border-[#16221D]/10 text-[#2D3E37] font-bold rounded-lg hover:bg-[#F5F7F4] transition-colors"
          >
            Cancel
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}

export default PurchaseOrderForm;