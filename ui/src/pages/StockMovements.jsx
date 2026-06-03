import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'motion/react';
import AddStockMovementModal from '../components/AddStockMovementModal';
import StockMovementGraph from '../components/StockMovementGraph';
import StockMovementAiAnalysis from '../components/StockMovementAiAnalysis';
import Dropdown from '../components/Dropdown';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const StockMovements = () => {
  const [stockMovements, setStockMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProductName, setSelectedProductName] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const apiUrl = import.meta.env.VITE_API_URL;
        
        // Fetch products for dropdown
        const productsRes = await axios.get(`${apiUrl}/products`, {
          headers: {
            'Authorization': `${token}`
          }
        });
        
        setProducts(productsRes.data.data);
        
        // If there's a selected product, fetch its stock movements
        if (selectedProduct) {
          const movementsRes = await axios.get(`${apiUrl}/stockMovements/product/${selectedProduct}`, {
            headers: {
              'Authorization': `${token}`
            }
          });
          setStockMovements(movementsRes.data);
          
          // Find the product name for the selected product
          const selectedProd = productsRes.data.data.find(prod => prod._id === selectedProduct);
          if (selectedProd) {
            setSelectedProductName(selectedProd.name);
          }
        } else {
          setStockMovements([]);
          setSelectedProductName('');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [selectedProduct]);

  const handleAddStockMovement = async (newMovement) => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL;
      
      await axios.post(`${apiUrl}/stockMovements`, newMovement, {
        headers: {
          'Authorization': `${token}`
        }
      });
      
      // Refresh the stock movements for the selected product
      if (selectedProduct === newMovement.productId) {
        const movementsRes = await axios.get(`${apiUrl}/stockMovements/product/${selectedProduct}`, {
          headers: {
            'Authorization': `${token}`
          }
        });
        setStockMovements(movementsRes.data);
      }
      
      // Also update the products list to reflect new stock quantities
      const productsRes = await axios.get(`${apiUrl}/products`, {
        headers: {
          'Authorization': `${token}`
        }
      });
      
      setProducts(productsRes.data.data);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error adding stock movement:', err);
      alert(`Error: ${err.response?.data?.message || 'Failed to add stock movement'}`);
    }
  };

  if (loading && selectedProduct) return (
    <div className="flex justify-center items-center h-64 text-[#2D3E37]/60">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4D6E60] mx-auto mb-2"></div>
      <span className="ml-3">Loading...</span>
    </div>
  );

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-[#F5F7F4] min-h-screen"
    >
      <motion.div variants={itemVariants} className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#16221D]">Stock Movements</h1>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-[#4D6E60] text-white rounded-lg font-semibold text-sm hover:bg-[#678E7D] transition-colors shadow-sm flex items-center"
        >
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          Add Movement
        </motion.button>
      </motion.div>
      
      <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-[#16221D]/5 p-6 mb-8">
        <div className="mb-6">
          <label htmlFor="product-select" className="block text-sm font-semibold text-[#2D3E37] uppercase tracking-wider mb-2">Select Product</label>
          <Dropdown
            id="product-select"
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            placeholder="-- Select a product --"
            options={products.map(product => ({
              value: product._id,
              label: `${product.name} (Current Stock: ${product.stockQuantity})`
            }))}
            className="border-[#16221D]/10 bg-[#F5F7F4]/50 shadow-sm"
          />
        </div>
        
        {selectedProduct && (
          <StockMovementGraph stockMovements={stockMovements} />
        )}
        
        {/* Add the AI Analysis component when there are enough stock movements */}
        {selectedProduct && stockMovements.length > 2 && (
          <StockMovementAiAnalysis 
            stockMovements={stockMovements} 
            productName={selectedProductName} 
          />
        )}
        
        {selectedProduct ? (
          stockMovements.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-[#16221D]/5 mt-6">
              <table className="min-w-full divide-y divide-[#16221D]/5">
                <thead className="bg-[#F5F7F4]">
                  <tr>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-[#2D3E37]/80 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-[#2D3E37]/80 uppercase tracking-wider">Type</th>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-[#2D3E37]/80 uppercase tracking-wider">Quantity</th>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-[#2D3E37]/80 uppercase tracking-wider">Previous Stock</th>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-[#2D3E37]/80 uppercase tracking-wider">New Stock</th>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-[#2D3E37]/80 uppercase tracking-wider">Reason</th>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-[#2D3E37]/80 uppercase tracking-wider">Created By</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-[#16221D]/5">
                  {stockMovements.map(movement => (
                    <tr key={movement._id} className="hover:bg-[#F5F7F4]/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2D3E37]/70">
                        {new Date(movement.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded border ${
                          movement.type === 'in' ? 'bg-[#4D6E60]/10 text-[#4D6E60] border-[#4D6E60]/20' : 'bg-[#B47134]/5 text-[#B47134] border-[#B47134]/20'
                        }`}>
                          {movement.type === 'in' ? 'Stock In' : 'Stock Out'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-[#16221D]">
                        {movement.type === 'in' ? '+' : '-'}{movement.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2D3E37]/70">{movement.previousStock}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-[#16221D]">{movement.newStock}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2D3E37]">{movement.reason}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2D3E37]/70">
                        {movement.createdBy?.name || 'Unknown'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-[#2D3E37]/20 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="mt-4 text-[#2D3E37]/60">No stock movements found for this product.</p>
            </div>
          )
        ) : (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-[#4D6E60]/20 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
            <p className="mt-4 text-[#2D3E37]/60">Please select a product to view its stock movements.</p>
          </div>
        )}
      </motion.div>
      
      {/* Stock Movement Modal */}
      <AddStockMovementModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddStockMovement}
        products={products}
      />
    </motion.div>
  );
};

export default StockMovements;
