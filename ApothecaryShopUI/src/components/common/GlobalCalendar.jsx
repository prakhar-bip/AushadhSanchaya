import React, { useState } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays 
} from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

const GlobalCalendar = ({ selectedDate, onDateSelect }) => {
  const [currentDate, setCurrentDate] = useState(selectedDate || new Date());
  const [direction, setDirection] = useState(0);

  const nextMonth = () => {
    setDirection(1);
    setCurrentDate(addMonths(currentDate, 1));
  };

  const prevMonth = () => {
    setDirection(-1);
    setCurrentDate(subMonths(currentDate, 1));
  };

  const onDateClick = (day) => {
    if (onDateSelect) {
      onDateSelect(day);
    }
  };

  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center mb-4">
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={prevMonth}
          className="p-2 rounded-full hover:bg-[#F5F7F4] text-[#4D6E60] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        </motion.button>
        <div className="text-lg font-bold text-[#16221D]">
          {format(currentDate, 'MMMM yyyy')}
        </div>
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={nextMonth}
          className="p-2 rounded-full hover:bg-[#F5F7F4] text-[#4D6E60] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
        </motion.button>
      </div>
    );
  };

  const renderDays = () => {
    const days = [];
    const dateFormat = "EEE";
    let startDate = startOfWeek(currentDate);

    for (let i = 0; i < 7; i++) {
      days.push(
        <div className="text-center text-xs font-semibold text-[#2D3E37]/70 uppercase tracking-wider py-2" key={i}>
          {format(addDays(startDate, i), dateFormat)}
        </div>
      );
    }

    return <div className="grid grid-cols-7 mb-2">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    const variants = {
      enter: (direction) => ({
        x: direction > 0 ? 50 : -50,
        opacity: 0
      }),
      center: {
        zIndex: 1,
        x: 0,
        opacity: 1
      },
      exit: (direction) => ({
        zIndex: 0,
        x: direction < 0 ? 50 : -50,
        opacity: 0
      })
    };

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, "d");
        const cloneDay = day;
        
        const isSelected = selectedDate && isSameDay(day, selectedDate);
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isToday = isSameDay(day, new Date());

        days.push(
          <div className="p-1" key={day}>
            <motion.div
              whileHover={{ scale: isCurrentMonth ? 1.1 : 1 }}
              whileTap={{ scale: isCurrentMonth ? 0.9 : 1 }}
              onClick={() => onDateClick(cloneDay)}
              className={`
                flex items-center justify-center h-10 w-10 rounded-full text-sm font-medium transition-colors cursor-pointer mx-auto
                ${!isCurrentMonth ? "text-[#2D3E37]/30 cursor-default" : ""}
                ${isCurrentMonth && !isSelected && !isToday ? "text-[#16221D] hover:bg-[#F5F7F4]" : ""}
                ${isToday && !isSelected ? "bg-[#4D6E60]/10 text-[#4D6E60] font-bold border border-[#4D6E60]/20" : ""}
                ${isSelected ? "bg-[#B47134] text-white font-bold shadow-md shadow-[#B47134]/30" : ""}
              `}
            >
              {formattedDate}
            </motion.div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day}>
          {days}
        </div>
      );
      days = [];
    }

    return (
      <div className="relative overflow-hidden min-h-[16rem]">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={currentDate.toString()}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute w-full"
          >
            {rows}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#16221D]/5 p-6 w-full max-w-md mx-auto">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
};

export default GlobalCalendar;
