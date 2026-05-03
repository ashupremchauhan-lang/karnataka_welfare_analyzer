import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { SchemeData } from '../types';
import { cn } from '../lib/utils';

interface SchemeComparisonProps {
  data: SchemeData[];
}

export default function SchemeComparison({ data }: SchemeComparisonProps) {
  const schemes = useMemo(() => Array.from(new Set(data.map(d => d.scheme))), [data]);
  const districts = useMemo(() => Array.from(new Set(data.map(d => d.district))), [data]);
  const latestYear = useMemo(() => Math.max(...data.map(d => d.year)), [data]);

  const [selectedSchemes, setSelectedSchemes] = useState<string[]>(schemes.slice(0, 3));

  const districtData = useMemo(() => {
    return districts.map(district => {
      const row: any = { name: district };
      let totalScore = 0;
      selectedSchemes.forEach(scheme => {
        const d = data.find(item => item.district === district && item.scheme === scheme && item.year === latestYear);
        const score = d ? d.coverageGapScore * 100 : 0;
        row[scheme] = score;
        totalScore += score;
      });
      row.avg = selectedSchemes.length ? totalScore / selectedSchemes.length : 0;
      return row;
    }).sort((a, b) => b.avg - a.avg);
  }, [data, selectedSchemes, districts, latestYear]);

  const toggleScheme = (scheme: string) => {
    setSelectedSchemes(prev => 
      prev.includes(scheme) 
        ? prev.filter(s => s !== scheme)
        : [...prev, scheme]
    );
  };

  const getZoneColor = (score: number) => {
    if (score < 50) return '#ef4444'; // Red
    if (score < 75) return '#f59e0b'; // Yellow
    return '#10b981'; // Green
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Multi-Scheme Performance Benchmarking</h2>
        <div className="flex flex-wrap gap-2 mb-6">
          {schemes.map(scheme => (
            <button
              key={scheme}
              onClick={() => toggleScheme(scheme)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-semibold transition-all",
                selectedSchemes.includes(scheme)
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              {scheme}
            </button>
          ))}
        </div>

        <div className="h-[650px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={districtData} 
              layout="vertical"
              margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" domain={[0, 100]} unit="%" fontSize={10} />
              <YAxis 
                dataKey="name" 
                type="category" 
                fontSize={9} 
                width={100}
                tick={({ x, y, payload }) => {
                  const score = districtData.find(d => d.name === payload.value)?.avg || 0;
                  return (
                    <text x={x} y={y} dy={3} textAnchor="end" fill={getZoneColor(score)} fontSize={10} fontWeight={600}>
                      {payload.value}
                    </text>
                  );
                }}
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const avg = districtData.find(d => d.name === label)?.avg || 0;
                    return (
                      <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-xl min-w-[180px]">
                        <p className="font-bold text-slate-800 border-b pb-1 mb-2">{label}</p>
                        <div className="space-y-1">
                          {payload.map((p: any) => (
                            <div key={p.name} className="flex justify-between text-[11px]">
                              <span className="text-slate-500">{p.name}:</span>
                              <span className="font-bold" style={{ color: p.color }}>{p.value.toFixed(1)}%</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 pt-1 border-t border-slate-100 flex justify-between text-xs">
                          <span className="text-slate-400">Composite Avg:</span>
                          <span className="font-bold" style={{ color: getZoneColor(avg) }}>{avg.toFixed(1)}%</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend verticalAlign="top" height={36}/>
              {selectedSchemes.map((scheme, index) => (
                <Bar 
                  key={scheme} 
                  dataKey={scheme} 
                  name={scheme}
                  fill={`hsl(${(index * 360 / selectedSchemes.length)}, 70%, 50%)`}
                  radius={[0, 4, 4, 0]} 
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
