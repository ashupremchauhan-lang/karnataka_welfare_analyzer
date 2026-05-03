import React, { useEffect, useState } from 'react';
import { AssociationRule } from '../types';
import { Network, ArrowRight, Info } from 'lucide-react';

export default function AssociationRules() {
  const [rules, setRules] = useState<AssociationRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/rules')
      .then(res => res.json())
      .then(data => {
        setRules(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="flex items-center justify-center h-full">Mining association rules...</div>;

  return (
    <div className="space-y-6 animate-in zoom-in-95 duration-500">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-2xl text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <Network className="text-blue-400" size={32} />
            <h2 className="text-2xl font-bold">Welfare Co-occurrence Patterns (Apriori)</h2>
          </div>
          <p className="text-slate-400 max-w-2xl">
            Derived through relationship mining, these rules identify hidden associations between scheme utilizations. 
            High confidence suggests a strong dependency between service gaps in specific district clusters.
          </p>
        </div>
        <div className="absolute top-[-20%] right-[-5%] opacity-10">
          <Network size={300} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rules.map((rule, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-colors p-6">
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Target Segments</span>
                <p className="text-sm font-semibold text-slate-700">In districts like: <span className="text-indigo-600">{rule.districts || "Statewide Clusters"}</span></p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1 p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">If (Condition)</span>
                  <p className="text-sm font-bold text-slate-800">{rule.if}</p>
                </div>
                <div className="flex-shrink-0 text-slate-300">
                  <ArrowRight />
                </div>
                <div className="flex-1 p-3 bg-indigo-50 rounded-lg border border-indigo-100/50">
                  <span className="text-[9px] font-bold text-indigo-400 uppercase block mb-1">Then (Correlation)</span>
                  <p className="text-sm font-bold text-indigo-700">{rule.then}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-2 border-t border-slate-100">
                <div>
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Support</span>
                    <span className="text-xs font-mono font-bold text-slate-600">{(rule.support * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-400 h-full" style={{ width: `${rule.support * 100}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Confidence</span>
                    <span className="text-xs font-mono font-bold text-indigo-600">{(rule.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full" style={{ width: `${rule.confidence * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
