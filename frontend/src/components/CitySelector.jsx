import React, { useState } from 'react';
import { Globe, Search } from 'lucide-react';

const cities = [
    "Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Surat", "Pune", "Jaipur", 
    "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam", "Patna", "Vadodara", "Ghaziabad", 
    "Ludhiana", "Agra", "Nashik", "Faridabad", "Meerut", "Rajkot", "Varanasi", "Srin श्रीनगर", "Aurangabad", "Dhanbad", 
    "Amritsar", "Navi Mumbai", "Allahabad", "Ranchi", "Howrah", "Coimbatore", "Jabalpur", "Gwalior", "Vijayawada", 
    "Jodhpur", "Madurai", "Raipur", "Kota", "Guwahati", "Chandigarh", "Solapur", "Bareilly", "Hubballi", "Mysore"
];

const CitySelector = ({ activeCity, onCityChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCities = cities.filter(city => 
    city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 glass-card px-4 py-2 border-l-2 border-l-emerald-500 cursor-pointer hover:bg-slate-800/50 transition-all active:scale-95"
      >
        <Globe size={18} className="text-emerald-400" />
        <span className="text-sm font-bold text-slate-200 uppercase tracking-wider">
          {activeCity}
        </span>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 glass-card p-2 z-50 border border-slate-700 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <input 
              autoFocus
              type="text"
              placeholder="Search City..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-800 rounded-lg py-2 pl-9 pr-4 text-xs text-white outline-none focus:border-emerald-500/50 transition-all font-medium"
            />
          </div>
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {filteredCities.map(city => (
              <div 
                key={city}
                onClick={() => {
                  onCityChange(city);
                  setIsOpen(false);
                  setSearchTerm("");
                }}
                className={`px-3 py-2 text-xs font-semibold rounded-md cursor-pointer transition-colors ${
                  activeCity === city 
                    ? 'bg-emerald-500/20 text-emerald-400' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {city.toUpperCase()}
              </div>
            ))}
            {filteredCities.length === 0 && (
              <div className="px-3 py-4 text-center text-slate-600 text-[10px] uppercase font-bold">
                No coverage in this region
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CitySelector;
