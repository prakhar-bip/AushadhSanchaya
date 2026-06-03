import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import axios from "axios";
import ProductDetail from "../components/ProductDetail";
import StockMovementGraph from "../components/StockMovementGraph";
import AppLoader from "../components/AppLoader";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [stockMovements, setStockMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const apiUrl = import.meta.env.VITE_API_URL;

        const productResponse = await axios.get(`${apiUrl}/products/${id}`, {
          headers: { Authorization: `${token}` },
        });

        setProduct(productResponse.data.data);

        const movementsResponse = await axios.get(
          `${apiUrl}/stockMovements/product/${id}`,
          { headers: { Authorization: `${token}` } }
        );

        setStockMovements(movementsResponse.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load product details");
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleBack = () => navigate(-1);

  if (loading) return <AppLoader message="Loading Product" />;

  if (error) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-[#B47134]/10 border border-[#B47134]/30 p-5 rounded-2xl mb-6 flex items-center shadow-sm">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-[#B47134]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-bold text-[#B47134]">Error</h3>
            <p className="text-sm font-medium text-[#B47134]/80 mt-1">{error}</p>
          </div>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleBack} className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-bold rounded-xl shadow-sm text-white bg-[#4D6E60] hover:bg-[#3A5348] transition-colors">
          Back to Inventory
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <div className="mb-8">
        <motion.button
          whileHover={{ x: -5 }}
          onClick={handleBack}
          className="inline-flex items-center px-4 py-2 border border-[#16221D]/10 shadow-sm text-sm font-bold rounded-xl text-[#2D3E37] bg-white hover:bg-[#F5F7F4] hover:text-[#4D6E60] transition-all"
        >
          <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </motion.button>
      </div>

      <ProductDetail product={product} />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-10"
      >
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-2xl font-black text-[#16221D]">Analytics</h2>
          <div className="flex-1 h-px bg-[#16221D]/10"></div>
        </div>
        
        <div className="bg-white/70 backdrop-blur-md border border-[#16221D]/5 rounded-3xl p-6 sm:p-8 shadow-sm">
          <StockMovementGraph stockMovements={stockMovements} />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProductDetailPage;
