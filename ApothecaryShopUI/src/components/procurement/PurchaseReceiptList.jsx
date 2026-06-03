import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { motion } from "motion/react";
import { getPurchaseReceipts } from "../../services/purchaseReceiptService";
import AppLoader from "../AppLoader";

function PurchaseReceiptList() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const data = await getPurchaseReceipts();
      setReceipts(data);
      setError(null);
    } catch (err) {
      setError("Failed to load purchase receipts");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "complete":
        return "bg-[#4D6E60]/20 text-[#4D6E60]";
      case "partial":
        return "bg-[#B47134]/20 text-[#8C5523]";
      case "pending":
      default:
        return "bg-[#16221D]/10 text-[#2D3E37]";
    }
  };

  const getQualityBadgeClass = (passed) => {
    return passed 
      ? "bg-[#4D6E60]/20 text-[#4D6E60]"
      : "bg-red-100 text-red-800";
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-[#4D6E60]/20 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-[#4D6E60] rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="text-[#2D3E37] font-medium animate-pulse">Loading receipts...</p>
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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#4D6E60]/10 rounded-xl text-[#4D6E60]">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          </div>
          <h1 className="text-3xl font-bold text-[#16221D]">Purchase Receipts</h1>
        </div>
      </div>

      {receipts.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-[#16221D]/5 p-16 flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 bg-[#F5F7F4] rounded-full flex items-center justify-center mb-6">
            <svg className="w-12 h-12 text-[#2D3E37]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          </div>
          <h3 className="text-xl font-bold text-[#16221D] mb-2">No Receipts Found</h3>
          <p className="text-[#2D3E37]/70 max-w-md">There are currently no purchase receipts. They will appear here once an order has been received.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-[#16221D]/5 overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="min-w-full divide-y divide-[#16221D]/5">
              <thead className="bg-[#F5F7F4]/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#2D3E37] uppercase tracking-wider">Receipt #</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#2D3E37] uppercase tracking-wider">PO Number</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#2D3E37] uppercase tracking-wider">Receipt Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#2D3E37] uppercase tracking-wider">Received By</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#2D3E37] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#2D3E37] uppercase tracking-wider">Quality Check</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#2D3E37] uppercase tracking-wider">Items</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-[#2D3E37] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#16221D]/5 bg-white">
                {receipts.map((receipt, index) => (
                  <motion.tr 
                    key={receipt._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-[#F5F7F4]/30 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-bold text-[#16221D]">{receipt.receiptNumber}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/procurement/purchase-orders/${receipt.purchaseOrder?._id}`}
                        className="font-semibold text-[#4D6E60] hover:text-[#678E7D] transition-colors"
                      >
                        {receipt.purchaseOrder?.poNumber || "N/A"}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#2D3E37]">
                      {format(new Date(receipt.receiptDate), "MMM dd, yyyy")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#2D3E37]">
                      {receipt.receivedBy?.name || "Unknown"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${getStatusBadgeClass(receipt.status)}`}
                      >
                        {receipt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${getQualityBadgeClass(receipt.qualityCheck?.passed)}`}
                      >
                        {receipt.qualityCheck?.passed ? "Passed" : "Failed"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#2D3E37]">
                      {receipt.items?.length || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
                        <Link
                          to={`/procurement/purchase-receipts/${receipt._id}`}
                          className="px-4 py-2 bg-[#F5F7F4] border border-[#16221D]/10 text-[#4D6E60] font-semibold rounded-lg hover:bg-[#4D6E60] hover:text-white hover:border-[#4D6E60] transition-colors"
                        >
                          View Details
                        </Link>
                      </motion.div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default PurchaseReceiptList;
