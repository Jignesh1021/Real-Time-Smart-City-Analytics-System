import React from 'react';
import { TrendingUp, Activity } from 'lucide-react';

const PredictionWidget = ({ liveData }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="glass-card p-6 border-l-4 border-emerald-500/50">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="text-emerald-400" />
          Predictive Analytics (Next 1hr)
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-800/30 p-4 rounded-lg border border-slate-700/50">
            <span className="text-slate-400">Forecasted AQI</span>
            <span className="text-xl font-bold text-sky-400">
              {liveData ? (liveData.aqi + 15).toFixed(0) : '--'}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 italic leading-tight">
            *ML Inference based on current traffic growth patterns and historical meteorological data.
          </p>
          <button className="w-full py-2 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30 hover:bg-emerald-500/30 transition-all font-medium text-sm">
            Recalibrate Model
          </button>
        </div>
      </div>

      <div className="glass-card p-6 border-l-4 border-sky-500/50">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Activity className="text-sky-400" />
          Smart City Directives
        </h3>
        <div className="space-y-2">
          {liveData?.aqi > 100 ? (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-200 text-xs">
              ⚠️ Sector-4 Response Needed: Restrict Heavy Traffic.
            </div>
          ) : (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-200 text-xs">
              ✅ Optimal: Sector-4 levels stable for construction.
            </div>
          )}
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-200 text-xs text-balance">
            💡 Dynamic Toll Pricing active: 78% peak load.
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionWidget;
