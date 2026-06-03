import React, { useState, useEffect } from "react";
import DatePickerWrapper from "../common/DatePickerWrapper";
import { useNavigate, Link } from "react-router-dom";
import { createDistribution } from "../../services/distributionService";
import { getProducts } from "../../services/productService";
import Dropdown from "../Dropdown";
import { motion } from "motion/react";
import aiGif from "../../assets/ai.gif";

const DistributionForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    recipient: "",
    recipientType: "pharmacy",
    items: [{ product: "", quantity: 1, batchNumber: "", expiryDate: "" }],
    shippingInfo: {
      address: "",
      contactPerson: "",
      contactNumber: "",
    },
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getProducts();
        const productsArray = Array.isArray(response.data?.data)
          ? response.data.data
          : [];
        setProducts(productsArray);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please try again.");
      }
    };

    fetchProducts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes("shippingInfo.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        shippingInfo: {
          ...prev.shippingInfo,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;

    // If product changes, auto-fill batch and expiry if available
    if (field === "product" && value) {
      const selectedProduct = products.find((p) => p._id === value);
      if (selectedProduct) {
        newItems[index].batchNumber = selectedProduct.batchNumber || selectedProduct.batch || "";
        newItems[index].expiryDate =
          selectedProduct.expiryDate?.split("T")[0] || "";
      }
    }

    setFormData((prev) => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { product: "", quantity: 1, batchNumber: "", expiryDate: "" },
      ],
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length === 1) {
      return; // Keep at least one item
    }

    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, items: newItems }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.recipient) {
      setError("Recipient is required");
      return;
    }

    if (formData.items.some((item) => !item.product || item.quantity < 1)) {
      setError("All items must have a product and quantity greater than 0");
      return;
    }

    setLoading(true);

    try {
      await createDistribution(formData);
      navigate("/distributions");
    } catch (err) {
      console.error("Error creating distribution:", err);
      setError(
        err.response?.data?.message || "Failed to create distribution order"
      );
    } finally {
      setLoading(false);
    }
  };

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
        className="max-w-4xl mx-auto w-full"
      >
        {/* Header Section */}
        <motion.div 
          variants={itemVariants}
          className="flex justify-between items-center mb-8 border-b border-[#16221D]/5 pb-6"
        >
          <div>
            <h1 className="text-3xl font-extrabold font-serif text-[#16221D] tracking-tight">
              Create Dispatch Order
            </h1>
            <p className="text-[#2D3E37]/80 mt-1 text-sm">
              Register a new outgoing ledger transfer. Batch numbers will resolve automatically.
            </p>
          </div>
          <Link to="/distributions" className="text-xs font-bold text-[#0E7490] hover:text-[#164E63] flex items-center transition-colors">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Logistics
          </Link>
        </motion.div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* RECIPIENT CARD */}
          <motion.div 
            variants={itemVariants}
            className="bg-white rounded-xl border border-[#16221D]/5 shadow-sm p-6 space-y-4"
          >
            <div className="flex items-center space-x-2 border-b border-[#16221D]/5 pb-3">
              <svg className="w-5 h-5 text-[#4D6E60]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h2 className="text-lg font-bold font-serif text-[#16221D]">Recipient Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#2D3E37]/80 text-2xs font-bold uppercase tracking-wider mb-1.5">
                  Recipient Name*
                </label>
                <input
                  type="text"
                  name="recipient"
                  value={formData.recipient}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 border border-[#16221D]/10 rounded-lg text-xs bg-white text-[#16221D] placeholder-[#2D3E37]/45 focus:outline-none focus:ring-1 focus:ring-[#4D6E60] focus:border-[#4D6E60] transition-all"
                  placeholder="Enter pharmacy, hospital, or department..."
                  required
                />
              </div>

              <div>
                <label className="block text-[#2D3E37]/80 text-2xs font-bold uppercase tracking-wider mb-1.5">
                  Recipient Type*
                </label>
                <Dropdown
                  name="recipientType"
                  value={formData.recipientType}
                  onChange={handleChange}
                  options={[
                    { value: "pharmacy", label: "Pharmacy" },
                    { value: "hospital", label: "Hospital" },
                    { value: "department", label: "Department" },
                    { value: "patient", label: "Patient" }
                  ]}
                  required
                />
              </div>
            </div>
          </motion.div>

          {/* SHIPPING CARD */}
          <motion.div 
            variants={itemVariants}
            className="bg-white rounded-xl border border-[#16221D]/5 shadow-sm p-6 space-y-4"
          >
            <div className="flex items-center space-x-2 border-b border-[#16221D]/5 pb-3">
              <svg className="w-5 h-5 text-[#4D6E60]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <h2 className="text-lg font-bold font-serif text-[#16221D]">Shipping & Delivery</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[#2D3E37]/80 text-2xs font-bold uppercase tracking-wider mb-1.5">
                  Address
                </label>
                <input
                  type="text"
                  name="shippingInfo.address"
                  value={formData.shippingInfo.address}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 border border-[#16221D]/10 rounded-lg text-xs bg-white text-[#16221D] placeholder-[#2D3E37]/45 focus:outline-none focus:ring-1 focus:ring-[#4D6E60] focus:border-[#4D6E60] transition-all"
                  placeholder="Shipping destination address..."
                />
              </div>
              <div>
                <label className="block text-[#2D3E37]/80 text-2xs font-bold uppercase tracking-wider mb-1.5">
                  Contact Person
                </label>
                <input
                  type="text"
                  name="shippingInfo.contactPerson"
                  value={formData.shippingInfo.contactPerson}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 border border-[#16221D]/10 rounded-lg text-xs bg-white text-[#16221D] placeholder-[#2D3E37]/45 focus:outline-none focus:ring-1 focus:ring-[#4D6E60] focus:border-[#4D6E60] transition-all"
                  placeholder="Receiving personnel name..."
                />
              </div>
              <div>
                <label className="block text-[#2D3E37]/80 text-2xs font-bold uppercase tracking-wider mb-1.5">
                  Contact Number
                </label>
                <input
                  type="text"
                  name="shippingInfo.contactNumber"
                  value={formData.shippingInfo.contactNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 border border-[#16221D]/10 rounded-lg text-xs bg-white text-[#16221D] placeholder-[#2D3E37]/45 focus:outline-none focus:ring-1 focus:ring-[#4D6E60] focus:border-[#4D6E60] transition-all"
                  placeholder="Phone number..."
                />
              </div>
            </div>
          </motion.div>

          {/* ITEMS CARD */}
          <motion.div 
            variants={itemVariants}
            className="bg-white rounded-xl border border-[#16221D]/5 shadow-sm p-6 space-y-4"
          >
            <div className="flex justify-between items-center border-b border-[#16221D]/5 pb-3">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-[#4D6E60]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h2 className="text-lg font-bold font-serif text-[#16221D]">Ledger Items*</h2>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={addItem}
                className="px-3 py-1.5 bg-[#0E7490] hover:bg-[#164E63] text-white rounded-lg text-2xs font-semibold uppercase tracking-wider transition-all focus:outline-none"
              >
                Add Item
              </motion.button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] table-fixed divide-y divide-[#16221D]/5">
                <thead className="bg-[#F5F7F4]">
                  <tr>
                    <th scope="col" className="w-[35%] px-4 py-2 text-left text-xs font-semibold text-[#2D3E37] uppercase tracking-wider">Product</th>
                    <th scope="col" className="w-[15%] px-4 py-2 text-left text-xs font-semibold text-[#2D3E37] uppercase tracking-wider">Quantity</th>
                    <th scope="col" className="w-[20%] px-4 py-2 text-left text-xs font-semibold text-[#2D3E37] uppercase tracking-wider">Batch</th>
                    <th scope="col" className="w-[20%] px-4 py-2 text-left text-xs font-semibold text-[#2D3E37] uppercase tracking-wider">Expiry</th>
                    <th scope="col" className="w-[10%] px-4 py-2 text-left text-xs font-semibold text-[#2D3E37] uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-[#16221D]/5">
                  {formData.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Dropdown
                          value={item.product}
                          onChange={(e) =>
                            handleItemChange(index, "product", e.target.value)
                          }
                          placeholder="Select Product"
                          options={products.map((product) => ({
                            value: product._id,
                            label: `${product.name} (Stock: ${product.stockQuantity})`
                          }))}
                          required
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "quantity",
                              parseInt(e.target.value) || ""
                            )
                          }
                          className="w-full px-3 py-1.5 border border-[#16221D]/10 rounded-lg text-xs bg-white text-[#16221D] focus:outline-none focus:ring-1 focus:ring-[#4D6E60] focus:border-[#4D6E60] transition-all"
                          required
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <input
                          type="text"
                          value={item.batchNumber}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "batchNumber",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-1.5 border border-[#16221D]/10 rounded-lg text-xs bg-white text-[#16221D] placeholder-[#2D3E37]/45 focus:outline-none focus:ring-1 focus:ring-[#4D6E60] focus:border-[#4D6E60] transition-all"
                          placeholder="Auto-resolves"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <DatePickerWrapper
                          value={item.expiryDate}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "expiryDate",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-1.5 border border-[#16221D]/10 rounded-lg text-xs bg-white text-[#16221D] focus:outline-none focus:ring-1 focus:ring-[#4D6E60] focus:border-[#4D6E60] transition-all"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          onClick={() => removeItem(index)}
                          disabled={formData.items.length === 1}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                            formData.items.length === 1
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                              : "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                          }`}
                        >
                          Remove
                        </motion.button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* ACTIONS FOOTER */}
          <motion.div 
            variants={itemVariants}
            className="flex justify-end gap-3 border-t border-[#16221D]/5 pt-4"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => navigate("/distributions")}
              className="px-5 py-2 border border-[#16221D]/10 hover:bg-[#E9ECE8] text-[#16221D] rounded-lg text-xs font-semibold transition-all duration-300 focus:outline-none"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0 4px 12px rgba(77, 110, 96, 0.2)" }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className={`px-5 py-2 bg-[#4D6E60] hover:bg-[#678E7D] text-[#F5F7F4] rounded-lg text-xs font-semibold transition-all duration-300 focus:outline-none ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Registering..." : "Create Dispatch"}
            </motion.button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
};

export default DistributionForm;
