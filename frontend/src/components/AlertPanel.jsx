import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

const AlertPanel = ({ alerts }) => {
  return (
    <div className="glass-card p-6 h-full min-h-[500px]">
      <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <AlertTriangle className="text-rose-500" />
        Live System Alerts
      </h3>
      <div className="space-y-4">
        <AnimatePresence>
          {alerts.length === 0 && (
            <p className="text-slate-500 text-center py-8">No critical alerts detected in the current sector.</p>
          )}
          {alerts.map((alert) => (
            <motion.div 
              key={alert.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-4 border-l-4 border-rose-500 bg-rose-500/5 rounded-r-lg space-y-1 hover:bg-rose-500/10 transition-colors"
            >
              <h4 className="font-bold text-rose-400 text-sm">{alert.title}</h4>
              <p className="text-slate-400 text-xs leading-relaxed">{alert.message}</p>
              <span className="text-[10px] text-slate-600 font-mono italic">
                {new Date(alert.id).toLocaleTimeString()}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AlertPanel;
