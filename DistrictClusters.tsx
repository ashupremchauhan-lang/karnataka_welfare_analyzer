import React, { useEffect, useState, useMemo } from 'react';
import { Cluster, SchemeData } from '../types';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from 'recharts';
import { Boxes, Map as MapIcon, Lightbulb } from 'lucide-react';
import { cn } from '../lib/utils';

interface DistrictClustersProps {
  data: SchemeData[];
}

export default function DistrictClusters({ data }: DistrictClustersProps) {
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/clusters')
      .then(res => res.json())
      .then(d => {
        setClusters(d);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const scatterData = useMemo(() => {
    if (!data.length || !clusters.length) return [];
    const latestYear = Math.max(...data.map(d => d.year));
    const districts = Array.from(new Set(data.map(d => d.district)));
    
    return districts.map(d => {
      const records = data.filter(r => r.district === d && r.year === latestYear);
      const avgCoverage = records.reduce((a, b) => a + b.coverageGapScore, 0) / records.length;
      const population = records[0]?.population || 0;
      
      // Find which cluster this district belongs to
      const cluster = clusters.find(c => c.districts.includes(d));
      
      return {
        name: d,
        x: population / 1000, 
        y: avgCoverage * 100,
        z: 200,
        clusterId: cluster?.id ?? 2,
        clusterName: cluster?.name ?? 'Unknown'
      };
    });
  }, [data, clusters]);

  const getClusterColor = (id: number) => {
    switch(id) {
      case 0: return '#ef4444'; // Red
      case 1: return '#f59e0b'; // Yellow
      case 2: return '#10b981'; // Green
      default: return '#94a3b8';
    }
  };

  if (loading) return <div className="flex items-center justify-center h-full">Performing K-Means clustering...</div>;

  return (
    <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-6">
        <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600">
          <Boxes size={40} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Cluster-based Segmentation</h2>
          <p className="text-slate-500">Multivariate grouping of districts based on coverage metrics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scatter Plot */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-6">Population Density vs. Coverage Score</h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" dataKey="x" name="Population" unit="k" label={{ value: 'Population (k)', position: 'insideBottom', offset: -10 }} />
                <YAxis type="number" dataKey="y" name="Coverage" unit="%" label={{ value: 'Coverage %', angle: -90, position: 'insideLeft' }} />
                <ZAxis type="number" dataKey="z" range={[50, 400]} />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }} 
                  content={({ payload }) => {
                    if (payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-xl">
                          <p className="font-bold text-slate-800">{d.name}</p>
                          <p className="text-xs text-slate-500">Population: {d.x}k</p>
                          <p className="text-xs text-slate-500">Avg Coverage: {d.y.toFixed(1)}%</p>
                          <p className="text-xs font-bold mt-1" style={{ color: getClusterColor(d.clusterId) }}>{d.clusterName}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {clusters.map((cluster) => (
                  <Scatter 
                    key={cluster.id}
                    name={cluster.name} 
                    data={scatterData.filter(d => d.clusterId === cluster.id)} 
                    fill={getClusterColor(cluster.id)} 
                    fillOpacity={0.7} 
                  />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cluster List */}
        <div className="space-y-4 max-h-[460px] overflow-y-auto pr-2 custom-scrollbar">
          {clusters.map((cluster) => (
            <div 
              key={cluster.id} 
              className={cn(
                "p-5 rounded-xl border-l-4 shadow-sm bg-white transition-all hover:scale-[1.02]",
                cluster.id === 0 ? "border-l-red-500" :
                cluster.id === 1 ? "border-l-amber-500" :
                "border-l-emerald-500"
              )}
            >
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-bold text-slate-800">{cluster.name}</h4>
                <div className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Avg: {(cluster.avgCoverage * 100).toFixed(0)}%
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1.5 mb-4">
                {cluster.districts.map(d => (
                  <span key={d} className="inline-flex items-center gap-1 px-2 py-1 bg-slate-50 border border-slate-100 rounded text-[11px] font-medium text-slate-600">
                    <MapPin size={10} /> {d}
                  </span>
                ))}
              </div>

              <div className="flex gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <Lightbulb size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-600 leading-relaxed italic">
                  <strong>Action:</strong> {cluster.suggestion}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MapPin({ size }: { size: number }) {
  return <MapIcon size={size} />;
}
