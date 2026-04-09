"use client";

import React, { useState } from "react";
import { 
  format, addMonths, subMonths, startOfMonth, endOfMonth, 
  startOfWeek, endOfWeek, addDays, isSameDay, isWithinInterval, isBefore 
} from "date-fns";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useHolidays } from "@/hooks/holyday";
import { Tooltip } from "./ui/tooltip";

type Holiday = { 
  name: string; 
  description?: string;
  date: { iso: string; }; 
};
export default function WallCalendarChallenge() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [range, setRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });
  const [notes, setNotes] = useState<string>("");

  const currentYear = currentMonth.getFullYear();
  const { holidays, loading, error } = useHolidays(currentYear, "IN");

  // --- Range Selection Logic ---
  const handleDateClick = (day: Date) => {
    if (!range.start || (range.start && range.end)) {
      setRange({ start: day, end: null });
    } else if (isBefore(day, range.start)) {
      setRange({ start: day, end: null });
    } else {
      setRange({ ...range, end: day });
    }
  };

  const isInRange = (day: Date) => {
    if (!range.start || !range.end) return false;
    return isWithinInterval(day, { start: range.start, end: range.end });
  };

  // --- Calendar Grid Generation ---
  const renderDays = () => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
    const dayArray = [];
    let curr = start;

    while (curr <= end) {
      dayArray.push(curr);
      curr = addDays(curr, 1);
    }

    return dayArray.map((day, i) => {
      const isSelectedStart = range.start && isSameDay(day, range.start);
      const isSelectedEnd = range.end && isSameDay(day, range.end);
      const isSelectedRange = isInRange(day);
      const isCurrentMonth = isSameDay(startOfMonth(day), startOfMonth(currentMonth));
      
      const isWeekend = day.getDay() === 0 || day.getDay() === 6;
      const dayString = format(day, "yyyy-MM-dd");
      const holiday = Array.isArray(holidays) 
        ? holidays.find((h: Holiday) => h.date.iso.split('T')[0] === dayString)
        : undefined;

      let textColor = "text-slate-800 font-medium";
      if (!isCurrentMonth) textColor = "text-slate-300";
      else if (isWeekend) textColor = "text-[#1ea0db] font-semibold";

      return (
        <div key={i} className="relative h-10 md:h-12 flex items-center justify-center group">
          {/* Seamless Range Background */}
          {isSelectedRange && !isSelectedStart && !isSelectedEnd && (
            <div className="absolute inset-0 bg-[#e8f6fc]" />
          )}
          {isSelectedStart && range.end && (
            <div className="absolute inset-y-0 right-0 w-1/2 bg-[#e8f6fc]" />
          )}
          {isSelectedEnd && range.start && (
            <div className="absolute inset-y-0 left-0 w-1/2 bg-[#e8f6fc]" />
          )}

          {/* Date Button */}
          <button
            onClick={() => handleDateClick(day)}
            className={`
              relative z-10 w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full text-sm md:text-base transition-all duration-200
              ${textColor}
              ${isSelectedStart || isSelectedEnd ? "bg-[#1ea0db] !text-white shadow-md shadow-sky-200 scale-105" : "hover:bg-slate-50"}
            `}
          >
            {format(day, "d")}
            
            {/* Holiday Dot */}
            {holiday && (
              <span className={`absolute bottom-0.5 w-1 h-1 rounded-full ${isSelectedStart || isSelectedEnd ? 'bg-white' : 'bg-orange-400'}`} />
            )}
          </button>

          {/* Holiday Tooltip */}
          {holiday && (
            <div className="absolute bottom-full hidden group-hover:block z-50 w-max max-w-[140px] bg-slate-800 text-white text-[10px] px-2 py-1.5 rounded shadow-lg text-center pointer-events-none">
             <Tooltip>{holiday.name}</Tooltip>
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="bg-[#e2e8f0] flex items-center justify-center  md:p-12 font-sans">
      
      {/* Main Calendar Card */}
      <div className="w-full max-w-4xl bg-white shadow-2xl overflow-hidden flex flex-col relative">
     <div className="card">
  {/* Layer 1: The Image */}
  <img src="../hero.jpeg" className="image" alt="Hero" />
  
  {/* Layer 2: The Shapes (Decorative) */}
  <div className="blue-shape"></div> {/* Optional accent */}
  
  {/* Layer 3: The Content (Z-index 20 keeps it above the white shape) */}
  <div className="absolute bottom-6 right-8 md:bottom-10 md:right-10 text-right text-white z-20 drop-shadow-lg">
    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter -mb-1 opacity-90">
      {format(currentMonth, "yyyy")}
    </h2>

    <div className="flex items-center justify-end gap-3">
      {loading && <Loader2 size={24} className="animate-spin text-sky-100" />}
      <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter leading-none">
        {format(currentMonth, "MMMM")}
      </h1>
    </div>
  </div>
</div>
        {/* --- BOTTOM CONTENT AREA (Notes + Calendar) --- */}
        <div className="flex flex-col md:flex-row gap-10 md:gap-16 p-8 md:p-12 bg-white  z-10">
          
          {/* LEFT: Notes Area */}
          <div className="w-full md:w-5/12 flex flex-col">
            <div className="flex justify-between items-end mb-4">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Notes</h2>
              
              {/* Added subtle Navigation Arrows here so they don't break the layout */}
              <div className="flex gap-2 text-slate-300">
                <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="hover:text-[#1ea0db] transition-colors"><ChevronLeft size={20}/></button>
                <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="hover:text-[#1ea0db] transition-colors"><ChevronRight size={20}/></button>
              </div>
            </div>

            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{
                lineHeight: '2.5rem',
                backgroundImage: 'repeating-linear-gradient(transparent, transparent 2.4rem, #cbd5e1 2.4rem, #cbd5e1 2.5rem)',
                backgroundAttachment: 'local'
              }}
              className="w-full flex-1 min-h-[250px] resize-none bg-transparent border-none focus:outline-none focus:ring-0 p-0 text-slate-700 placeholder:text-transparent"
            />
          </div>

          {/* RIGHT: Calendar Grid Area */}
          <div className="w-full md:w-7/12">
            {/* Days of Week Header */}
            <div className="grid grid-cols-7 text-center mb-4">
              {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((d, i) => (
                <span 
                  key={d} 
                  className={`text-[10px] font-bold tracking-wider mb-2 ${i >= 5 ? 'text-[#1ea0db]' : 'text-slate-800'}`}
                >
                  {d}
                </span>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-y-2 gap-x-1">
              {renderDays()}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}