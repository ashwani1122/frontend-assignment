"use client";

import React, { useState } from "react";
import { 
  format, addMonths, subMonths, startOfMonth, endOfMonth, 
  startOfWeek, endOfWeek, addDays, isSameDay, isWithinInterval, isBefore 
} from "date-fns";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useHolidays } from "@/hooks/holyday";

// --- Types ---
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
      
      // Determine if it's a weekend (0 = Sunday, 6 = Saturday)
      const isWeekend = day.getDay() === 0 || day.getDay() === 6;
      
      const dayString = format(day, "yyyy-MM-dd");
      const holiday = Array.isArray(holidays) 
        ? holidays.find((h: Holiday) => h.date.iso.split('T')[0] === dayString)
        : undefined;

      // Match the reference image text colors
      let textColor = "text-slate-800 font-medium";
      if (!isCurrentMonth) textColor = "text-slate-200";
      else if (isWeekend) textColor = "text-sky-500 font-semibold";

      return (
        <div key={i} className="relative h-12 flex items-center justify-center group">
          {/* Seamless Range Background (kept subtle for the minimalist look) */}
          {isSelectedRange && !isSelectedStart && !isSelectedEnd && (
            <div className="absolute inset-0 bg-sky-50" />
          )}
          {isSelectedStart && range.end && (
            <div className="absolute inset-y-0 right-0 w-1/2 bg-sky-50" />
          )}
          {isSelectedEnd && range.start && (
            <div className="absolute inset-y-0 left-0 w-1/2 bg-sky-50" />
          )}

          {/* Date Button */}
          <button
            onClick={() => handleDateClick(day)}
            className={`
              relative z-10 w-10 h-10 flex items-center justify-center rounded-full text-base transition-all duration-200
              ${textColor}
              ${isSelectedStart || isSelectedEnd ? "bg-sky-500 !text-white shadow-md shadow-sky-200 scale-105" : "hover:bg-slate-50"}
            `}
          >
            {format(day, "d")}
            
            {/* Holiday Dot Indicator */}
            {holiday && (
              <span className={`absolute bottom-0.5 w-1 h-1 rounded-full ${isSelectedStart || isSelectedEnd ? 'bg-white' : 'bg-orange-400'}`} />
            )}
          </button>

          {/* Holiday Tooltip */}
          {holiday && (
           
          )}
        </div>
      );
    });
  };

  return (
    <div className="bg-[#f8f9fa] flex items-center justify-center p-4 md:p-8 font-sans">
      
      <div className="w-full max-w-5xl bg-white rounded-3xl overflow-hidden flex flex-col relative">
        <img src="../hero.png" alt="" />
        <div className="flex justify-between items-end mb-12 relative z-10 px-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight">
              {format(currentMonth, "MMMM yyyy")}
            </h1>
            {loading && <Loader2 size={16} className="text-sky-500 animate-spin mt-2" />}
            {error && <p className="text-xs text-red-500 mt-1">Failed to load holidays</p>}
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} 
              className="p-2 text-slate-400 hover:text-sky-500 hover:bg-sky-50 rounded-full transition-all"
            >
              <ChevronLeft size={24}/>
            </button>
            <button 
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} 
              className="p-2 text-slate-400 hover:text-sky-500 hover:bg-sky-50 rounded-full transition-all"
            >
              <ChevronRight size={24}/>
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-12 md:gap-24 relative z-10">
          
          {/* NOTES AREA (Matches the Ruled Design) */}
          <div className="w-full md:w-5/12 flex flex-col px-4">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Notes</h2>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              // This style block creates the exact horizontal notebook lines from your image
              style={{
                lineHeight: '2.5rem',
                backgroundImage: 'repeating-linear-gradient(transparent, transparent 2.4rem, #cbd5e1 2.4rem, #cbd5e1 2.5rem)',
                backgroundAttachment: 'local'
              }}
              className="w-full flex-1 min-h-[300px] resize-none bg-transparent border-none focus:outline-none focus:ring-0 p-0 text-slate-700 placeholder:text-transparent"
            />
          </div>

          {/* CALENDAR GRID AREA */}
          <div className="w-full md:w-7/12">
            {/* Days of Week Header */}
            <div className="grid grid-cols-7 text-center mb-6">
              {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((d, i) => (
                <span 
                  key={d} 
                  // Highlight SAT and SUN in blue
                  className={`text-[11px] font-bold tracking-wider ${i >= 5 ? 'text-sky-500' : 'text-slate-800'}`}
                >
                  {d}
                </span>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-y-4 gap-x-2">
              {renderDays()}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}