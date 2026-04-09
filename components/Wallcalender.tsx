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

  let textColor = "text-slate-700 font-medium";
  if (!isCurrentMonth) textColor = "text-slate-200"; // Very light for outside month
  else if (isWeekend && !isSelectedStart && !isSelectedEnd) textColor = "text-sky-400 font-semibold";

  return (
    <div 
      key={i} 
      className={`relative aspect-square flex items-center justify-center group border-r border-b border-slate-50 transition-colors
        ${isSelectedRange ? "bg-sky-50/30" : "bg-transparent"}
      `}
    >
      {/* SEAMLESS RANGE BACKGROUND (Very low opacity bridge) */}
      {isSelectedRange && (
        <div className={`absolute inset-y-0 bg-sky-100/20 z-0
          ${isSelectedStart ? "left-1/2" : "left-0"} 
          ${isSelectedEnd ? "right-1/2" : "right-0"}
        `} />
      )}

      {/* DATE BOX */}
      <button
        onClick={() => handleDateClick(day)}
        className={`
          relative z-10 w-full h-full flex flex-col items-center justify-center transition-all duration-300
          ${textColor}
          ${isSelectedStart || isSelectedEnd 
            ? "bg-[#1ea0db] !text-white shadow-xl rounded-md scale-90 z-20" 
            : "hover:bg-slate-100"} 
        `}
      >
        <span className="text-xs md:text-sm font-semibold tracking-tight">
          {format(day, "d")}
        </span>
        
        {/* HOLIDAY DOT (Bottom Right) */}
        {holiday && (
          <span className={`absolute bottom-1 right-1 w-1 h-1 rounded-full
            ${isSelectedStart || isSelectedEnd ? 'bg-white' : 'bg-orange-300'}
          `} />
        )}
      </button>

      {/* PRETTIER TOOLTIP */}
      {holiday && (
        <div className="absolute bottom-[105%] hidden group-hover:flex flex-col items-center z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-slate-900/90 backdrop-blur-sm text-white text-[9px] px-2 py-1 rounded shadow-xl border border-white/10">
             {holiday.name}
          </div>
          <div className="w-1.5 h-1.5 bg-slate-900/90 rotate-45 -mt-[4px]" />
        </div>
      )}
    </div>
  );
});
  };

  return (
    <div className="bg-[#e2e8f0] flex items-center justify-center  md:p-12 font-sans">
      
      {/* Main Calendar Card */}
      <div className="w-full max-w-2xl bg-white shadow-2xl overflow-hidden flex flex-col relative">
     <div className="card">
  {/* Layer 1: The Image */}
  <img src="../hero.png" className="image" alt="Hero" />
  
  <div className="absolute bottom-40 right-5 md:bottom-30 md:right-4 text-right text-white z-20 drop-shadow-lg">
    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter -mb-1 opacity-90">
      {format(currentMonth, "yyyy")}
    </h2>

    <div className="flex items-center justify-end gap-3">
      {loading && <Loader2 size={24} className="animate-spin text-sky-100" />}
      <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">
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
              className="w-full flex-1 min-h-[250px] resize-none bg-transparent border-none focus:outline-none focus:ring-0 p-0 text-slate-700 placeholder:text-transparent no-scrollbar"
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
            <div className="grid grid-cols-7 gap-y-2 gap-x-1 shadow-lg">
              {renderDays()}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}