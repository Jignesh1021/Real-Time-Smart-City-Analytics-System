import React, { useState, useEffect, useRef } from 'react';
import { Wind, Thermometer, Droplets, Car, RefreshCw, Bell } from 'lucide-react';
import MetricCard from './components/MetricCard';
import TrendChart from './components/TrendChart';
import AlertPanel from './components/AlertPanel';
import PredictionWidget from './components/PredictionWidget';
import CitySelector from './components/CitySelector';

const App = () => {
  const [data, setData] = useState([]);
  const [liveData, setLiveData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [status, setStatus] = useState('connecting');
  const [activeCity, setActiveCity] = useState('Delhi');
  const ws = useRef(null);

  // Clear data and re-fetch history when activeCity changes
  useEffect(() => {
    setLiveData(null);
    setData([]);
    
    fetch(`http://localhost:8000/history?city_name=${activeCity}`)
      .then(res => res.json())
      .then(history => {
        setData(history.reverse().map(item => ({
          ...item,
          traffic: item.traffic_density // Map for chart
        })));
      });
  }, [activeCity]);

  useEffect(() => {
    const connectWS = () => {
      ws.current = new WebSocket('ws://localhost:8000/ws');
      
      ws.current.onopen = () => setStatus('online');
      ws.current.onclose = () => {
        setStatus('offline');
        setTimeout(connectWS, 3000);
      };

      ws.current.onmessage = (event) => {
        const newData = JSON.parse(event.data);
        
        // Only update if the message is for the active city
        if (newData.city === activeCity) {
          setLiveData(newData);
          setData(prev => [...prev.slice(-19), newData]);
          
          if (newData.aqi > 200) {
            addAlert('Severe Pollution Spike', `${activeCity} AQI has reached ${newData.aqi}. Implement Emergency Protocol.`);
          }
        }
      };
    };

    connectWS();
    return () => ws.current?.close();
  }, [activeCity]); // Re-bind listener prefix for clarity

  const addAlert = (title, message) => {
    const id = Date.now();
    setAlerts(prev => [{ id, title, message }, ...prev].slice(0, 5));
  };

  const getAQIColor = (aqi) => {
    if (aqi <= 50) return 'text-emerald-400';
    if (aqi <= 100) return 'text-yellow-400';
    if (aqi <= 200) return 'text-orange-400';
    return 'text-rose-400';
  };

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-8 max-w-7xl mx-auto backdrop-blur-3xl">
      {/* Dynamic Navigation */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-4 border-b border-slate-800/50">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-extrabold gradient-text tracking-tighter">Global Hub</h1>
            <p className="text-slate-500 text-xs font-semibold flex items-center gap-2 mt-1 uppercase tracking-widest">
              <span className={`w-3 h-3 rounded-full ${status === 'online' ? 'bg-emerald-500 animate-pulse-subtle' : 'bg-rose-500'}`} />
              System Status: {status}
            </p>
          </div>
          <CitySelector activeCity={activeCity} onCityChange={setActiveCity} />
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:block text-right mr-2">
            <p className="text-[10px] text-slate-500 font-bold uppercase">Active Feed</p>
            <p className="text-sm font-bold text-sky-400">{activeCity.toUpperCase()}</p>
          </div>
          <button className="glass-card px-5 py-2.5 flex items-center gap-3 hover:bg-slate-800 transition-all text-sm font-bold border-l-2 border-l-sky-500">
            <RefreshCw size={16} className={status === 'connecting' ? 'animate-spin' : ''} />
            REFRESH
          </button>
          <div className="relative glass-card p-2.5 cursor-pointer hover:bg-slate-800 transition-all border-l-2 border-l-rose-500">
            <Bell size={20} className="text-slate-400" />
            {alerts.length > 0 && <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 rounded-full border-2 border-slate-900 animate-bounce" />}
          </div>
        </div>
      </header>

      {/* Primary Metrics Layer */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          label="Regional AQI" 
          value={liveData?.aqi || '--'} 
          unit="AQI" 
          icon={Wind} 
          color={getAQIColor(liveData?.aqi)} 
          delay={0.1}
        />
        <MetricCard 
          label="Traffic Congestion" 
          value={liveData?.traffic?.toFixed(1) || '--'} 
          unit="%" 
          icon={Car} 
          color="text-indigo-400" 
          delay={0.2}
        />
        <MetricCard 
          label="Ambient Temp" 
          value={liveData?.temp?.toFixed(1) || '--'} 
          unit="°C" 
          icon={Thermometer} 
          color="text-orange-400" 
          delay={0.3}
        />
        <MetricCard 
          label="Wind Velocity" 
          value={liveData?.wind_speed?.toFixed(1) || '--'} 
          unit="km/h" 
          icon={Droplets} 
          color="text-cyan-400" 
          delay={0.4}
        />
      </section>

      {/* Main Analytics Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          <TrendChart 
            data={data} 
            primaryKey="aqi" 
            secondaryKey="traffic" 
            title={`${activeCity} Environmental Dynamics Stream`} 
          />
          <PredictionWidget liveData={liveData} />
        </div>

        <div className="lg:col-span-1">
          <AlertPanel alerts={alerts} />
        </div>
      </div>
      
      <footer className="pt-8 text-center border-t border-slate-800/50">
        <p className="text-[10px] text-slate-600 font-mono tracking-widest uppercase mb-1">
          Smart City Registry v2.5.0 • {activeCity.toUpperCase()} NODE
        </p>
      </footer>
    </div>
  );
};

export default App;
