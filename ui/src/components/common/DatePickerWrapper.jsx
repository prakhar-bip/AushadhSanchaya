import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { format, parseISO, isValid } from 'date-fns';
import GlobalCalendar from './GlobalCalendar';

const DatePickerWrapper = ({ 
  id, 
  name, 
  value, 
  onChange, 
  required, 
  placeholder, 
  className,
  disabled
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close calendar if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Safely parse incoming value (expected YYYY-MM-DD) to a Date object
  const getSelectedDate = () => {
    if (!value) return null;
    const parsed = parseISO(value);
    return isValid(parsed) ? parsed : null;
  };

  const handleDateSelect = (date) => {
    if (onChange) {
      // Simulate synthetic event for compatibility with standard handleChange functions
      onChange({
        target: {
          name: name,
          value: format(date, 'yyyy-MM-dd')
        }
      });
    }
    setIsOpen(false);
  };

  // Convert Date object to readable display format
  const displayValue = getSelectedDate() ? format(getSelectedDate(), 'MMM dd, yyyy') : '';

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Hidden native input for required validation */}
      <input 
        type="hidden" 
        id={id}
        name={name} 
        value={value || ''} 
        required={required} 
      />

      <div 
        className={`flex items-center cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className || ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={displayValue ? '' : 'opacity-70'}>
          {displayValue || placeholder || 'Select date...'}
        </span>
        <svg className="w-5 h-5 ml-auto opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 mt-2 left-0"
          >
            <GlobalCalendar 
              selectedDate={getSelectedDate()} 
              onDateSelect={handleDateSelect} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DatePickerWrapper;
