import React, { useState, useEffect } from 'react';
import DatePickerWrapper from '../common/DatePickerWrapper';
import { Link } from 'react-router-dom';
import { getDistributions, deleteDistribution, exportDistributionsCSV, exportDistributionsPDF } from '../../services/distributionService';
import Dropdown from '../Dropdown';
import { motion, AnimatePresence } from 'motion/react';
import aiGif from "../../assets/ai.gif";

const DistributionList = () => {
  const [distributions, setDistributions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    recipient: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchDistributions();
  }, []);

  const fetchDistributions = async () => {
    setLoading(true);
    try {
      const data = await getDistributions(filters);
      setDistributions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching distributions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = (e) => {
    e.preventDefault();
    fetchDistributions();
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      recipient: '',
      startDate: '',
      endDate: ''
    });
    setTimeout(fetchDistributions, 0);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this distribution order?')) {
      try {
        await deleteDistribution(id);
        setDistributions(prevDistributions => 
          prevDistributions.filter(dist => dist._id !== id)
        );
      } catch (error) {
        console.error('Error deleting distribution:', error);
      }
    }
  };

  const handleExportCSV = async () => {
    try {
      await exportDistributionsCSV(filters);
    } catch (error) {
      console.error('Error exporting CSV:', error);
    }
  };

  const handleExportPDF = async () => {
    try {
      await exportDistributionsPDF(filters);
    } catch (error) {
      console.error('Error exporting PDF:', error);
    }
  };

  const getStatusBadge = (status) => {
    const badgeColors = {
      'pending': 'bg-[#B47134]/10 text-[#B47134] border border-[#B47134]/20',
      'processed': 'bg-[#0E7490]/10 text-[#0E7490] border border-[#0E7490]/20',
      'shipped': 'bg-[#0E7490]/10 text-[#0E7490] border border-[#0E7490]/20',
      'delivered': 'bg-[#4D6E60]/10 text-[#4D6E60] border border-[#4D6E60]/20',
      'returned': 'bg-red-50 text-red-700 border border-red-200',
      'cancelled': 'bg-gray-100 text-gray-800 border border-gray-200'
    };
    
    return (
      <span className={`px-2.5 py-0.5 text-2xs font-semibold uppercase tracking-wider rounded-full ${badgeColors[status] || 'bg-gray-50 text-gray-600 border border-gray-200'}`}>
        {status}
      </span>
    );
  };

  // Metrics calculations
  const totalOrders = distributions.length;
  const pendingOrders = distributions.filter(d => d.status === 'pending').length;
  const inTransitOrders = distributions.filter(d => ['processed', 'shipped'].includes(d.status)).length;
  const deliveredOrders = distributions.filter(d => d.status === 'delivered').length;

  // Motion variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 16 } }
  };

  return (
    <div className="min-h-screen w-full bg-[#F5F7F4] overflow-x-hidden font-sans text-[#16221D] py-8 px-4 sm:px-6 lg:px-8">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto w-full"
      >
        {/* Header Section */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-[#16221D]/5 pb-6"
        >
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold font-serif text-[#16221D] tracking-tight">
                Distribution Logistics
              </h1>
              {/* Continuous animated GIF AI badge */}
              <div className="flex items-center space-x-2 bg-white px-2.5 py-1 rounded-lg border border-[#4D6E60]/15 shadow-sm text-xs font-semibold text-[#4D6E60]">
                <img src={aiGif} alt="AI" className="w-5 h-5 rounded-full object-cover shadow-inner" />
                <span className="animate-pulse-slow">FEFO Dispatch Active</span>
              </div>
            </div>
            <p className="text-[#2D3E37]/80 mt-1 text-sm">
              Manage outgoing ledger transfers, batch-routing logs, and secure medical distribution chains.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExportCSV}
              className="inline-flex items-center px-4 py-2 border border-[#16221D]/10 text-xs font-semibold rounded-lg shadow-sm text-[#16221D] bg-white hover:bg-[#E9ECE8] transition-all duration-300 focus:outline-none"
            >
              Export CSV
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExportPDF}
              className="inline-flex items-center px-4 py-2 border border-[#16221D]/10 text-xs font-semibold rounded-lg shadow-sm text-[#16221D] bg-white hover:bg-[#E9ECE8] transition-all duration-300 focus:outline-none"
            >
              Export PDF
            </motion.button>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link to="/distributions/new">
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-xs font-semibold rounded-lg shadow-sm text-[#F5F7F4] bg-[#4D6E60] hover:bg-[#678E7D] transition-all duration-300 focus:outline-none">
                  New Distribution
                </button>
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* 4 Stats Cards */}
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 w-full"
        >
          {/* Card 1: Total Orders */}
          <div className="bg-white rounded-xl p-5 border border-[#16221D]/5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[#2D3E37]/75 text-2xs font-semibold uppercase tracking-wider">Total Shipments</p>
              <p className="text-2xl font-bold font-serif text-[#16221D] mt-1">{totalOrders}</p>
            </div>
            {/* Spinning hexagon molecular path */}
            <svg className="w-8 h-8 text-[#4D6E60] animate-spin-slow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5" />
              <circle cx="12" cy="12" r="3" fill="#4D6E60" />
            </svg>
          </div>

          {/* Card 2: Pending Orders */}
          <div className="bg-white rounded-xl p-5 border border-[#16221D]/5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[#2D3E37]/75 text-2xs font-semibold uppercase tracking-wider">Pending Orders</p>
              <p className={`text-2xl font-bold font-serif mt-1 ${pendingOrders > 0 ? "text-[#B47134]" : "text-[#16221D]"}`}>{pendingOrders}</p>
            </div>
            {/* Pulsing warning SVG */}
            <svg className="w-8 h-8 text-[#B47134] icon-dot-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="9" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <circle cx="12" cy="16" r="0.5" fill="currentColor" />
            </svg>
          </div>

          {/* Card 3: Out for Delivery (Shipped/Processed) */}
          <div className="bg-white rounded-xl p-5 border border-[#16221D]/5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[#2D3E37]/75 text-2xs font-semibold uppercase tracking-wider">In Transit</p>
              <p className={`text-2xl font-bold font-serif mt-1 ${inTransitOrders > 0 ? "text-[#0E7490]" : "text-[#16221D]"}`}>{inTransitOrders}</p>
            </div>
            {/* Truck transition outline SVG */}
            <svg className="w-8 h-8 text-[#0E7490] animate-pulse-slow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="3" width="15" height="13" />
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
          </div>

          {/* Card 4: Delivered */}
          <div className="bg-white rounded-xl p-5 border border-[#16221D]/5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[#2D3E37]/75 text-2xs font-semibold uppercase tracking-wider">Delivered</p>
              <p className="text-2xl font-bold font-serif text-[#16221D] mt-1">{deliveredOrders}</p>
            </div>
            {/* Checkmark badge */}
            <svg className="w-8 h-8 text-[#4D6E60]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
        </motion.div>

        {/* Filters Section */}
        <motion.div 
          variants={itemVariants}
          className="bg-white rounded-xl border border-[#16221D]/5 shadow-sm p-5 mb-8"
        >
          <form onSubmit={applyFilters}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-[#2D3E37]/80 text-2xs font-bold uppercase tracking-wider mb-1.5">
                  Order Status
                </label>
                <Dropdown
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  placeholder="All Statuses"
                  options={[
                    { value: "", label: "All Statuses" },
                    { value: "pending", label: "Pending" },
                    { value: "processed", label: "Processed" },
                    { value: "shipped", label: "Shipped" },
                    { value: "delivered", label: "Delivered" },
                    { value: "returned", label: "Returned" },
                    { value: "cancelled", label: "Cancelled" }
                  ]}
                />
              </div>
              <div>
                <label className="block text-[#2D3E37]/80 text-2xs font-bold uppercase tracking-wider mb-1.5">
                  Recipient
                </label>
                <input
                  type="text"
                  name="recipient"
                  value={filters.recipient}
                  onChange={handleFilterChange}
                  placeholder="Search by recipient..."
                  className="w-full px-3 py-1.5 border border-[#16221D]/10 rounded-lg text-xs bg-white text-[#16221D] placeholder-[#2D3E37]/45 focus:outline-none focus:ring-1 focus:ring-[#4D6E60] focus:border-[#4D6E60] transition-all"
                />
              </div>
              <div>
                <label className="block text-[#2D3E37]/80 text-2xs font-bold uppercase tracking-wider mb-1.5">
                  Start Date
                </label>
                <DatePickerWrapper
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-1.5 border border-[#16221D]/10 rounded-lg text-xs bg-white text-[#16221D] focus:outline-none focus:ring-1 focus:ring-[#4D6E60] focus:border-[#4D6E60] transition-all"
                />
              </div>
              <div>
                <label className="block text-[#2D3E37]/80 text-2xs font-bold uppercase tracking-wider mb-1.5">
                  End Date
                </label>
                <DatePickerWrapper
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-1.5 border border-[#16221D]/10 rounded-lg text-xs bg-white text-[#16221D] focus:outline-none focus:ring-1 focus:ring-[#4D6E60] focus:border-[#4D6E60] transition-all"
                />
              </div>
            </div>
            <div className="flex justify-end mt-4 space-x-3 border-t border-[#16221D]/5 pt-4">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button" 
                onClick={clearFilters}
                className="px-4 py-1.5 border border-[#16221D]/10 hover:bg-[#E9ECE8] text-[#16221D] rounded-lg text-xs font-semibold transition-all duration-300 focus:outline-none"
              >
                Clear Filters
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="px-4 py-1.5 bg-[#4D6E60] hover:bg-[#678E7D] text-[#F5F7F4] rounded-lg text-xs font-semibold transition-all duration-300 focus:outline-none"
              >
                Apply Filters
              </motion.button>
            </div>
          </form>
        </motion.div>

        {/* Distributions Table */}
        <motion.div variants={itemVariants}>
          {loading ? (
            <div className="bg-white rounded-xl border border-[#16221D]/5 p-12 text-center w-full shadow-sm">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#4D6E60] mx-auto mb-4"></div>
              <p className="text-[#2D3E37]/65 text-xs">Loading ledger dispatch distributions...</p>
            </div>
          ) : distributions.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#16221D]/5 p-8 text-center w-full shadow-sm">
              <p className="text-[#2D3E37]/65 text-xs">No distribution records found matching filters.</p>
            </div>
          ) : (
            <div className="bg-white border border-[#16221D]/5 shadow-sm rounded-xl w-full overflow-hidden">
              <div className="overflow-x-auto w-full">
                <table className="w-full min-w-[800px] table-fixed divide-y divide-[#16221D]/5">
                  <thead className="bg-[#F5F7F4]">
                    <tr>
                      <th scope="col" className="w-[12%] px-6 py-3 text-left text-xs font-semibold text-[#2D3E37] uppercase tracking-wider">
                        Order #
                      </th>
                      <th scope="col" className="w-[15%] px-6 py-3 text-left text-xs font-semibold text-[#2D3E37] uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="w-[28%] px-6 py-3 text-left text-xs font-semibold text-[#2D3E37] uppercase tracking-wider">
                        Recipient
                      </th>
                      <th scope="col" className="w-[15%] px-6 py-3 text-left text-xs font-semibold text-[#2D3E37] uppercase tracking-wider">
                        Type
                      </th>
                      <th scope="col" className="w-[12%] px-6 py-3 text-left text-xs font-semibold text-[#2D3E37] uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="w-[10%] px-6 py-3 text-left text-xs font-semibold text-[#2D3E37] uppercase tracking-wider">
                        Items
                      </th>
                      <th scope="col" className="w-[8%] px-6 py-3 text-left text-xs font-semibold text-[#2D3E37] uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-[#16221D]/5">
                    {distributions.map((dist) => (
                      <tr key={dist._id} className="hover:bg-[#F5F7F4]/40 transition-colors">
                        <td className="px-6 py-3.5 text-xs font-semibold text-[#16221D] truncate">
                          {dist.orderNumber}
                        </td>
                        <td className="px-6 py-3.5 text-xs text-[#2D3E37]/80">
                          {new Date(dist.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-3.5 text-sm font-semibold text-[#0E7490] hover:text-[#164E63] truncate">
                          <Link to={`/distributions/${dist._id}`} className="hover:underline">
                            {dist.recipient}
                          </Link>
                        </td>
                        <td className="px-6 py-3.5 text-xs uppercase tracking-wider text-[#2D3E37]/80">
                          {dist.recipientType}
                        </td>
                        <td className="px-6 py-3.5">
                          {getStatusBadge(dist.status)}
                        </td>
                        <td className="px-6 py-3.5 text-xs text-[#2D3E37]/80 font-medium">
                          {dist.items?.length || 0} items
                        </td>
                        <td className="px-6 py-3.5 text-xs font-medium space-x-2">
                          <Link 
                            to={`/distributions/${dist._id}`}
                            className="text-[#4D6E60] hover:text-[#678E7D] hover:underline focus:outline-none font-semibold text-xs transition-all duration-200"
                          >
                            View
                          </Link>
                          {dist.status === 'pending' && (
                            <button 
                              onClick={() => handleDelete(dist._id)}
                              className="text-red-600 hover:text-red-800 hover:underline focus:outline-none font-semibold text-xs transition-all duration-200"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default DistributionList;