import React from 'react';
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  BarChart3, 
  Network, 
  Boxes, 
  FileText,
  ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import { View } from '../types';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'map', label: 'District Map', icon: MapIcon },
  { id: 'comparison', label: 'Scheme Comparison', icon: BarChart3 },
  { id: 'rules', label: 'Association Rules', icon: Network },
  { id: 'clusters', label: 'District Clusters', icon: Boxes },
  { id: 'report', label: 'Coverage Report', icon: FileText },
];

export default function Sidebar({ currentView, setCurrentView }: SidebarProps) {
  return (
    <div className="w-64 bg-slate-900 text-white h-full flex flex-col border-r border-slate-800">
      <div className="p-6">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          Welfare Analyzer
        </h1>
        <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">
          Karnataka State Portal
        </p>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as View)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group",
                isActive 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" 
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} className={cn(isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300")} />
                {item.label}
              </div>
              {isActive && <ChevronRight size={14} className="text-blue-200" />}
            </button>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <p className="text-[10px] text-slate-500 uppercase font-bold text-center">
            Dept. of Social Welfare
          </p>
          <div className="mt-2 flex justify-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] text-slate-400 italic">System Live</span>
          </div>
        </div>
      </div>
    </div>
  );
}
