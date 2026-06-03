import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const Dropdown = ({
  id,
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Select option',
  trigger,
  align = 'left',
  disabled = false,
  required = false,
  className = '',
  triggerClassName = '',
  menuClassName = '',
  children
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue) => {
    if (disabled) return;
    setIsOpen(false);
    if (onChange) {
      // Mimic a native HTML select event so it's drop-in compatible with standard onChange/handleChange
      onChange({
        target: {
          id: id || name,
          name: name || id,
          value: optionValue
        }
      });
    }
  };

  // Find label for current value
  const selectedOption = options.find(opt => String(opt.value) === String(value));
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  // Spring animation variants for smooth opening
  const menuVariants = {
    hidden: { 
      opacity: 0, 
      y: -10,
      scale: 0.95,
      transition: { duration: 0.15, ease: 'easeInOut' }
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { 
        type: 'spring', 
        stiffness: 320, 
        damping: 22 
      }
    }
  };

  return (
    <div 
      ref={dropdownRef} 
      className={`relative inline-block w-full ${className}`}
    >
      {trigger ? (
        // Custom Trigger mode (e.g. Profile Avatar Menu)
        <div 
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`cursor-pointer ${triggerClassName}`}
        >
          {trigger}
        </div>
      ) : (
        // Standard Select Mode
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`flex items-center justify-between w-full px-4 py-2.5 text-sm text-left bg-white border border-[#16221D]/10 rounded-xl shadow-sm hover:bg-[#F5F7F4] focus:outline-none focus:ring-2 focus:ring-[#4D6E60]/50 focus:border-[#4D6E60] disabled:bg-[#F5F7F4] disabled:text-[#2D3E37]/50 disabled:cursor-not-allowed cursor-pointer transition-all ${triggerClassName}`}
        >
          <span className={selectedOption ? 'text-[#16221D] font-bold' : 'text-[#2D3E37]/60 font-medium'}>
            {displayLabel}
          </span>
          <svg
            className={`w-4 h-4 ml-2 text-[#4D6E60] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={menuVariants}
            className={`absolute z-[100] mt-2 w-full min-w-[200px] bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl py-2 border border-[#16221D]/5 overflow-y-auto max-h-60 ${
              align === 'right' ? 'right-0' : 'left-0'
            } ${menuClassName}`}
          >
            {children ? (
              // Custom children render (closes on click of items)
              <div onClick={() => setIsOpen(false)}>
                {children}
              </div>
            ) : (
              // Options mapping
              options.map((option) => {
                const isSelected = String(option.value) === String(value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={`flex items-center justify-between w-full px-4 py-3 text-sm text-left hover:bg-[#4D6E60]/5 hover:text-[#4D6E60] transition-colors cursor-pointer ${
                      isSelected 
                        ? 'bg-[#4D6E60]/10 text-[#4D6E60] font-black' 
                        : 'text-[#16221D] font-medium'
                    }`}
                  >
                    <span>{option.label}</span>
                    {isSelected && (
                      <svg className="w-4 h-4 text-[#4D6E60]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dropdown;
