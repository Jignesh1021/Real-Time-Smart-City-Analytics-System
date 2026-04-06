import React from 'react';
import { motion } from 'framer-motion';

const MetricCard = ({ label, value, unit, icon: Icon, color, delay = 0 }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-card p-6 flex items-center gap-4 hover:border-slate-700 transition-colors cursor-default group"
    >
      <div className={`p-3 rounded-xl bg-slate-800/50 ${color} group-hover:scale-110 transition-transform`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-slate-400 text-sm font-medium">{label}</p>
        <div className="flex items-baseline gap-1">
          <span className={`text-2xl font-bold ${color}`}>{value}</span>
          <span className="text-slate-500 text-xs font-mono">{unit}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default MetricCard;
