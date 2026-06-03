import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getAllUsers, createUser, updateUser, deleteUser, getUserStats } from '../services/userService';
import { useNavigate } from 'react-router-dom';
import { ROLES, ROLE_LABELS, getRoleOptions } from '../utils/roles';
import Dropdown from '../components/Dropdown';
import { motion, AnimatePresence } from 'motion/react';

const containerVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24, staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 10, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 300, damping: 24 }
  }
};

const UserManagement = () => {
  const { user: contextUser, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Fallback to localStorage if context user is null/undefined
  const user = React.useMemo(() => {
    if (contextUser) return contextUser;
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  }, [contextUser]);
  
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  // Pagination and filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: ROLES.DISTRIBUTION_STAFF
  });

  // Redirect non-admin users
  useEffect(() => {
    if (!authLoading && user?.role !== 'admin') {
      console.log('UserManagement: Not admin, redirecting to dashboard');
      navigate('/dashboard');
    }
  }, [user, navigate, authLoading]);

  // Fetch users and stats
  useEffect(() => {
    const fetchData = async () => {
      if (!authLoading && user?.role === 'admin') {
        fetchUsers();
        fetchStats();
      }
    };
    fetchData();
  }, [page, roleFilter, user, authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers({
        page,
        limit: 10,
        role: roleFilter,
        search: search
      });
      setUsers(response.data);
      setTotalPages(response.pagination.pages);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await getUserStats();
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: ROLES.DISTRIBUTION_STAFF
    });
    setShowModal(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        // Update user
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password; // Don't send empty password
        }
        await updateUser(editingUser._id, updateData);
        setSuccessMessage('User updated successfully!');
      } else {
        // Create new user
        await createUser(formData);
        setSuccessMessage('User created successfully!');
      }
      setShowModal(false);
      fetchUsers();
      fetchStats();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(userId);
        setSuccessMessage('User deleted successfully!');
        fetchUsers();
        fetchStats();
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (err) {
        setError(err.message || 'Failed to delete user');
      }
    }
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F5F7F4] flex flex-col items-center justify-center space-y-4">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-[#4D6E60]/20 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-[#4D6E60] rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="text-[#2D3E37] font-medium animate-pulse">Loading secure environment...</p>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="min-h-screen bg-[#F5F7F4] p-4 sm:p-6 lg:p-8 font-sans text-[#16221D]"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-[#16221D]/5 p-6 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#16221D] mb-2 tracking-tight">User Management</h1>
          <p className="text-[#2D3E37]/80 text-sm">Manage user accounts and permissions</p>
        </motion.div>

        {/* Success/Error Messages */}
        <AnimatePresence>
          {successMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
              className="bg-[#4D6E60]/10 border border-[#4D6E60]/20 text-[#4D6E60] p-4 mb-6 rounded-xl text-sm font-medium"
            >
              {successMessage}
            </motion.div>
          )}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 p-4 mb-6 rounded-xl text-sm font-medium"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Statistics */}
        {stats && (
          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
            <motion.div whileHover={{ y: -4 }} className="bg-white rounded-xl shadow-sm border border-[#16221D]/5 p-4 flex flex-col transition-all cursor-pointer">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-[#2D3E37]/70 text-xs font-semibold uppercase tracking-wider">Total Users</h3>
                <svg className="w-5 h-5 text-[#4D6E60] animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              </div>
              <p className="text-2xl font-bold text-[#16221D]">{stats.total}</p>
            </motion.div>
            <motion.div whileHover={{ y: -4 }} className="bg-white rounded-xl shadow-sm border border-[#16221D]/5 p-4 flex flex-col transition-all cursor-pointer">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-[#2D3E37]/70 text-xs font-semibold uppercase tracking-wider">Admins</h3>
                <svg className="w-5 h-5 text-[#B47134] animate-[spin_4s_linear_infinite]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              </div>
              <p className="text-2xl font-bold text-[#16221D]">{stats.byRole?.admin || 0}</p>
            </motion.div>
            <motion.div whileHover={{ y: -4 }} className="bg-white rounded-xl shadow-sm border border-[#16221D]/5 p-4 flex flex-col transition-all cursor-pointer">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-[#2D3E37]/70 text-xs font-semibold uppercase tracking-wider">Inventory Mgr</h3>
                <svg className="w-5 h-5 text-[#8C5523] animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
              </div>
              <p className="text-2xl font-bold text-[#16221D]">{stats.byRole?.inventory_manager || 0}</p>
            </motion.div>
            <motion.div whileHover={{ y: -4 }} className="bg-white rounded-xl shadow-sm border border-[#16221D]/5 p-4 flex flex-col transition-all cursor-pointer">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-[#2D3E37]/70 text-xs font-semibold uppercase tracking-wider">Procurement</h3>
                <svg className="w-5 h-5 text-[#4D6E60] animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              </div>
              <p className="text-2xl font-bold text-[#16221D]">{stats.byRole?.procurement_staff || 0}</p>
            </motion.div>
            <motion.div whileHover={{ y: -4 }} className="bg-white rounded-xl shadow-sm border border-[#16221D]/5 p-4 flex flex-col transition-all cursor-pointer">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-[#2D3E37]/70 text-xs font-semibold uppercase tracking-wider">Distribution</h3>
                <svg className="w-5 h-5 text-[#2D3E37] animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
              </div>
              <p className="text-2xl font-bold text-[#16221D]">{stats.byRole?.distribution_staff || 0}</p>
            </motion.div>
            <motion.div whileHover={{ y: -4 }} className="bg-white rounded-xl shadow-sm border border-[#16221D]/5 p-4 flex flex-col transition-all cursor-pointer">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-[#2D3E37]/70 text-xs font-semibold uppercase tracking-wider">Recent (7d)</h3>
                <svg className="w-5 h-5 text-[#4D6E60] animate-[spin_6s_linear_infinite]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <p className="text-2xl font-bold text-[#16221D]">{stats.recentUsers}</p>
            </motion.div>
          </motion.div>
        )}

        {/* Search and Filters */}
        <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-[#16221D]/5 p-6 mb-6">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2 border border-[#16221D]/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4D6E60] focus:border-[#4D6E60] bg-white text-[#16221D] shadow-sm transition-all text-sm"
            />
            <Dropdown
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              placeholder="All Roles"
              options={[
                { value: "", label: "All Roles" },
                ...getRoleOptions().map(role => ({
                  value: role.value,
                  label: role.label
                }))
              ]}
              className="w-full md:w-48 border-[#16221D]/10 text-sm shadow-sm"
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="px-6 py-2 bg-white border border-[#16221D]/10 text-[#16221D] rounded-lg hover:bg-[#F5F7F4] transition-colors text-sm font-semibold shadow-sm"
            >
              Search
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleCreateUser}
              className="px-6 py-2 bg-[#4D6E60] text-white rounded-lg hover:bg-[#678E7D] transition-colors text-sm font-semibold shadow-sm flex items-center justify-center whitespace-nowrap"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              New User
            </motion.button>
          </form>
        </motion.div>

        {/* Users Table */}
        {/* Users Table */}
        <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-[#16221D]/5 overflow-hidden">
          {loading ? (
            <div className="flex flex-col justify-center items-center h-64 space-y-4">
              <div className="relative w-16 h-16">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-[#4D6E60]/20 rounded-full"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-[#4D6E60] rounded-full border-t-transparent animate-spin"></div>
              </div>
              <p className="text-[#2D3E37] font-medium animate-pulse">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="bg-white p-16 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 bg-[#F5F7F4] rounded-full flex items-center justify-center mb-6">
                <svg className="w-12 h-12 text-[#2D3E37]/40 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-[#16221D] mb-2">No Users Found</h3>
              <p className="text-[#2D3E37]/70 max-w-md">Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[#16221D]/5">
                  <thead className="bg-[#F5F7F4]/50 border-b border-[#16221D]/5">
                    <tr>
                      <th className="px-6 py-3.5 text-left text-xs font-bold text-[#2D3E37] uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3.5 text-left text-xs font-bold text-[#2D3E37] uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3.5 text-left text-xs font-bold text-[#2D3E37] uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3.5 text-left text-xs font-bold text-[#2D3E37] uppercase tracking-wider">Provider</th>
                      <th className="px-6 py-3.5 text-left text-xs font-bold text-[#2D3E37] uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3.5 text-left text-xs font-bold text-[#2D3E37] uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-[#16221D]/5">
                    {users.map((u, index) => (
                      <motion.tr 
                        key={u._id} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-[#F5F7F4]/50 transition-colors group"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <motion.div whileHover={{ scale: 1.1 }} className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-[#4D6E60]/10 flex items-center justify-center border border-[#4D6E60]/20">
                                <span className="text-[#4D6E60] font-bold text-lg">
                                  {u.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </motion.div>
                            <div className="ml-4">
                              <div className="text-sm font-bold text-[#16221D] group-hover:text-[#4D6E60] transition-colors">{u.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-[#2D3E37]">{u.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 inline-flex text-[11px] font-bold uppercase tracking-wider rounded-full border ${
                            u.role === 'admin' 
                              ? 'bg-[#B47134]/10 text-[#8C5523] border-[#B47134]/20' 
                              : u.role === 'inventory_manager'
                              ? 'bg-[#4D6E60]/10 text-[#4D6E60] border-[#4D6E60]/20'
                              : u.role === 'procurement_staff'
                              ? 'bg-[#16221D]/10 text-[#16221D] border-[#16221D]/20'
                              : 'bg-[#2D3E37]/10 text-[#2D3E37] border-[#2D3E37]/20'
                          }`}>
                            {ROLE_LABELS[u.role] || u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#2D3E37]">
                          {u.provider || 'local'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#2D3E37]">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleEditUser(u)}
                            className="text-[#4D6E60] hover:text-[#678E7D] mr-4 transition-colors focus:outline-none inline-flex items-center"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                            Edit
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeleteUser(u._id)}
                            className="text-red-500 hover:text-red-700 transition-colors focus:outline-none disabled:opacity-50 inline-flex items-center"
                            disabled={u._id === user?.id}
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            Delete
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="bg-white px-6 py-4 flex items-center justify-between border-t border-[#16221D]/5">
                <div className="flex-1 flex justify-between sm:hidden">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-[#16221D]/10 text-sm font-medium rounded-lg text-[#16221D] bg-white hover:bg-[#F5F7F4] disabled:opacity-50"
                  >
                    Previous
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-[#16221D]/10 text-sm font-medium rounded-lg text-[#16221D] bg-white hover:bg-[#F5F7F4] disabled:opacity-50"
                  >
                    Next
                  </motion.button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-[#2D3E37]">
                      Page <span className="font-semibold">{page}</span> of <span className="font-semibold">{totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="relative inline-flex items-center px-3 py-2 rounded-l-md border border-[#16221D]/10 bg-white text-sm font-medium text-[#2D3E37] hover:bg-[#F5F7F4] disabled:opacity-50"
                      >
                        Previous
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="relative inline-flex items-center px-3 py-2 rounded-r-md border border-[#16221D]/10 bg-white text-sm font-medium text-[#2D3E37] hover:bg-[#F5F7F4] disabled:opacity-50"
                      >
                        Next
                      </motion.button>
                    </nav>
                  </div>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* Modal for Create/Edit User */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#16221D]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="bg-white rounded-xl shadow-2xl border border-[#16221D]/10 max-w-md w-full p-6 sm:p-8"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-[#16221D] mb-6">
                {editingUser ? 'Edit User' : 'Create New User'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-[#2D3E37] text-xs font-semibold uppercase tracking-wider mb-1.5">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-[#16221D]/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4D6E60] focus:border-[#4D6E60] bg-[#F5F7F4]/50 transition-all text-sm"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-[#2D3E37] text-xs font-semibold uppercase tracking-wider mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-[#16221D]/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4D6E60] focus:border-[#4D6E60] bg-[#F5F7F4]/50 transition-all text-sm"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-[#2D3E37] text-xs font-semibold uppercase tracking-wider mb-1.5">
                    Password {editingUser && <span className="text-[#2D3E37]/60 normal-case">(leave blank to keep current)</span>}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2 border border-[#16221D]/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4D6E60] focus:border-[#4D6E60] bg-[#F5F7F4]/50 transition-all text-sm"
                    required={!editingUser}
                    minLength={8}
                  />
                </div>
                <div className="mb-8">
                  <label className="block text-[#2D3E37] text-xs font-semibold uppercase tracking-wider mb-1.5">
                    Role
                  </label>
                  <Dropdown
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    options={getRoleOptions().map(role => ({
                      value: role.value,
                      label: role.label
                    }))}
                    required
                    className="border-[#16221D]/10 bg-[#F5F7F4]/50 text-sm w-full"
                  />
                  <p className="mt-2 text-xs text-[#2D3E37]/70">
                    {getRoleOptions().find(r => r.value === formData.role)?.description}
                  </p>
                </div>
                <div className="flex justify-end space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 border border-[#16221D]/10 rounded-lg text-[#16221D] font-semibold text-sm hover:bg-[#F5F7F4] transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="px-5 py-2.5 bg-[#4D6E60] text-white rounded-lg font-semibold text-sm hover:bg-[#678E7D] transition-colors shadow-sm"
                  >
                    {editingUser ? 'Update' : 'Create'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default UserManagement;
