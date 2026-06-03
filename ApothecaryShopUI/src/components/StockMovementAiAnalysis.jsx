import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { generateAiResponse } from '../services/maomaoAiService';

const StockMovementAiAnalysis = ({ stockMovements, productName }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  // Helper function to clean AI response from unwanted markdown code blocks
  const cleanAiResponse = (response) => {
    // Remove markdown code block markers if present
    return response
      .replace(/^```html\s*/i, '') // Remove opening ```html
      .replace(/\s*```$/i, '');     // Remove closing ```
  };

  const generateAnalysis = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Prepare data to send to AI service
      const movementsSummary = stockMovements.map(movement => ({
        date: new Date(movement.createdAt).toLocaleDateString(),
        type: movement.type === 'in' ? 'Stock In' : 'Stock Out',
        quantity: movement.quantity,
        previousStock: movement.previousStock,
        newStock: movement.newStock,
        reason: movement.reason
      }));
      
      const prompt = `As an inventory management expert, analyze these stock movements for the product "${productName}":
${JSON.stringify(movementsSummary)}

Please provide:
1. A summary of overall stock movement patterns
2. Any concerning trends or issues identified
3. Recommendations for inventory management
4. Prediction of future stock needs based on current patterns

Format your response as HTML with proper headings (<h3>), paragraphs (<p>), and lists (<ul>, <li>) for better readability.
DO NOT include markdown code block markers (like \`\`\`html or \`\`\`) in your response.`;

      const requestData = {
        prompt,
        userName: 'Inventory Manager',
        userContext: 'Analyzing stock movement data for business insights',
        outputFormat: 'html',
        structuredOutput: false
      };
      
      const response = await generateAiResponse(requestData);
      // Clean the response before setting it
      setAnalysis(cleanAiResponse(response.response));
      setShowAnalysis(true);
    } catch (err) {
      console.error('Error generating AI analysis:', err);
      setError('Failed to generate analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAnalysis = () => {
    if (showAnalysis) {
      setShowAnalysis(false);
    } else if (analysis) {
      setShowAnalysis(true);
    } else {
      generateAnalysis();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#16221D]/5 p-6 mb-8 overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <div className="p-2 bg-[#4D6E60]/10 rounded-lg mr-3">
            <svg className="w-5 h-5 text-[#4D6E60]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
          <h2 className="text-xl font-bold text-[#16221D]">AI Stock Analysis</h2>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={toggleAnalysis}
          disabled={loading}
          className="px-5 py-2.5 bg-[#4D6E60] text-white rounded-lg font-semibold text-sm hover:bg-[#678E7D] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing...
            </>
          ) : showAnalysis ? 'Hide Analysis' : analysis ? 'Show Analysis' : 'Generate Analysis'}
        </motion.button>
      </div>
      
      <AnimatePresence mode="wait">
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-4 bg-[#B47134]/10 border border-[#B47134]/20 text-[#B47134] rounded-lg text-sm font-medium"
          >
            {error}
          </motion.div>
        )}
        
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-12"
          >
            <div className="relative w-16 h-16">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-[#4D6E60]/20 rounded-full"></div>
              <div className="absolute top-0 left-0 w-full h-full border-4 border-[#4D6E60] rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="mt-4 text-[#2D3E37]/70 font-medium">Analyzing patterns & generating insights...</p>
          </motion.div>
        )}
        
        {showAnalysis && analysis && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 bg-[#F5F7F4]/50 p-6 rounded-xl border border-[#16221D]/5"
          >
            <div 
              className="prose prose-sm max-w-none prose-headings:text-[#16221D] prose-p:text-[#2D3E37]/80 prose-li:text-[#2D3E37]/80 prose-strong:text-[#16221D] prose-strong:font-semibold" 
              dangerouslySetInnerHTML={{ __html: analysis }}
            ></div>
          </motion.div>
        )}
        
        {!loading && !showAnalysis && !error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-start p-5 bg-[#F5F7F4]/30 rounded-xl border border-[#16221D]/5 mt-4"
          >
            <svg className="w-5 h-5 text-[#4D6E60] mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <div>
              <p className="text-[#16221D] font-medium text-sm">Ready to generate insights</p>
              <p className="mt-1 text-sm text-[#2D3E37]/70">Click the "Generate Analysis" button to get AI-powered insights about patterns, trends, and future stock predictions for this product.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StockMovementAiAnalysis;
