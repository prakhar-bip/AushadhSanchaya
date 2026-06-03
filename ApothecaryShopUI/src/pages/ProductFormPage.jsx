import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ProductForm from "../components/ProductForm";
import AppLoader from "../components/AppLoader";

const ProductFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false); // Initially not loading
  const [error, setError] = useState(null);

  useEffect(() => {
    // Only fetch product if we're editing an existing product
    if (id && id !== "new") {
      setLoading(true);

      const fetchProduct = async () => {
        try {
          const token = localStorage.getItem("token");
          const apiUrl = import.meta.env.VITE_API_URL;

          console.log(`Fetching product with ID: ${id}`);
          const response = await axios.get(`${apiUrl}/products/${id}`, {
            headers: {
              Authorization: `${token}`,
            },
          });

          console.log("Product fetched successfully:", response.data);
          setProduct(response.data.data);
          setLoading(false);
        } catch (err) {
          console.error("Error fetching product:", err);
          setError(err.message || "Failed to fetch product");
          setLoading(false);
        }
      };

      fetchProduct();
    }
  }, [id]);

  const saveProduct = async (formData) => {
    try {
      const token = localStorage.getItem("token");
      const apiUrl = import.meta.env.VITE_API_URL;

      // Debug logs
      console.log("API URL:", apiUrl);
      console.log("Form data to be submitted:", formData);

      let response;

      if (!id || id === "new") {
        // Create new product
        console.log("Creating new product");
        response = await axios.post(`${apiUrl}/products`, formData, {
          headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json",
          },
        });
        console.log("Product created:", response.data);
      } else {
        // Update existing product
        console.log(`Updating product with ID: ${id}`);
        response = await axios.put(`${apiUrl}/products/${id}`, formData, {
          headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json",
          },
        });
        console.log("Product updated:", response.data);
      }

      // Navigate back to inventory after successful save
      navigate("/inventory");
    } catch (error) {
      console.error("Error saving product:", error);
      console.error("Error response:", error.response);
      setError(error.response?.data?.message || "Failed to save product");
      alert(
        `Error: ${error.response?.data?.message || "Failed to save product"}`
      );
    }
  };

  const cancelEdit = () => {
    navigate("/inventory");
  };

  if (loading) {
    return <AppLoader message="Loading" />;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      {error && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#B47134]/10 border border-[#B47134]/30 text-[#B47134] px-4 py-3 rounded-xl mb-6 shadow-sm flex items-center gap-3"
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm font-medium">{error}</p>
        </motion.div>
      )}
      <ProductForm
        product={id === "new" ? null : product}
        saveProduct={saveProduct}
        cancelEdit={cancelEdit}
      />
    </motion.div>
  );
};

export default ProductFormPage;
