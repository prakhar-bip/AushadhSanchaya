import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getTrendingDiseaseProducts } from '../../services/maomaoAiService';

function DiseaseTrendSuggestions({ onProductSelect, isJanAushadhi }) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getTrendingDiseaseProducts(isJanAushadhi);
      
      // Process suggestions to extract clean drug names
      const processedSuggestions = (response.response || []).map(item => {
        // Extract just the drug name without dosage or descriptions
        // This regex attempts to get just the medicine name part
        const drugNameMatch = item.match(/^([A-Za-z\s\-]+)(?:\s+\d|\s+\(|\s+\-|$)/);
        return drugNameMatch ? drugNameMatch[1].trim() : item;
      });
      
      setSuggestions(processedSuggestions);
    } catch (err) {
      console.error('Failed to fetch disease trend suggestions:', err);
      setError('Failed to load suggestions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (expanded) {
      fetchSuggestions();
    }
  }, [expanded, isJanAushadhi]);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const handleSuggestionClick = (suggestion) => {
    // Add logging to help diagnose issues
    console.log(`Searching for: ${suggestion}`);
    
    // Directly trigger search with the drug name
    // Pass suggestion and true to ensure immediate search
    onProductSelect(suggestion, true);
  };

  return (
    <div className="mt-4 bg-white rounded-xl shadow-sm border border-[#16221D]/5 overflow-hidden transition-all">
      <motion.button
        whileTap={{ scale: 0.99 }}
        onClick={toggleExpanded}
        className="w-full px-5 py-3 text-left bg-[#F5F7F4]/50 hover:bg-[#F5F7F4] flex justify-between items-center transition-colors border-b border-transparent"
        style={{ borderBottomColor: expanded ? 'rgba(22, 34, 29, 0.05)' : 'transparent' }}
      >
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-3 text-[#4D6E60]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
          <span className="font-semibold text-[#16221D]">MaomaoAi Trend Analysis</span>
        </div>
        <svg
          className={`w-5 h-5 text-[#2D3E37]/60 transition-transform duration-300 ${expanded ? 'transform rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </motion.button>

      <AnimatePresence>
        {expanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-5 bg-white">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-6">
                  <div className="relative w-12 h-12 mb-3">
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-[#4D6E60]/20 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-[#4D6E60] rounded-full border-t-transparent animate-spin"></div>
                  </div>
                  <span className="text-sm font-medium text-[#2D3E37]/70">Analyzing disease trends...</span>
                </div>
              ) : error ? (
                <div className="text-[#B47134] bg-[#B47134]/10 p-3 rounded-lg text-sm text-center font-medium border border-[#B47134]/20">{error}</div>
              ) : suggestions.length === 0 ? (
                <div className="text-center py-6">
                  <svg className="mx-auto h-12 w-12 text-[#2D3E37]/20 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="mt-2 text-sm text-[#2D3E37]/60">No suggestions available</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-[#2D3E37]/80 mb-4 font-medium">
                    Based on recent disease trends, consider stocking these medications:
                  </p>
                  <ul className="divide-y divide-[#16221D]/5 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {suggestions.map((suggestion, index) => (
                      <motion.li 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        key={index} 
                        className="py-1"
                      >
                        <button
                          type="button"
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full text-left hover:bg-[#F5F7F4]/80 p-3 rounded-lg flex justify-between items-center transition-colors group"
                        >
                          <span className="font-semibold text-[#4D6E60] group-hover:text-[#678E7D] transition-colors">{suggestion}</span>
                          <span className="flex items-center text-xs font-medium text-[#2D3E37]/50 group-hover:text-[#4D6E60] transition-colors">
                            Search
                            <svg className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                            </svg>
                          </span>
                        </button>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default DiseaseTrendSuggestions;
