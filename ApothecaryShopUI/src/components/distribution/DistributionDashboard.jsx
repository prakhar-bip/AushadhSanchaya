import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import DatePickerWrapper from '../common/DatePickerWrapper';
import { Link } from 'react-router-dom';
import { getDistributionReports, exportDistributionsCSV, exportDistributionsPDF } from '../../services/distributionService';

const DistributionDashboard = () => {
  const [reportData, setReportData] = useState({
    statusCounts: [],
    topRecipients: [],
    topProducts: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await getDistributionReports(filters);
      setReportData(data);
    } catch (err) {
      console.error('Error fetching distribution reports:', err);
      setError('Failed to load reports');
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
    fetchReports();
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: ''
    });
    setTimeout(fetchReports, 0);
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

  // Status color mapping for the progress bars
  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-[#B47134]', // Copper
      'processed': 'bg-[#4D6E60]', // Sage
      'shipped': 'bg-[#16221D]', // Dark Forest
      'delivered': 'bg-green-500', 
      'returned': 'bg-red-500',
      'cancelled': 'bg-gray-400'
    };
    return colors[status] || 'bg-[#4D6E60]/50';
  };

  const getDateRangeText = () => {
    if (filters.startDate && filters.endDate) {
      return `${new Date(filters.startDate).toLocaleDateString()} to ${new Date(filters.endDate).toLocaleDateString()}`;
    } else if (filters.startDate) {
      return `From ${new Date(filters.startDate).toLocaleDateString()}`;
    } else if (filters.endDate) {
      return `Until ${new Date(filters.endDate).toLocaleDateString()}`;
    }
    return 'All Time';
  };

  const getTotalStatusCount = () => {
    return reportData.statusCounts.reduce((sum, item) => sum + item.count, 0) || 1;
  };

  const ExportIcon = () => (
    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white/80 backdrop-blur-xl border border-[#16221D]/5 rounded-3xl shadow-sm overflow-hidden"
    >
      <div className="px-6 sm:px-8 py-6 border-b border-[#16221D]/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#16221D]">Distribution Analytics</h2>
          <p className="text-sm font-medium text-[#4D6E60] mt-1">Monitor and export distribution orders</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExportCSV}
            className="flex items-center px-4 py-2 bg-white border border-[#4D6E60]/30 text-[#4D6E60] font-bold text-sm rounded-xl hover:bg-[#F5F7F4] transition-all shadow-sm"
          >
            <ExportIcon /> CSV
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExportPDF}
            className="flex items-center px-4 py-2 bg-white border border-[#B47134]/30 text-[#B47134] font-bold text-sm rounded-xl hover:bg-[#B47134]/5 transition-all shadow-sm"
          >
            <ExportIcon /> PDF
          </motion.button>
          <Link to="/distributions">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center px-5 py-2 bg-[#4D6E60] text-white font-bold text-sm rounded-xl hover:bg-[#3A5348] transition-all shadow-sm"
            >
              View All Orders
            </motion.button>
          </Link>
        </div>
      </div>
      
      <div className="p-6 sm:p-8">
        <form onSubmit={applyFilters} className="mb-8 bg-[#F5F7F4]/50 border border-[#16221D]/5 p-5 rounded-2xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div>
              <label className="block text-xs font-bold text-[#2D3E37]/70 uppercase tracking-wider mb-2">
                Start Date
              </label>
              <DatePickerWrapper
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="w-full px-4 py-2.5 border border-[#16221D]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4D6E60]/50 focus:border-[#4D6E60] bg-white font-medium text-[#16221D] transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2D3E37]/70 uppercase tracking-wider mb-2">
                End Date
              </label>
              <DatePickerWrapper
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="w-full px-4 py-2.5 border border-[#16221D]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4D6E60]/50 focus:border-[#4D6E60] bg-white font-medium text-[#16221D] transition-all"
              />
            </div>
            <div className="flex space-x-3">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="px-6 py-2.5 bg-[#16221D] text-white font-bold rounded-xl hover:bg-[#2D3E37] transition-all shadow-sm"
              >
                Apply
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button" 
                onClick={clearFilters}
                className="px-6 py-2.5 bg-white border border-[#16221D]/10 text-[#16221D] font-bold rounded-xl hover:bg-[#F5F7F4] transition-all shadow-sm"
              >
                Clear
              </motion.button>
            </div>
          </div>
        </form>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-10 h-10 border-4 border-[#4D6E60]/20 border-t-[#4D6E60] rounded-full"></motion.div>
          </div>
        ) : error ? (
          <div className="bg-[#B47134]/10 border border-[#B47134]/30 text-[#B47134] px-5 py-4 rounded-xl mb-6 font-medium flex items-center shadow-sm">
            <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {error}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <h3 className="text-xl font-bold text-[#16221D]">
                  Status Summary <span className="font-medium text-sm text-[#4D6E60] ml-2 px-3 py-1 bg-[#4D6E60]/10 rounded-full">{getDateRangeText()}</span>
                </h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-[#F5F7F4]/50 border border-[#16221D]/5 p-6 rounded-2xl">
                  <h4 className="text-xs font-bold text-[#2D3E37]/70 uppercase tracking-wider mb-5">Distribution Breakdown</h4>
                  <div className="space-y-4">
                    {reportData.statusCounts.map((status, index) => {
                      const percentage = Math.round((status.count / getTotalStatusCount()) * 100);
                      return (
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          key={status._id} 
                          className="relative"
                        >
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-sm font-bold text-[#16221D] capitalize">{status._id}</span>
                            <span className="text-sm font-medium text-[#4D6E60]">{status.count} ({percentage}%)</span>
                          </div>
                          <div className="overflow-hidden h-2.5 text-xs flex rounded-full bg-[#16221D]/5">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 1, delay: 0.2 + (index * 0.1) }}
                              className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${getStatusColor(status._id)}`}
                            ></motion.div>
                          </div>
                        </motion.div>
                      );
                    })}
                    
                    {reportData.statusCounts.length === 0 && (
                      <div className="text-center py-8 text-[#2D3E37]/50 font-medium">
                        No distribution data available for this period.
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-xs font-bold text-[#2D3E37]/70 uppercase tracking-wider mb-5">Quick Metrics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {['pending', 'processed', 'shipped', 'delivered'].map((status, i) => {
                      const statusData = reportData.statusCounts.find(s => s._id === status) || { count: 0 };
                      return (
                        <motion.div 
                          whileHover={{ y: -3 }}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                          key={status} 
                          className="bg-white border border-[#16221D]/5 shadow-sm p-5 rounded-2xl flex flex-col items-center justify-center text-center group"
                        >
                          <h6 className="text-xs font-bold text-[#2D3E37]/50 uppercase tracking-wider mb-2">{status}</h6>
                          <p className="text-4xl font-black text-[#16221D] group-hover:text-[#4D6E60] transition-colors">{statusData.count}</p>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <h3 className="text-lg font-bold text-[#16221D]">Top Recipients</h3>
                </div>
                <div className="bg-white border border-[#16221D]/5 shadow-sm rounded-2xl overflow-hidden">
                  {reportData.topRecipients.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-[#16221D]/5">
                        <thead className="bg-[#F5F7F4]">
                          <tr>
                            <th className="px-5 py-4 text-left text-xs font-bold text-[#2D3E37]/70 uppercase tracking-wider">Recipient Name</th>
                            <th className="px-5 py-4 text-right text-xs font-bold text-[#2D3E37]/70 uppercase tracking-wider">Total Orders</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#16221D]/5">
                          {reportData.topRecipients.map((recipient, index) => (
                            <motion.tr 
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              key={index}
                              className="hover:bg-[#F5F7F4]/50 transition-colors"
                            >
                              <td className="px-5 py-4 text-sm font-bold text-[#16221D]">{recipient._id}</td>
                              <td className="px-5 py-4 text-sm font-medium text-[#4D6E60] text-right">{recipient.count}</td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-[#F5F7F4]/30">
                      <p className="text-[#2D3E37]/50 font-medium">No recipient data available.</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <h3 className="text-lg font-bold text-[#16221D]">Most Distributed Products</h3>
                </div>
                <div className="bg-white border border-[#16221D]/5 shadow-sm rounded-2xl overflow-hidden">
                  {reportData.topProducts.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-[#16221D]/5">
                        <thead className="bg-[#F5F7F4]">
                          <tr>
                            <th className="px-5 py-4 text-left text-xs font-bold text-[#2D3E37]/70 uppercase tracking-wider">Product Name</th>
                            <th className="px-5 py-4 text-right text-xs font-bold text-[#2D3E37]/70 uppercase tracking-wider">Total Quantity</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#16221D]/5">
                          {reportData.topProducts.map((product, index) => (
                            <motion.tr 
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              key={index}
                              className="hover:bg-[#F5F7F4]/50 transition-colors"
                            >
                              <td className="px-5 py-4">
                                <div className="font-bold text-[#16221D]">{product.product?.name || 'Unknown Product'}</div>
                                <div className="text-xs font-medium text-[#2D3E37]/60 mt-0.5">{product.product?.code || 'No Code'}</div>
                              </td>
                              <td className="px-5 py-4 text-sm font-black text-[#4D6E60] text-right">{product.totalQuantity}</td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-[#F5F7F4]/30">
                      <p className="text-[#2D3E37]/50 font-medium">No product distribution data available.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default DistributionDashboard;