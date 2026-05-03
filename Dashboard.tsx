import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { SchemeData } from '../types';
import { TrendingUp, Users, MapPin, AlertCircle } from 'lucide-react';

interface DashboardProps {
  data: SchemeData[];
}

export default function Dashboard({ data }: DashboardProps) {
  const stats = useMemo(() => {
    if (!data.length) return null;
    
    const uniqueDistricts = new Set(data.map(d => d.district)).size;
    const uniqueSchemes = new Set(data.map(d => d.scheme)).size;
    const avgCoverage = (data.reduce((acc, curr) => acc + curr.coverageGapScore, 0) / data.length) * 100;
    
    // Latest year data for distribution
    const latestYear = Math.max(...data.map(d => d.year));
    const latestData = data.filter(d => d.year === latestYear);
    
    // Grouped by district coverage
    const districtCoverageMap = new Map<string, number[]>();
    latestData.forEach(d => {
      if (!districtCoverageMap.has(d.district)) districtCoverageMap.set(d.district, []);
      districtCoverageMap.get(d.district)!.push(d.coverageGapScore);
    });

    const districtAverages = Array.from(districtCoverageMap.entries()).map(([name, scores]) => ({
      name,
      coverage: (scores.reduce((a, b) => a + b, 0) / scores.length) * 100
    }));

    const redZoneCount = districtAverages.filter(d => d.coverage < 50).length;

    const topDistricts = [...districtAverages]
      .sort((a, b) => b.coverage - a.coverage)
      .slice(0, 10);

    const distribution = [
      { name: 'Red Zone (<50%)', value: redZoneCount, color: '#ef4444' },
      { name: 'Yellow Zone (50-75%)', value: districtAverages.filter(d => d.coverage >= 50 && d.coverage < 75).length, color: '#f59e0b' },
      { name: 'Green Zone (>75%)', value: districtAverages.filter(d => d.coverage >= 75).length, color: '#10b981' },
    ];

    return {
      uniqueDistricts,
      uniqueSchemes,
      avgCoverage: avgCoverage.toFixed(1),
      redZoneCount,
      topDistricts,
      distribution
    };
  }, [data]);

  if (!stats) return <div className="flex items-center justify-center h-full">Loading analysis...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">State Utilization Overview</h2>
          <p className="text-slate-500">Karnataka Welfare Scheme Data Aggregator</p>
        </div>
        <div className="text-xs text-slate-400 font-medium bg-slate-100 px-3 py-1 rounded-full">
          Data Updated: {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Districts', value: stats.uniqueDistricts, icon: MapPin, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Total Schemes', value: stats.uniqueSchemes, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Avg Coverage', value: `${stats.avgCoverage}%`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Red Zone Districts', value: stats.redZoneCount, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className={`p-3 rounded-lg ${stat.bg}`}>
              <stat.icon className={stat.color} size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-6">Top 10 Districts by Coverage %</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.topDistricts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                />
                <Bar dataKey="coverage" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-6">District Performance Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
