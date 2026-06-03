import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  getDistributionById,
  updateDistributionStatus,
} from "../../services/distributionService";
import AppLoader from "../AppLoader";

const DistributionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [distribution, setDistribution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchDistribution();
  }, [id]);

  const fetchDistribution = async () => {
    try {
      const data = await getDistributionById(id);
      setDistribution(data);
    } catch (err) {
      console.error("Error fetching distribution details:", err);
      setError("Failed to load distribution details");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    if (
      window.confirm(
        `Are you sure you want to mark this order as ${newStatus}?`
      )
    ) {
      setUpdatingStatus(true);
      try {
        const updatedDistribution = await updateDistributionStatus(
          id,
          newStatus
        );
        setDistribution(updatedDistribution);
      } catch (err) {
        console.error("Error updating status:", err);
        setError("Failed to update status");
      } finally {
        setUpdatingStatus(false);
      }
    }
  };

  const getStatusBadge = (status) => {
    const badgeConfig = {
      pending: "bg-[#B47134]/10 border-[#B47134]/20 text-[#B47134]",
      processed: "bg-[#4D6E60]/10 border-[#4D6E60]/20 text-[#4D6E60]",
      shipped: "bg-[#16221D]/10 border-[#16221D]/20 text-[#16221D]",
      delivered: "bg-green-50 border-green-200 text-green-700",
      returned: "bg-red-50 border-red-200 text-red-700",
      cancelled: "bg-gray-100 border-gray-200 text-gray-700",
    };

    return (
      <span
        className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full border ${
          badgeConfig[status] || "bg-gray-100 border-gray-200 text-gray-700"
        }`}
      >
        {status}
      </span>
    );
  };

  if (loading) return <AppLoader message="Loading details" />;

  if (error) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-[#B47134]/10 border border-[#B47134]/30 p-5 rounded-2xl mb-6 flex items-center shadow-sm">
          <svg className="w-6 h-6 text-[#B47134] mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="text-sm font-bold text-[#B47134]">{error}</span>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => navigate("/distributions")} className="px-5 py-2.5 bg-[#4D6E60] text-white font-bold rounded-xl">
          Back to List
        </motion.button>
      </motion.div>
    );
  }

  if (!distribution) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto px-4 py-8 text-center">
        <div className="bg-[#F5F7F4]/50 border border-[#16221D]/5 rounded-3xl p-12 mb-6">
          <p className="text-[#2D3E37]/60 font-medium text-lg">Distribution order not found</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => navigate("/distributions")} className="px-5 py-2.5 bg-[#4D6E60] text-white font-bold rounded-xl shadow-sm">
          Back to List
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <div className="mb-8">
        <motion.button
          whileHover={{ x: -5 }}
          onClick={() => navigate("/distributions")}
          className="inline-flex items-center px-4 py-2 border border-[#16221D]/10 shadow-sm text-sm font-bold rounded-xl text-[#2D3E37] bg-white hover:bg-[#F5F7F4] hover:text-[#4D6E60] transition-all"
        >
          <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to List
        </motion.button>
      </div>

      <div className="bg-white/80 backdrop-blur-xl shadow-sm border border-[#16221D]/5 rounded-3xl overflow-hidden">
        <div className="px-6 sm:px-8 py-6 border-b border-[#16221D]/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#F5F7F4]/50">
          <div>
            <h2 className="text-2xl font-black text-[#16221D] flex items-center gap-3">
              Order #{distribution.orderNumber}
              {getStatusBadge(distribution.status)}
            </h2>
            <p className="text-sm font-medium text-[#4D6E60] mt-1">Created on {new Date(distribution.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</p>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
            {/* Recipient Details */}
            <motion.div whileHover={{ y: -3 }} className="bg-white border border-[#16221D]/5 shadow-sm rounded-2xl p-6 group">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#4D6E60]/10 flex items-center justify-center text-[#4D6E60]">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h5 className="text-lg font-bold text-[#16221D]">Recipient Details</h5>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-bold text-[#2D3E37]/50 uppercase tracking-wider mb-1">Name</p>
                  <p className="font-bold text-[#16221D]">{distribution.recipient}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#2D3E37]/50 uppercase tracking-wider mb-1">Type</p>
                  <p className="font-medium text-[#4D6E60] capitalize">{distribution.recipientType}</p>
                </div>
              </div>
            </motion.div>

            {/* Shipping Details */}
            <motion.div whileHover={{ y: -3 }} className="bg-white border border-[#16221D]/5 shadow-sm rounded-2xl p-6 group">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#B47134]/10 flex items-center justify-center text-[#B47134]">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h5 className="text-lg font-bold text-[#16221D]">Shipping Info</h5>
              </div>
              {distribution.shippingInfo && Object.values(distribution.shippingInfo).some((v) => v) ? (
                <div className="space-y-3">
                  {distribution.shippingInfo.address && (
                    <div>
                      <p className="text-xs font-bold text-[#2D3E37]/50 uppercase tracking-wider mb-1">Address</p>
                      <p className="font-medium text-[#16221D]">{distribution.shippingInfo.address}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    {distribution.shippingInfo.contactPerson && (
                      <div>
                        <p className="text-xs font-bold text-[#2D3E37]/50 uppercase tracking-wider mb-1">Contact</p>
                        <p className="font-medium text-[#16221D]">{distribution.shippingInfo.contactPerson}</p>
                      </div>
                    )}
                    {distribution.shippingInfo.contactNumber && (
                      <div>
                        <p className="text-xs font-bold text-[#2D3E37]/50 uppercase tracking-wider mb-1">Phone</p>
                        <p className="font-medium text-[#16221D]">{distribution.shippingInfo.contactNumber}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm font-medium text-[#2D3E37]/50 italic mt-2">No shipping details provided</p>
              )}
            </motion.div>

            {/* Status Management */}
            <div className="bg-[#F5F7F4]/50 border border-[#16221D]/5 rounded-2xl p-6">
              <h5 className="text-lg font-bold text-[#16221D] mb-4">Manage Status</h5>
              <div className="flex flex-wrap gap-2">
                {[
                  "pending",
                  "processed",
                  "shipped",
                  "delivered",
                  "returned",
                  "cancelled",
                ].map((status) => (
                  <motion.button
                    whileHover={distribution.status !== status ? { scale: 1.05 } : {}}
                    whileTap={distribution.status !== status ? { scale: 0.95 } : {}}
                    key={status}
                    onClick={() => handleStatusUpdate(status)}
                    disabled={updatingStatus || distribution.status === status}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all 
                    ${
                      distribution.status === status
                        ? "bg-[#16221D]/10 text-[#16221D] cursor-not-allowed shadow-inner"
                        : "bg-white border border-[#16221D]/10 text-[#4D6E60] hover:bg-[#4D6E60] hover:text-white hover:border-transparent shadow-sm"
                    }`}
                  >
                    {status}
                  </motion.button>
                ))}
              </div>
              {updatingStatus && (
                <div className="mt-4 flex items-center text-sm font-bold text-[#B47134]">
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-4 h-4 border-2 border-[#B47134]/30 border-t-[#B47134] rounded-full mr-2"></motion.div>
                  Updating status...
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-5">
              <h5 className="text-xl font-black text-[#16221D]">Order Items</h5>
              <div className="flex-1 h-px bg-[#16221D]/10"></div>
            </div>
            
            <div className="overflow-hidden border border-[#16221D]/5 rounded-2xl shadow-sm">
              <table className="min-w-full divide-y divide-[#16221D]/5 bg-white">
                <thead className="bg-[#F5F7F4]">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#2D3E37]/70 uppercase tracking-wider">Product</th>
                    <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-[#2D3E37]/70 uppercase tracking-wider">Quantity</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#2D3E37]/70 uppercase tracking-wider">Batch Number</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#2D3E37]/70 uppercase tracking-wider">Expiry Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#16221D]/5">
                  {distribution.items.map((item, index) => (
                    <motion.tr 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      key={index} 
                      className="hover:bg-[#F5F7F4]/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-[#16221D]">{item.product?.name || "N/A"}</div>
                        <div className="text-xs font-medium text-[#2D3E37]/60 mt-0.5">{item.product?.code || "No Code"}</div>
                      </td>
                      <td className="px-6 py-4 text-center text-lg font-black text-[#4D6E60]">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-[#16221D]">
                        {item.batchNumber || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-[#16221D]">
                        {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : "N/A"}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DistributionDetail;
