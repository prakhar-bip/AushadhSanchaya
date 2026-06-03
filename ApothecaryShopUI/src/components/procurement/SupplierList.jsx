import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { getSuppliers, deleteSupplier } from "../../services/supplierService";
import AppLoader from "../AppLoader";

function SupplierList() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const data = await getSuppliers();
      // Handle response structure { success: true, data: [...] } or direct array
      const suppliersList = Array.isArray(data) ? data : (data?.data || []);
      setSuppliers(Array.isArray(suppliersList) ? suppliersList : []);
      setError(null);
    } catch (err) {
      setError("Failed to load suppliers");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this supplier?")) {
      try {
        await deleteSupplier(id);
        setSuppliers(suppliers.filter((supplier) => supplier._id !== id));
      } catch (err) {
        setError("Failed to delete supplier");
        console.error(err);
      }
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#16221D]">Suppliers</h1>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Link
            to="/procurement/suppliers/new"
            className="bg-[#4D6E60] hover:bg-[#678E7D] text-white font-semibold py-2.5 px-5 rounded-xl shadow-sm transition-colors border border-transparent inline-flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Add New Supplier
          </Link>
        </motion.div>
      </div>

      {suppliers.length === 0 ? (
        <div className="flex flex-col justify-center items-center h-64 bg-white rounded-2xl border border-[#16221D]/5 shadow-sm p-8 text-center">
          <motion.svg 
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="w-20 h-20 text-[#4D6E60]/20 mb-6" 
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </motion.svg>
          <h3 className="text-lg font-semibold text-[#16221D] mb-2">No Suppliers Found</h3>
          <p className="text-[#2D3E37]/60 max-w-md">There are no suppliers currently registered in the system. Add a new supplier to start managing your procurement.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-[#16221D]/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#16221D]/5">
              <thead className="bg-[#F5F7F4]/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#2D3E37] uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#2D3E37] uppercase tracking-wider">
                    Contact Person
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#2D3E37] uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#2D3E37] uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#2D3E37] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-[#2D3E37] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <motion.tbody 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="divide-y divide-[#16221D]/5 bg-white"
              >
                {Array.isArray(suppliers) && suppliers.map((supplier) => (
                  <motion.tr 
                    variants={itemVariants}
                    key={supplier._id}
                    className="hover:bg-[#F5F7F4]/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-[#16221D]">{supplier.name}</div>
                      {supplier.isJanAushadhi && (
                        <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#4D6E60]/10 text-[#4D6E60] uppercase tracking-wider">
                          JanAushadhi
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2D3E37]">
                      {supplier.contactPerson || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2D3E37]">
                      {supplier.email || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2D3E37]">
                      {supplier.phone || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          supplier.status === "active"
                            ? "bg-[#4D6E60]/10 text-[#4D6E60]"
                            : "bg-[#B47134]/10 text-[#B47134]"
                        }`}
                      >
                        {supplier.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                      <Link
                        to={`/procurement/suppliers/${supplier._id}`}
                        className="text-[#4D6E60] hover:text-[#678E7D] transition-colors"
                      >
                        View
                      </Link>
                      <Link
                        to={`/procurement/suppliers/${supplier._id}/edit`}
                        className="text-[#16221D] hover:text-[#2D3E37] transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(supplier._id)}
                        className="text-[#B47134] hover:text-[#8C5523] transition-colors focus:outline-none"
                      >
                        Delete
                      </button>
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

export default SupplierList;
