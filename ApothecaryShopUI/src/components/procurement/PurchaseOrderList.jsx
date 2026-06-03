import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { motion } from "motion/react";
import {
  getPurchaseOrders,
  updatePurchaseOrderStatus,
} from "../../services/purchaseOrderService";
import { getCurrentUser } from "../../services/authService";
import { AuthContext } from "../../context/AuthContext.jsx";
import AppLoader from "../AppLoader.jsx";

function PurchaseOrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "error",
  });
  const [userRole, setUserRole] = useState("");

  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchOrders();
    fetchUserRole();
  }, []);

  // Fetch user role from AuthContext or authService
  const fetchUserRole = () => {
    // First try to get from context
    if (user && user.role) {
      setUserRole(user.role);
    } else {
      // Fallback to authService if not available in context
      const user = getCurrentUser();
      if (user && user.role) {
        setUserRole(user.role);
      }
    }
  };

  // Auto-hide toast after 5 seconds
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ ...toast, show: false });
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message, type = "error") => {
    setToast({ show: true, message, type });
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getPurchaseOrders();
      // Ensure orders is always an array
      setOrders(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError("Failed to load purchase orders");
      console.error(err);
      setOrders([]); // Set orders to empty array in case of error
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updatePurchaseOrderStatus(orderId, newStatus);
      setOrders(
        orders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
      showToast(
        `Order status updated to ${newStatus.replace("_", " ")}`,
        "success"
      );
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to update order status";
      setError(errorMessage);
      showToast(errorMessage);
      console.error(err);
    }
  };

  // Ensure filteredOrders is always an array
  const filteredOrders = Array.isArray(orders)
    ? filter === "all"
      ? orders
      : orders.filter((order) => order.status === filter)
    : [];

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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="w-full">
      {/* Custom Toast Notification */}
      {toast.show && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg transition-all border 
            ${
              toast.type === "error"
                ? "bg-red-50 text-red-800 border-red-200"
                : "bg-[#F5F7F4] text-[#2D3E37] border-[#4D6E60]/20"
            }`}
          style={{ animation: "slideIn 0.3s ease-out" }}
        >
          <div className="flex items-center">
            {toast.type === "error" ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-[#4D6E60]" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
            <p className="font-medium">{toast.message}</p>
            <button
              onClick={() => setToast({ ...toast, show: false })}
              className={`ml-6 focus:outline-none ${toast.type === 'error' ? 'text-red-400 hover:text-red-600' : 'text-[#2D3E37]/40 hover:text-[#2D3E37]'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 011.414 1.414L11.414 10l4.293 4.293a1 1 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 01-1.414-1.414L8.586 10 4.293 5.707a1 1 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-[#16221D]">Purchase Orders</h1>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Link
            to="/procurement/purchase-orders/new"
            className="bg-[#4D6E60] hover:bg-[#678E7D] text-white font-semibold py-2.5 px-5 rounded-xl shadow-sm transition-colors inline-flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Create New Order
          </Link>
        </motion.div>
      </div>

      <div className="mb-6 overflow-x-auto hide-scrollbar">
        <div className="flex space-x-2 bg-white p-1.5 rounded-xl shadow-sm border border-[#16221D]/5 inline-flex">
          {["all", "draft", "submitted", "approved", "shipped", "received"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
                filter === f
                  ? "bg-[#F5F7F4] text-[#4D6E60] shadow-sm"
                  : "text-[#2D3E37]/60 hover:text-[#16221D] hover:bg-[#F5F7F4]/50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="flex flex-col justify-center items-center h-64 bg-white rounded-2xl border border-[#16221D]/5 shadow-sm p-8 text-center">
          <motion.svg 
            animate={{ scale: [1, 1.05, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="w-20 h-20 text-[#4D6E60]/20 mb-6" 
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </motion.svg>
          <h3 className="text-lg font-semibold text-[#16221D] mb-2">No Purchase Orders Found</h3>
          <p className="text-[#2D3E37]/60 max-w-md">There are no orders matching your current filter. Change the filter or create a new order.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-[#16221D]/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#16221D]/5">
              <thead className="bg-[#F5F7F4]/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#2D3E37] uppercase tracking-wider">PO Number</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#2D3E37] uppercase tracking-wider">Supplier</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#2D3E37] uppercase tracking-wider">Order Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#2D3E37] uppercase tracking-wider">Total Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#2D3E37] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-[#2D3E37] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <motion.tbody 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="divide-y divide-[#16221D]/5 bg-white"
              >
                {filteredOrders.map((order) => (
                  <motion.tr 
                    variants={itemVariants}
                    key={order._id}
                    className="hover:bg-[#F5F7F4]/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/procurement/purchase-orders/${order._id}`}
                        className="text-[#4D6E60] hover:text-[#678E7D] font-bold transition-colors"
                      >
                        {order.poNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-[#16221D]">
                      {order.supplier?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2D3E37]">
                      {format(new Date(order.orderDate), "MMM dd, yyyy")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#16221D]">
                      ₹{order.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${getStatusBadgeClass(
                          order.status
                        )}`}
                      >
                        {order.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                      <Link
                        to={`/procurement/purchase-orders/${order._id}`}
                        className="text-[#4D6E60] hover:text-[#678E7D] transition-colors"
                      >
                        View
                      </Link>

                      {order.status === "draft" && (
                        <>
                          <Link
                            to={`/procurement/purchase-orders/${order._id}/edit`}
                            className="text-[#16221D] hover:text-[#2D3E37] transition-colors"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleStatusChange(order._id, "submitted")}
                            className="text-[#4D6E60] hover:text-[#678E7D] transition-colors focus:outline-none"
                          >
                            Submit
                          </button>
                        </>
                      )}

                      {order.status === "submitted" && userRole === "admin" && (
                        <button
                          onClick={() => handleStatusChange(order._id, "approved")}
                          className="text-[#4D6E60] hover:text-[#678E7D] transition-colors focus:outline-none"
                        >
                          Approve
                        </button>
                      )}

                      {order.status === "approved" && (
                        <button
                          onClick={() => handleStatusChange(order._id, "shipped")}
                          className="text-[#B47134] hover:text-[#8C5523] transition-colors focus:outline-none"
                        >
                          Mark Shipped
                        </button>
                      )}

                      {order.status === "shipped" && (
                        <Link
                          to={`/procurement/receive/${order._id}`}
                          className="text-[#4D6E60] hover:text-[#678E7D] transition-colors font-bold"
                        >
                          Receive
                        </Link>
                      )}

                      {(order.status === "draft" || order.status === "submitted") && (
                        <button
                          onClick={() => handleStatusChange(order._id, "cancelled")}
                          className="text-red-500 hover:text-red-700 transition-colors focus:outline-none ml-2"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default PurchaseOrderList;
