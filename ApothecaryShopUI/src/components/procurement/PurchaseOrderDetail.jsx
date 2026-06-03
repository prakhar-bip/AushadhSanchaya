import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  getPurchaseOrder,
  updatePurchaseOrderStatus,
} from "../../services/purchaseOrderService";
import AppLoader from "../AppLoader";

function PurchaseOrderDetail() {
  const { id } = useParams();
  //const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to format dates without date-fns
  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  useEffect(() => {
    fetchOrderData();
  }, [id]);

  const fetchOrderData = async () => {
    try {
      const data = await getPurchaseOrder(id);
      setOrder(data);
      setError(null);
    } catch (err) {
      setError("Failed to load purchase order details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (
      window.confirm(
        `Are you sure you want to mark this order as ${newStatus.replace(
          "_",
          " "
        )}?`
      )
    ) {
      try {
        await updatePurchaseOrderStatus(id, newStatus);
        fetchOrderData(); // Refresh data
      } catch (err) {
        setError("Failed to update order status");
        console.error(err);
      }
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "draft":
        return "bg-[#16221D]/10 text-[#2D3E37]";
      case "submitted":
        return "bg-[#4D6E60]/10 text-[#4D6E60]";
      case "approved":
        return "bg-[#4D6E60]/20 text-[#2D3E37]";
      case "shipped":
        return "bg-[#B47134]/10 text-[#B47134]";
      case "received":
        return "bg-[#4D6E60] text-white";
      case "partially_received":
        return "bg-[#B47134]/20 text-[#8C5523]";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-[#16221D]/10 text-[#2D3E37]";
    }
  };

  if (loading) {
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
  
  if (!order) {
    return (
      <div className="text-[#2D3E37]/60 text-center py-8 font-medium">
        Purchase order not found
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="max-w-6xl mx-auto"
    >
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-[#16221D]">PO: {order.poNumber}</h1>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold tracking-wide uppercase ${getStatusBadgeClass(
              order.status
            )}`}
          >
            {order.status.replace("_", " ")}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {order.status === "draft" && (
            <>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to={`/procurement/purchase-orders/${id}/edit`}
                  className="px-5 py-2.5 bg-white border border-[#4D6E60] text-[#4D6E60] rounded-xl font-semibold hover:bg-[#F5F7F4] transition-colors inline-block"
                >
                  Edit
                </Link>
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => handleStatusChange("submitted")}
                className="px-5 py-2.5 bg-[#4D6E60] text-white rounded-xl font-semibold hover:bg-[#678E7D] transition-colors"
              >
                Submit for Approval
              </motion.button>
            </>
          )}

          {order.status === "submitted" && (
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => handleStatusChange("approved")}
              className="px-5 py-2.5 bg-[#4D6E60] text-white rounded-xl font-semibold hover:bg-[#678E7D] transition-colors"
            >
              Approve
            </motion.button>
          )}

          {order.status === "approved" && (
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => handleStatusChange("shipped")}
              className="px-5 py-2.5 bg-[#B47134] text-white rounded-xl font-semibold hover:bg-[#8C5523] transition-colors"
            >
              Mark as Shipped
            </motion.button>
          )}

          {order.status === "shipped" && (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                to={`/procurement/receive/${id}`}
                className="px-5 py-2.5 bg-[#4D6E60] text-white rounded-xl font-semibold hover:bg-[#678E7D] transition-colors inline-block"
              >
                Receive Items
              </Link>
            </motion.div>
          )}

          {(order.status === "draft" || order.status === "submitted") && (
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => handleStatusChange("cancelled")}
              className="px-5 py-2.5 bg-white border border-red-500 text-red-500 rounded-xl font-semibold hover:bg-red-50 transition-colors"
            >
              Cancel Order
            </motion.button>
          )}

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              to="/procurement/purchase-orders"
              className="px-5 py-2.5 bg-[#F5F7F4] border border-[#16221D]/10 text-[#2D3E37] rounded-xl font-semibold hover:bg-[#16221D]/5 transition-colors inline-block"
            >
              Back to List
            </Link>
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Order Details */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-[#16221D]/5 p-6 md:p-8">
          <h2 className="text-xl font-bold text-[#4D6E60] mb-6 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Order Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="bg-[#F5F7F4]/50 p-4 rounded-xl border border-[#16221D]/5">
                <p className="text-xs font-bold text-[#2D3E37]/60 uppercase tracking-wider mb-1">Supplier</p>
                <p className="font-bold text-[#16221D] text-lg">
                  {order.supplier?.name || "Unknown Supplier"}
                </p>
                {order.supplier?.contactPerson && (
                  <p className="text-sm text-[#2D3E37] mt-1 flex items-center">
                    <svg className="w-4 h-4 mr-1 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                    {order.supplier.contactPerson}
                  </p>
                )}
                {order.supplier?.phone && (
                  <p className="text-sm text-[#2D3E37] mt-1 flex items-center">
                    <svg className="w-4 h-4 mr-1 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                    {order.supplier.phone}
                  </p>
                )}
              </div>

              <div className="bg-[#F5F7F4]/50 p-4 rounded-xl border border-[#16221D]/5">
                <p className="text-xs font-bold text-[#2D3E37]/60 uppercase tracking-wider mb-1">Created By</p>
                <p className="font-semibold text-[#16221D]">{order.createdBy?.name || "Unknown"}</p>

                {order.approvedBy?.name && (
                  <div className="mt-3 pt-3 border-t border-[#16221D]/5">
                    <p className="text-xs font-bold text-[#2D3E37]/60 uppercase tracking-wider mb-1">Approved By</p>
                    <p className="font-semibold text-[#16221D]">{order.approvedBy.name}</p>
                    <p className="text-xs text-[#2D3E37]/60 mt-0.5">
                      {formatDate(order.approvalDate)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-[#F5F7F4]/50 p-4 rounded-xl border border-[#16221D]/5">
                <p className="text-xs font-bold text-[#2D3E37]/60 uppercase tracking-wider mb-1">Order Date</p>
                <p className="font-semibold text-[#16221D] flex items-center">
                  <svg className="w-4 h-4 mr-1.5 text-[#4D6E60]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  {formatDate(order.orderDate)}
                </p>
              </div>
              
              <div className="bg-[#F5F7F4]/50 p-4 rounded-xl border border-[#16221D]/5">
                <p className="text-xs font-bold text-[#2D3E37]/60 uppercase tracking-wider mb-1">Expected Delivery</p>
                <p className="font-semibold text-[#16221D] flex items-center">
                  <svg className="w-4 h-4 mr-1.5 text-[#B47134]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  {formatDate(order.expectedDeliveryDate)}
                </p>
              </div>

              {order.notes && (
                <div className="bg-[#B47134]/5 p-4 rounded-xl border border-[#B47134]/10">
                  <p className="text-xs font-bold text-[#B47134] uppercase tracking-wider mb-1">Notes</p>
                  <p className="text-sm text-[#2D3E37]">{order.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#16221D]/5 p-6 md:p-8 h-fit">
          <h2 className="text-xl font-bold text-[#4D6E60] mb-6 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Summary
          </h2>

          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm font-medium text-[#2D3E37]">
              <span>Subtotal:</span>
              <span>₹{(order.subtotal || 0).toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center text-sm font-medium text-[#2D3E37]">
              <span>Shipping Cost:</span>
              <span>₹{order.shippingCost ? order.shippingCost.toFixed(2) : "0.00"}</span>
            </div>

            <div className="flex justify-between items-center text-sm font-medium text-[#2D3E37]">
              <span>Tax Amount:</span>
              <span>₹{order.taxAmount ? order.taxAmount.toFixed(2) : "0.00"}</span>
            </div>

            <div className="pt-4 border-t border-[#16221D]/10">
              <div className="flex justify-between items-center text-lg font-bold text-[#16221D]">
                <span>Total:</span>
                <span>₹{(order.totalAmount || 0).toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-6 mt-2">
              <div className="flex justify-between items-center text-sm mb-3">
                <span className="font-medium text-[#2D3E37]">Payment Status:</span>
                <span
                  className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                    order.paymentStatus === "paid"
                      ? "bg-[#4D6E60]/20 text-[#4D6E60]"
                      : order.paymentStatus === "partially_paid"
                      ? "bg-[#B47134]/20 text-[#8C5523]"
                      : "bg-[#16221D]/10 text-[#2D3E37]"
                  }`}
                >
                  {(order.paymentStatus || "pending").replace("_", " ")}
                </span>
              </div>

              {order.invoiceNumber && (
                <div className="flex justify-between items-center text-sm bg-[#F5F7F4]/50 p-3 rounded-lg border border-[#16221D]/5">
                  <span className="font-medium text-[#2D3E37]">Invoice Number:</span>
                  <span className="font-semibold text-[#16221D]">{order.invoiceNumber}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#16221D]/5 overflow-hidden mb-8">
        <div className="p-6 md:p-8 border-b border-[#16221D]/5">
          <h2 className="text-xl font-bold text-[#4D6E60] flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
            Order Items
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#16221D]/5">
            <thead className="bg-[#F5F7F4]/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#2D3E37] uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#2D3E37] uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#2D3E37] uppercase tracking-wider">Unit Price</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#2D3E37] uppercase tracking-wider">Discount</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#2D3E37] uppercase tracking-wider">Tax</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#2D3E37] uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#2D3E37] uppercase tracking-wider">Received</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#16221D]/5">
              {order.items &&
                order.items.map((item, index) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={index} 
                    className="hover:bg-[#F5F7F4]/30 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="font-bold text-[#16221D]">
                          {item?.genericName || "Unknown Product"}
                        </p>
                        {item?.groupName && (
                          <p className="text-xs font-medium text-[#4D6E60] mt-0.5">
                            {item.groupName}
                          </p>
                        )}
                        {item?.unitSize && (
                          <p className="text-xs text-[#2D3E37]/60 mt-0.5">
                            {item.unitSize}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-[#16221D]">
                      {item?.quantity || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[#2D3E37]">
                      ₹{(item?.unitPrice || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[#2D3E37]">
                      {item?.discount ? `${item.discount}%` : "0%"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[#2D3E37]">
                      {item?.tax ? `${item.tax}%` : "0%"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-[#16221D]">
                      ₹{(item?.totalPrice || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="font-medium text-[#2D3E37] mr-2">
                          {item?.receivedQuantity || 0} / {item?.quantity || 0}
                        </span>
                        {item?.receivedQuantity > 0 &&
                          item?.receivedQuantity < item?.quantity && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#B47134]/20 text-[#8C5523]">
                              Partial
                            </span>
                          )}
                        {item?.receivedQuantity >= item?.quantity &&
                          item?.quantity > 0 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#4D6E60]/20 text-[#4D6E60]">
                              Complete
                            </span>
                          )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              {(!order.items || order.items.length === 0) && (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-12 text-center"
                  >
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 text-[#16221D]/20 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                      <p className="text-[#2D3E37]/60 font-medium">No items found in this purchase order</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

export default PurchaseOrderDetail;
