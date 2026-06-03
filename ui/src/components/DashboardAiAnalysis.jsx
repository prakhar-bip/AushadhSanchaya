import React, { useState } from 'react';
import { generateAiResponse } from '../services/maomaoAiService';
import { FaSpinner, FaChevronUp, FaChevronDown } from 'react-icons/fa';
import aiGif from '../assets/ai.gif';
import { motion } from 'motion/react';

const DashboardAiAnalysis = ({ stats }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const generateAnalysis = async () => {
    setLoading(true);
    setError(null);
    setIsExpanded(true); // Open the panel to make spinner visible
    
    try {
      // Create a prompt that includes all the inventory statistics
      const prompt = `
        As an inventory management expert, analyze this apothecary shop's current inventory stats and provide actionable recommendations:
        
        - Total Products: ${stats.totalProducts}
        - Low Stock Products: ${stats.lowStockProducts} 
        - Expiring Soon Products: ${stats.expiringProducts}
        - Expired Products: ${stats.expiredProducts}
        - Total Inventory Value: $${stats.totalValue.toFixed(2)}
        
        Provide a concise analysis of the inventory health and 3-5 specific recommendations to optimize inventory management. 
        Include insights about stock levels, product expiration management, and potential financial considerations.
        Do not include any markdown or code formatting syntax like backticks in your response.
      `;
      
      const response = await generateAiResponse({
        prompt,
        userName: 'Inventory Manager',
        userContext: 'Analyzing inventory dashboard statistics',
        outputFormat: 'html',
        structuredOutput: false
      });
      
      // Clean the response to remove any backticks that might be in the HTML
      const cleanedResponse = response.response.replace(/```html|```|`/g, '');
      setAnalysis(cleanedResponse);
    } catch (err) {
      console.error('Error generating inventory analysis:', err);
      setError('Failed to generate inventory analysis. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#16221D]/5 shadow-sm overflow-hidden font-sans">
      <div className="p-5 border-b border-[#16221D]/5">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-[#16221D] flex items-center font-serif">
            <div className="w-10 h-10 mr-3 overflow-hidden flex items-center justify-center rounded-full bg-[#4D6E60]/10 border border-[#4D6E60]/20 shadow-inner">
              <img 
                src={aiGif} 
                alt="MaoMao AI" 
                className="object-cover w-14 h-10 -ml-3 -mr-3" 
              />
            </div>
            MaoMao AI Inventory Analysis
          </h3>
          
          {!analysis && !loading && (
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0 6px 18px rgba(77, 110, 96, 0.2)" }}
              whileTap={{ scale: 0.98 }}
              onClick={generateAnalysis}
              className="px-4 py-2 bg-[#4D6E60] hover:bg-[#678E7D] text-[#F5F7F4] rounded-lg flex items-center font-semibold text-sm transition-all focus:outline-none shadow-sm"
            >
              Analyze Inventory
            </motion.button>
          )}
          
          {analysis && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-[#0E7490] hover:text-[#164E63] text-sm font-semibold flex items-center transition-colors focus:outline-none"
            >
              {isExpanded ? (
                <>
                  <span className="mr-1.5">Collapse</span>
                  <FaChevronUp /> 
                </>
              ) : (
                <>
                  <span className="mr-1.5">Expand</span>
                  <FaChevronDown />
                </>
              )}
            </button>
          )}
        </div>
      </div>
      
      {/* Container for Expanded Analysis content */}
      <div className={`transition-all duration-300 ease-in-out ${isExpanded || loading ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        {loading && (
          <div className="p-8 flex justify-center items-center">
            <FaSpinner className="animate-spin text-[#4D6E60] mr-3 text-xl" />
            <span className="text-[#2D3E37]/80 font-medium text-sm">Generating medical ledger analysis...</span>
          </div>
        )}
        
        {error && (
          <div className="p-5 text-red-600 font-medium text-sm bg-red-50 border-b border-red-100">
            {error}
          </div>
        )}
        
        {analysis && (
          <div 
            className="p-6 text-[#2D3E37]/90 leading-relaxed text-sm bg-[#F5F7F4]/30 prose max-w-none"
            dangerouslySetInnerHTML={{ __html: analysis }}
          />
        )}
      </div>
      
      {/* Separated action bar when collapsed but analysis is loaded */}
      {!isExpanded && analysis && (
        <div className="px-5 py-3 bg-[#F5F7F4]/50 border-t border-[#16221D]/5">
          <button 
            onClick={() => setIsExpanded(true)}
            className="text-xs text-[#0E7490] hover:text-[#164E63] font-bold flex items-center uppercase tracking-wider focus:outline-none"
          >
            <FaChevronDown className="mr-1.5" /> Show AI Analysis
          </button>
        </div>
      )}
    </div>
  );
};

export default DashboardAiAnalysis;
