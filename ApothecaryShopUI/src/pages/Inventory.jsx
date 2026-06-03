import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import MaomaoVision from "../components/MaomaoVision";
import AppLoader from "../components/AppLoader";
import Dropdown from "../components/Dropdown";
import ProductForm from "../components/ProductForm";
import aiGif from "../assets/ai.gif";
import { motion, AnimatePresence } from "motion/react";

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      const apiUrl = import.meta.env.VITE_API_URL;

      const response = await axios.get(`${apiUrl}/products`, {
        headers: {
          Authorization: `${token}`,
        },
      });

      setProducts(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter products based on search term and status
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      (product.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (product.sku?.toLowerCase() || "").includes(searchTerm.toLowerCase());

    if (filterStatus === "all") return matchesSearch;
    if (filterStatus === "low-stock")
      return matchesSearch && product.stockQuantity <= product.reorderLevel;
    if (filterStatus === "in-stock")
      return matchesSearch && product.stockQuantity > product.reorderLevel;

    const today = new Date();
    const expiryDate = product.expiryDate ? new Date(product.expiryDate) : null;

    if (filterStatus === "expiring-soon") {
      const ninetyDaysFromNow = new Date();
      ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);
      return (
        matchesSearch &&
        expiryDate &&
        expiryDate <= ninetyDaysFromNow &&
        expiryDate >= today
      );
    }
    if (filterStatus === "expired")
      return matchesSearch && expiryDate && expiryDate < today;

    return matchesSearch;
  });

  // Calculate quick mini-stats
  const totalSKUs = products.length;
  const lowStockSKUs = products.filter(p => p.stockQuantity <= p.reorderLevel).length;
  const expiredSKUs = products.filter(p => p.expiryDate && new Date(p.expiryDate) < new Date()).length;

  const handleProductFound = (productName) => {
    setSearchTerm(productName);
    setSnackbar({
      open: true,
      message: `Searching for: ${productName}`,
      severity: "info",
    });

    setTimeout(() => {
      setSnackbar((prev) => ({ ...prev, open: false }));
    }, 5000);
  };

  const handleStartAdd = () => {
    setEditingProduct(null);
    setIsFormModalOpen(true);
  };

  const handleStartEdit = (product) => {
    setEditingProduct(product);
    setIsFormModalOpen(true);
  };

  const saveProduct = async (formData) => {
    try {
      const token = localStorage.getItem("token");
      const apiUrl = import.meta.env.VITE_API_URL;
      
      if (!editingProduct) {
        // Create new product
        const response = await axios.post(`${apiUrl}/products`, formData, {
          headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json",
          },
        });
        
        setProducts(prev => [response.data.data, ...prev]);
        setSnackbar({
          open: true,
          message: "Product registered successfully",
          severity: "success"
        });
      } else {
        // Update existing product
        const response = await axios.put(`${apiUrl}/products/${editingProduct._id}`, formData, {
          headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json",
          },
        });
        
        setProducts(prev => prev.map(p => p._id === editingProduct._id ? response.data.data : p));
        setSnackbar({
          open: true,
          message: "Product updated successfully",
          severity: "success"
        });
      }
      setIsFormModalOpen(false);
      setEditingProduct(null);
    } catch (error) {
      console.error("Error saving product:", error);
      alert(`Error: ${error.response?.data?.message || "Failed to save product"}`);
    }
  };

  // Inline Loader to keep Navbar visible and avoid visual page reload flash
  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#F5F7F4] flex items-center justify-center">
        <AppLoader message="Loading apothecary ledger inventory..." fullScreen={false} className="bg-transparent" />
      </div>
    );
  }

  // Framer Motion animation configurations
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
        {/* Header Block - Restructured */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-[#16221D]/5 pb-6"
        >
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold font-serif text-[#16221D] tracking-tight">
                Inventory Management
              </h1>
              {/* Continuous animated GIF AI badge */}
              <div className="flex items-center space-x-2 bg-white px-2.5 py-1 rounded-lg border border-[#4D6E60]/15 shadow-sm text-xs font-semibold text-[#4D6E60]">
                <img src={aiGif} alt="AI" className="w-5 h-5 rounded-full object-cover shadow-inner" />
                <span className="animate-pulse-slow">AI Scanner Active</span>
              </div>
            </div>
            <p className="text-[#2D3E37]/80 mt-1 text-sm">
              Batch-level compliance tracking, stock checks, and optical scanner integration.
            </p>
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <button
              onClick={handleStartAdd}
              className="inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-semibold rounded-lg shadow-sm text-[#F5F7F4] bg-[#4D6E60] hover:bg-[#678E7D] focus:outline-none transition-all duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Product
            </button>
          </motion.div>
        </motion.div>

        {/* Mini-Stats Row with Continuous Animations */}
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 w-full"
        >
          {/* Card 1: Total SKUs */}
          <div className="bg-white rounded-xl p-4 border border-[#16221D]/5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[#2D3E37]/75 text-2xs font-semibold uppercase tracking-wider">Total Catalog SKUs</p>
              <p className="text-2xl font-bold font-serif text-[#16221D] mt-1">{totalSKUs}</p>
            </div>
            {/* Spinning molecule SVG */}
            <svg className="w-8 h-8 text-[#4D6E60] animate-spin-slow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5" />
              <circle cx="12" cy="12" r="3" fill="#4D6E60" />
            </svg>
          </div>

          {/* Card 2: Low Stock */}
          <div className="bg-white rounded-xl p-4 border border-[#16221D]/5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[#2D3E37]/75 text-2xs font-semibold uppercase tracking-wider">Low Stock Warnings</p>
              <p className={`text-2xl font-bold font-serif mt-1 ${lowStockSKUs > 0 ? "text-[#B47134]" : "text-[#16221D]"}`}>{lowStockSKUs}</p>
            </div>
            {/* Pulsing warning SVG */}
            <svg className="w-8 h-8 text-[#B47134] icon-dot-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <circle cx="12" cy="17" r="0.5" fill="currentColor" />
            </svg>
          </div>

          {/* Card 3: Expired Items */}
          <div className="bg-white rounded-xl p-4 border border-[#16221D]/5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[#2D3E37]/75 text-2xs font-semibold uppercase tracking-wider">Expired Batches</p>
              <p className={`text-2xl font-bold font-serif mt-1 ${expiredSKUs > 0 ? "text-[#B91C1C]" : "text-[#16221D]"}`}>{expiredSKUs}</p>
            </div>
            {/* Pulsing shield alert SVG */}
            <svg className="w-8 h-8 text-[#B91C1C] animate-pulse-slow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <line x1="9" y1="12" x2="15" y2="12" />
            </svg>
          </div>
        </motion.div>

        {/* Filter and Search Controls */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4"
        >
          <div className="w-full md:w-auto relative">
            <input
              type="text"
              placeholder="Search by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full md:w-80 px-4 py-2 border border-[#16221D]/10 rounded-lg shadow-sm placeholder-[#2D3E37]/50 focus:outline-none focus:ring-1 focus:ring-[#4D6E60] focus:border-[#4D6E60] bg-white text-[#16221D] text-sm transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#2D3E37]/50 hover:text-[#16221D]"
              >
                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
            <Dropdown
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full sm:w-48"
              options={[
                { value: "all", label: "All Products" },
                { value: "low-stock", label: "Low Stock" },
                { value: "in-stock", label: "In Stock" },
                { value: "expiring-soon", label: "Expiring Soon" },
                { value: "expired", label: "Expired" }
              ]}
            />

            <MaomaoVision onProductFound={handleProductFound} />
          </div>
        </motion.div>

        {/* Snackbar Notification */}
        {snackbar.open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-xl shadow-sm border flex justify-between items-center ${
              snackbar.severity === "info"
                ? "bg-[#0E7490]/5 text-[#0E7490] border-[#0E7490]/20"
                : "bg-[#4D6E60]/5 text-[#4D6E60] border-[#4D6E60]/20"
            }`}
          >
            <span className="text-sm font-medium">{snackbar.message}</span>
            <button
              onClick={() => setSnackbar((prev) => ({ ...prev, open: false }))}
              className="text-[#2D3E37]/60 hover:text-[#16221D] transition-colors"
            >
              <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        )}

        {/* Products Data Table */}
        <motion.div variants={itemVariants}>
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#16221D]/5 p-8 text-center w-full shadow-sm">
              <p className="text-[#2D3E37]/65 text-sm">No products found matching filters.</p>
            </div>
          ) : (
            <div className="bg-white border border-[#16221D]/5 shadow-sm rounded-xl w-full overflow-hidden">
              <div className="overflow-x-auto w-full">
                <table className="w-full min-w-[800px] table-fixed divide-y divide-[#16221D]/5">
                  <thead className="bg-[#F5F7F4]">
                    <tr>
                      <th scope="col" className="w-[12%] px-4 py-3 text-left text-xs font-semibold text-[#2D3E37] uppercase tracking-wider">
                        SKU
                      </th>
                      <th scope="col" className="w-[28%] px-4 py-3 text-left text-xs font-semibold text-[#2D3E37] uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="w-[15%] px-4 py-3 text-left text-xs font-semibold text-[#2D3E37] uppercase tracking-wider">
                        Category
                      </th>
                      <th scope="col" className="w-[12%] px-4 py-3 text-left text-xs font-semibold text-[#2D3E37] uppercase tracking-wider">
                        Stock
                      </th>
                      <th scope="col" className="w-[10%] px-4 py-3 text-left text-xs font-semibold text-[#2D3E37] uppercase tracking-wider">
                        Price
                      </th>
                      <th scope="col" className="w-[13%] px-4 py-3 text-left text-xs font-semibold text-[#2D3E37] uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="w-[13%] px-4 py-3 text-left text-xs font-semibold text-[#2D3E37] uppercase tracking-wider">
                        Expiry
                      </th>
                      <th scope="col" className="w-[8%] px-4 py-3 text-left text-xs font-semibold text-[#2D3E37] uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-[#16221D]/5">
                    {filteredProducts.map((product) => {
                      const today = new Date();
                      const expiryDate = product.expiryDate
                        ? new Date(product.expiryDate)
                        : new Date();
                      const isExpired = expiryDate < today;
                      const isExpiringSoon =
                        !isExpired &&
                        expiryDate <= new Date(today.setDate(today.getDate() + 90));

                      const statusColor = product.stockQuantity <= product.reorderLevel
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : "bg-[#4D6E60]/10 text-[#4D6E60] border border-[#4D6E60]/20";

                      return (
                        <tr key={product._id} className="hover:bg-[#F5F7F4]/40 transition-colors">
                          <td className="px-4 py-3.5 text-xs font-semibold text-[#16221D] truncate" title={product.sku}>
                            {product.sku}
                          </td>
                          <td className="px-4 py-3.5 text-sm font-medium text-[#0E7490] hover:text-[#164E63] transition-colors truncate" title={product.name}>
                            <Link to={`/products/${product._id}`} className="hover:underline">
                              {product.name}
                            </Link>
                          </td>
                          <td className="px-4 py-3.5 text-sm text-[#2D3E37]/80 truncate" title={product.category}>
                            {product.category}
                          </td>
                          <td className="px-4 py-3.5 text-sm text-[#2D3E37]/80 font-medium">
                            <span className={product.stockQuantity <= product.reorderLevel ? "text-red-600 font-bold" : ""}>
                              {product.stockQuantity}
                            </span>
                            {product.stockQuantity <= product.reorderLevel && (
                              <span className="ml-2 px-1.5 py-0.5 inline-flex text-3xs font-semibold rounded-full bg-red-100 text-red-800">
                                Low
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-sm text-[#2D3E37]/80 font-medium">
                            ${Number(product.unitPrice || 0).toFixed(2)}
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={`px-2 py-0.5 inline-flex text-2xs leading-5 font-semibold rounded-full ${statusColor}`}>
                              {product.stockQuantity <= product.reorderLevel ? "Low Stock" : "In Stock"}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-sm font-medium">
                            <span className={isExpired ? "text-red-600" : isExpiringSoon ? "text-[#B47134]" : "text-[#2D3E37]/80"}>
                              {expiryDate.toLocaleDateString()}
                            </span>
                            {isExpired && (
                              <span className="ml-2 px-1.5 py-0.5 inline-flex text-3xs font-semibold rounded-full bg-red-100 text-red-800">
                                Expired
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-sm font-medium">
                            <button
                              onClick={() => handleStartEdit(product)}
                              className="text-[#4D6E60] hover:text-[#678E7D] hover:underline focus:outline-none font-semibold text-xs transition-all duration-200"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Floating Add/Edit Product Modal Dialog */}
      <AnimatePresence>
        {isFormModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            {/* Background blur overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsFormModalOpen(false);
                setEditingProduct(null);
              }}
              className="fixed inset-0 bg-[#16221D]/45 backdrop-blur-sm"
            />

            {/* Modal dialog box */}
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 15 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="relative bg-white rounded-xl shadow-2xl border border-[#16221D]/10 max-w-4xl w-full p-6 sm:p-8 z-10 overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  setIsFormModalOpen(false);
                  setEditingProduct(null);
                }}
                className="absolute top-4 right-4 text-[#2D3E37]/60 hover:text-[#16221D] focus:outline-none p-1.5 hover:bg-[#F5F7F4] rounded-lg transition-colors duration-200"
              >
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <ProductForm
                product={editingProduct}
                saveProduct={saveProduct}
                cancelEdit={() => {
                  setIsFormModalOpen(false);
                  setEditingProduct(null);
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Inventory;
