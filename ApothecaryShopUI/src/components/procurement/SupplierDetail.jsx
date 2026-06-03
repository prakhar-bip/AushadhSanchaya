import React, { useEffect, useState, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { AuthContext } from "../../context/AuthContext.jsx";
import AppLoader from "../AppLoader.jsx";

const SupplierDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/suppliers/${id}`,
          {
            headers: {
              Authorization: token,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to load supplier details");
        }

        const data = await response.json();
        setSupplier(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSupplier();
  }, [id, token]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this supplier?")) {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/suppliers/${id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: token,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to delete supplier");
        }

        navigate("/procurement/suppliers");
      } catch (err) {
        setError(err.message);
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
        Error: {error}
      </div>
    );
  }
  if (!supplier) {
    return (
      <div className="text-[#2D3E37]/60 text-center py-8 font-medium">
        Supplier not found
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="bg-white shadow-sm border border-[#16221D]/5 rounded-2xl p-8 max-w-4xl mx-auto"
    >
      <div className="flex justify-between items-center mb-8 pb-6 border-b border-[#16221D]/5">
        <h1 className="text-3xl font-bold text-[#16221D]">{supplier.name}</h1>
        {supplier.status && (
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
            supplier.status === "active" ? "bg-[#4D6E60]/10 text-[#4D6E60]" : "bg-[#B47134]/10 text-[#B47134]"
          }`}>
            {supplier.status}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-8">
        <div>
          <h2 className="text-lg font-semibold mb-4 text-[#4D6E60] flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
            Contact Information
          </h2>
          <div className="space-y-3 text-sm">
            <p className="flex justify-between items-center bg-[#F5F7F4]/50 p-3 rounded-lg border border-[#16221D]/5">
              <strong className="text-[#2D3E37]">Contact Person:</strong> 
              <span className="text-[#16221D] font-medium">{supplier.contactPerson || '-'}</span>
            </p>
            <p className="flex justify-between items-center bg-[#F5F7F4]/50 p-3 rounded-lg border border-[#16221D]/5">
              <strong className="text-[#2D3E37]">Email:</strong> 
              <span className="text-[#16221D] font-medium">{supplier.email || '-'}</span>
            </p>
            <p className="flex justify-between items-center bg-[#F5F7F4]/50 p-3 rounded-lg border border-[#16221D]/5">
              <strong className="text-[#2D3E37]">Phone:</strong> 
              <span className="text-[#16221D] font-medium">{supplier.phone || '-'}</span>
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4 text-[#4D6E60] flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            Address
          </h2>
          <div className="bg-[#F5F7F4]/50 p-4 rounded-xl border border-[#16221D]/5 text-sm h-[calc(100%-2.5rem)]">
            {supplier.address && (supplier.address.street || supplier.address.city) ? (
              <div className="space-y-1.5 text-[#16221D] font-medium">
                <p>{supplier.address.street}</p>
                <p>
                  {supplier.address.city}, {supplier.address.state}{" "}
                  {supplier.address.zipCode}
                </p>
                <p>{supplier.address.country}</p>
              </div>
            ) : (
              <p className="text-[#2D3E37]/50 italic">No address provided</p>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-[#16221D]/5 pt-8 mt-4">
        <h2 className="text-lg font-semibold mb-4 text-[#4D6E60] flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          Additional Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <p className="flex flex-col bg-[#F5F7F4]/50 p-4 rounded-xl border border-[#16221D]/5">
            <strong className="text-[#2D3E37] mb-1">Tax ID</strong> 
            <span className="text-[#16221D] font-medium">{supplier.taxId || "N/A"}</span>
          </p>
          <p className="flex flex-col bg-[#F5F7F4]/50 p-4 rounded-xl border border-[#16221D]/5">
            <strong className="text-[#2D3E37] mb-1">Payment Terms</strong> 
            <span className="text-[#16221D] font-medium">{supplier.paymentTerms || "N/A"}</span>
          </p>
          <p className="flex flex-col md:col-span-2 bg-[#F5F7F4]/50 p-4 rounded-xl border border-[#16221D]/5">
            <strong className="text-[#2D3E37] mb-1">Notes</strong> 
            <span className="text-[#16221D] font-medium whitespace-pre-wrap">{supplier.notes || "No notes available"}</span>
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mt-10 pt-6 border-t border-[#16221D]/5">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Link
            to={`/procurement/suppliers/${id}/edit`}
            className="bg-[#4D6E60] text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-[#678E7D] transition-colors inline-block"
          >
            Edit Supplier
          </Link>
        </motion.div>
        
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={handleDelete}
          className="bg-white border border-[#B47134] text-[#B47134] px-5 py-2.5 rounded-lg font-semibold hover:bg-[#B47134] hover:text-white transition-colors"
        >
          Delete Supplier
        </motion.button>
        
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="ml-auto">
          <Link
            to="/procurement/suppliers"
            className="bg-[#F5F7F4] border border-[#16221D]/10 text-[#2D3E37] px-5 py-2.5 rounded-lg font-semibold hover:bg-[#16221D]/5 transition-colors inline-block"
          >
            Back to Suppliers
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SupplierDetail;
