import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import DistrictMap from './components/DistrictMap';
import SchemeComparison from './components/SchemeComparison';
import AssociationRules from './components/AssociationRules';
import DistrictClusters from './components/DistrictClusters';
import CoverageReport from './components/CoverageReport';
import { View, SchemeData } from './types';
import { Menu, X } from 'lucide-react';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [data, setData] = useState<SchemeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    fetch('/api/data')
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch state data");
        return res.json();
      })
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard data={data} />;
      case 'map': return <DistrictMap data={data} />;
      case 'comparison': return <SchemeComparison data={data} />;
      case 'rules': return <AssociationRules />;
      case 'clusters': return <DistrictClusters data={data} />;
      case 'report': return <CoverageReport data={data} />;
      default: return <Dashboard data={data} />;
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-900 text-white font-sans">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-blue-400 font-bold tracking-widest uppercase">Initializing Analyst Engine...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-rose-50 p-10">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-rose-100 max-w-md text-center">
          <div className="text-rose-500 mb-4 inline-block p-4 bg-rose-50 rounded-full">
            <X size={48} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Backend Connection Failed</h2>
          <p className="text-slate-500 mb-6">{error}. Please ensure the server is running on port 3000.</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-all"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 flex items-center justify-between px-6 z-50 shadow-lg">
        <h1 className="text-white font-bold tracking-tight">Welfare Analyzer</h1>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-white hover:bg-slate-800 rounded-lg"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar - Desktop */}
      <div className="hidden lg:block">
        <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      </div>

      {/* Sidebar - Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="fixed inset-y-0 left-0 w-64 z-50 lg:hidden"
            >
              <Sidebar 
                currentView={currentView} 
                setCurrentView={(v) => {
                  setCurrentView(v);
                  setIsSidebarOpen(false);
                }} 
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className={cn(
        "flex-1 overflow-y-auto w-full",
        "pt-16 lg:pt-0" // Add padding for mobile header
      )}>
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <footer className="max-w-7xl mx-auto px-8 py-10 border-t border-slate-200 mt-10 text-center">
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-[0.2em] border-t border-slate-100 pt-8">
            &copy; 2026 Karnataka State Welfare Analytics. All rights reserved.
          </p>
        </footer>
      </main>
    </div>
  );
}
