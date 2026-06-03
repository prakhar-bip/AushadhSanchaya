import React, { useState, useEffect } from 'react';
import DatePickerWrapper from '../common/DatePickerWrapper';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { getPurchaseOrder } from '../../services/purchaseOrderService';
import { createPurchaseReceipt } from '../../services/purchaseReceiptService';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function PurchaseReceiptForm() {
  const { id } = useParams(); // Order ID
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [purchaseOrder, setPurchaseOrder] = useState(null);
  
  const [receiptItems, setReceiptItems] = useState([]);
  const [notes, setNotes] = useState('');
  const [qualityCheck, setQualityCheck] = useState({
    passed: true,
    notes: ''
  });
  const [receiptDate, setReceiptDate] = useState(() => {
    const now = new Date('2025-03-14');
    return now.toISOString().split('T')[0];
  });
  
  useEffect(() => {
    fetchPurchaseOrder();
  }, [id]);
  
  const fetchPurchaseOrder = async () => {
    try {
      const data = await getPurchaseOrder(id);
      setPurchaseOrder(data);
      
      // Initialize receipt items from PO items
      const initialItems = (data.items || []).map(item => ({
        product: item.product?._id || null,
        externalProductId: item.externalProductId || null,
        genericName: item.genericName,
        groupName: item.groupName || '',
        unitSize: item.unitSize || '',
        expectedQuantity: item.quantity,
        receivedQuantity: item.receivedQuantity ? item.quantity - item.receivedQuantity : item.quantity,
        batchNumber: '',
        expiryDate: '',
        unitPrice: item.unitPrice,
        comments: ''
      }));
      
      setReceiptItems(initialItems);
    } catch (err) {
      setError('Failed to load purchase order');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...receiptItems];
    updatedItems[index][field] = value;
    
    setReceiptItems(updatedItems);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate inputs
    for (const item of receiptItems) {
      if (!item.batchNumber) {
        setError('Batch number is required for all items');
        return;
      }
      if (!item.expiryDate) {
        setError('Expiry date is required for all items');
        return;
      }
      if (item.receivedQuantity <= 0) {
        setError('Received quantity must be greater than zero');
        return;
      }
      if (item.receivedQuantity > item.expectedQuantity) {
        setError(`Received quantity cannot exceed expected quantity for ${item.genericName}`);
        return;
      }
    }
    
    try {
      setLoading(true);
      
      const receiptData = {
        purchaseOrder: id,
        receiptDate,
        items: receiptItems,
        notes,
        qualityCheck
      };
      
      await createPurchaseReceipt(receiptData);
      navigate('/procurement/purchase-receipts');
    } catch (err) {
      setError('Failed to create receipt: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text(`Purchase Receipt - PO #${purchaseOrder?.poNumber || 'N/A'}`, 14, 22);
    
    // Add receipt info
    doc.setFontSize(12);
    doc.text(`Supplier: ${purchaseOrder?.supplier?.name || 'N/A'}`, 14, 32);
    doc.text(`Order Date: ${purchaseOrder?.orderDate ? new Date(purchaseOrder.orderDate).toLocaleDateString() : 'N/A'}`, 14, 39);
    doc.text(`Receipt Date: ${receiptDate ? new Date(receiptDate).toLocaleDateString() : 'N/A'}`, 14, 46);
    doc.text(`Total Amount: ₹${purchaseOrder?.totalAmount ? purchaseOrder.totalAmount.toFixed(2) : '0.00'}`, 14, 53);
    
    // Create table for items
    const tableColumn = ["Product", "Group", "Unit Size", "Expected Qty", "Received Qty", "Batch #", "Expiry Date", "Comments"];
    const tableRows = [];
    
    receiptItems.forEach(item => {
      const itemData = [
        item.genericName || 'N/A',
        item.groupName || 'N/A',
        item.unitSize || 'N/A',
        item.expectedQuantity || 0,
        item.receivedQuantity || 0,
        item.batchNumber || '',
        item.expiryDate || '',
        item.comments || ''
      ];
      tableRows.push(itemData);
    });
    
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 60,
      theme: 'grid',
      styles: {
        fontSize: 10
      }
    });
    
    let finalY = doc.lastAutoTable.finalY + 10;
    
    // Add quality check info
    doc.text(`Quality Check: ${qualityCheck.passed ? 'Passed' : 'Failed'}`, 14, finalY);
    if (qualityCheck.notes) {
      doc.text(`Quality Notes: ${qualityCheck.notes}`, 14, finalY + 7);
      finalY += 7;
    }
    
    // Add additional notes
    if (notes) {
      doc.text(`Additional Notes:`, 14, finalY + 7);
      doc.text(notes, 14, finalY + 14);
    }
    
    // Save the PDF
    doc.save(`receipt-po-${purchaseOrder?.poNumber || 'N/A'}.pdf`);
  };

  if (loading && !purchaseOrder) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-[#4D6E60]/20 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-[#4D6E60] rounded-full border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-[#B47134] bg-[#B47134]/10 p-4 rounded-xl text-center font-medium border border-[#B47134]/20 mx-4">
        {error}
      </div>
    );
  }
  
  if (!purchaseOrder) {
    return (
      <div className="text-[#2D3E37]/60 text-center py-8 font-medium">
        Purchase order not found
      </div>
    );
  }

  const inputClassName = "w-full p-2.5 bg-white border border-[#16221D]/10 rounded-lg shadow-sm placeholder-[#2D3E37]/30 text-[#16221D] focus:outline-none focus:ring-2 focus:ring-[#4D6E60]/20 focus:border-[#4D6E60] transition-all text-sm font-medium";
  const labelClassName = "block text-[11px] font-bold text-[#2D3E37]/70 uppercase tracking-wider mb-1.5";
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="max-w-6xl mx-auto pb-10"
    >
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#16221D]">Receive Items for PO #{purchaseOrder?.poNumber || 'N/A'}</h1>
      </div>
      
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#16221D]/5 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#F5F7F4]/50 p-4 rounded-xl border border-[#16221D]/5">
            <p className="text-xs font-bold text-[#2D3E37]/60 uppercase tracking-wider mb-1">Supplier</p>
            <p className="font-bold text-[#16221D] text-lg">{purchaseOrder?.supplier?.name || 'N/A'}</p>
          </div>
          <div className="bg-[#F5F7F4]/50 p-4 rounded-xl border border-[#16221D]/5">
            <p className="text-xs font-bold text-[#2D3E37]/60 uppercase tracking-wider mb-1">Order Date</p>
            <p className="font-bold text-[#16221D] flex items-center text-lg">
              <svg className="w-4 h-4 mr-1.5 text-[#4D6E60]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              {purchaseOrder?.orderDate ? new Date(purchaseOrder.orderDate).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <div className="bg-[#F5F7F4]/50 p-4 rounded-xl border border-[#16221D]/5">
            <p className="text-xs font-bold text-[#2D3E37]/60 uppercase tracking-wider mb-1">Total Amount</p>
            <p className="font-bold text-[#4D6E60] text-lg">₹{purchaseOrder?.totalAmount ? purchaseOrder.totalAmount.toFixed(2) : '0.00'}</p>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-[#16221D]/5">
        <div className="mb-8 p-6 bg-[#F5F7F4]/30 rounded-xl border border-[#16221D]/5 flex items-center gap-6">
          <div className="flex-1 max-w-sm">
            <label className={labelClassName}>Receipt Date <span className="text-[#B47134]">*</span></label>
            <DatePickerWrapper
              value={receiptDate}
              onChange={(e) => setReceiptDate(e.target.value)}
              required
              className={inputClassName}
            />
          </div>
        </div>
        
        <h2 className="text-xl font-bold text-[#4D6E60] mb-6 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
          Items to Receive
        </h2>
        
        <div className="overflow-x-auto custom-scrollbar border border-[#16221D]/5 rounded-xl mb-10">
          <table className="min-w-full divide-y divide-[#16221D]/5">
            <thead className="bg-[#F5F7F4]/50">
              <tr>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-[#2D3E37] uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-[#2D3E37] uppercase tracking-wider">Expected Qty</th>
                <th className="px-4 py-4 text-left text-[11px] font-bold text-[#4D6E60] uppercase tracking-wider">Received Qty *</th>
                <th className="px-4 py-4 text-left text-[11px] font-bold text-[#4D6E60] uppercase tracking-wider">Batch # *</th>
                <th className="px-4 py-4 text-left text-[11px] font-bold text-[#4D6E60] uppercase tracking-wider">Expiry Date *</th>
                <th className="px-4 py-4 text-left text-[11px] font-bold text-[#2D3E37] uppercase tracking-wider">Comments</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#16221D]/5">
              {receiptItems.map((item, index) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={index}
                  className="hover:bg-[#F5F7F4]/20 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="font-bold text-[#16221D]">{item.genericName}</p>
                      {item.groupName && (
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#B47134] mt-0.5">{item.groupName}</p>
                      )}
                      {item.unitSize && (
                        <p className="text-[11px] font-semibold text-[#2D3E37]/60 mt-0.5">{item.unitSize}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-bold text-[#2D3E37]/60 bg-[#F5F7F4] px-3 py-1.5 rounded-lg">{item.expectedQuantity}</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      value={item.receivedQuantity}
                      onChange={(e) => handleItemChange(index, 'receivedQuantity', parseInt(e.target.value) || 0)}
                      min="0"
                      max={item.expectedQuantity}
                      required
                      className="w-24 p-2 bg-[#F5F7F4]/50 border border-[#4D6E60]/20 rounded-lg shadow-sm text-center font-bold text-[#16221D] focus:outline-none focus:ring-2 focus:ring-[#4D6E60]/20 focus:border-[#4D6E60] transition-all"
                    />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <input
                      type="text"
                      value={item.batchNumber}
                      onChange={(e) => handleItemChange(index, 'batchNumber', e.target.value)}
                      required
                      placeholder="e.g. B123"
                      className="w-28 p-2 bg-white border border-[#16221D]/10 rounded-lg shadow-sm text-sm font-medium text-[#16221D] placeholder-[#2D3E37]/30 focus:outline-none focus:ring-2 focus:ring-[#4D6E60]/20 focus:border-[#4D6E60] transition-all"
                    />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <DatePickerWrapper
                      value={item.expiryDate}
                      onChange={(e) => handleItemChange(index, 'expiryDate', e.target.value)}
                      required
                      className="w-36 p-2 bg-white border border-[#16221D]/10 rounded-lg shadow-sm text-sm font-medium text-[#16221D] focus:outline-none focus:ring-2 focus:ring-[#4D6E60]/20 focus:border-[#4D6E60] transition-all"
                    />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <input
                      type="text"
                      value={item.comments}
                      onChange={(e) => handleItemChange(index, 'comments', e.target.value)}
                      placeholder="Any issues?"
                      className="w-36 p-2 bg-white border border-[#16221D]/10 rounded-lg shadow-sm text-sm font-medium text-[#16221D] placeholder-[#2D3E37]/30 focus:outline-none focus:ring-2 focus:ring-[#4D6E60]/20 focus:border-[#4D6E60] transition-all"
                    />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div className="bg-[#F5F7F4]/50 p-6 rounded-2xl border border-[#16221D]/5">
            <h2 className="text-xl font-bold text-[#4D6E60] mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Quality Check
            </h2>
            
            <div className="mb-6 flex items-center bg-white p-4 rounded-xl border border-[#16221D]/5 shadow-sm">
              <input
                type="checkbox"
                id="qualityPassed"
                checked={qualityCheck.passed}
                onChange={(e) => setQualityCheck({...qualityCheck, passed: e.target.checked})}
                className="h-5 w-5 text-[#4D6E60] focus:ring-[#4D6E60] border-gray-300 rounded cursor-pointer"
              />
              <label htmlFor="qualityPassed" className="ml-3 block font-bold text-[#16221D] cursor-pointer">
                Products passed quality check
              </label>
            </div>
            
            <div>
              <label className={labelClassName}>Quality Check Notes</label>
              <textarea
                value={qualityCheck.notes}
                onChange={(e) => setQualityCheck({...qualityCheck, notes: e.target.value})}
                rows="3"
                className={`${inputClassName} resize-none`}
                placeholder="Enter any quality issues here..."
              ></textarea>
            </div>
          </div>
          
          <div className="bg-[#F5F7F4]/50 p-6 rounded-2xl border border-[#16221D]/5">
            <h2 className="text-xl font-bold text-[#4D6E60] mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
              Additional Notes
            </h2>
            <div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows="6"
                className={`${inputClassName} resize-none`}
                placeholder="Enter any additional notes about this receipt..."
              ></textarea>
            </div>
          </div>
        </div>
        
        <div className="pt-6 border-t border-[#16221D]/10 flex flex-wrap gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className={`px-8 py-3 bg-[#4D6E60] text-white rounded-lg font-bold text-lg hover:bg-[#678E7D] transition-colors flex items-center justify-center ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : 'Complete Receipt'}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            type="button"
            onClick={generatePDF}
            className="px-6 py-3 bg-[#B47134] text-white rounded-lg font-bold text-lg hover:bg-[#8C5523] transition-colors"
          >
            Download as PDF
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => navigate('/procurement/purchase-orders')}
            className="px-6 py-3 bg-white border-2 border-[#16221D]/10 text-[#2D3E37] font-bold rounded-lg hover:bg-[#F5F7F4] transition-colors"
          >
            Cancel
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}

export default PurchaseReceiptForm;