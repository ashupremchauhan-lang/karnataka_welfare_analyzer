import React, { useState, useMemo } from 'react';
import { SchemeData } from '../types';
import { Download, Filter, Search, FileText } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { cn } from '../lib/utils';

interface CoverageReportProps {
  data: SchemeData[];
}

export default function CoverageReport({ data }: CoverageReportProps) {
  const [filter, setFilter] = useState<'all' | 'red' | 'yellow' | 'green'>('all');
  const [searchTerm, setSearchTerm] = useState("");

  const latestYear = useMemo(() => Math.max(...data.map(d => d.year)), [data]);

  const reportData = useMemo(() => {
    // Group by district to get summary
    const districts = Array.from(new Set(data.map(d => d.district)));
    const latestData = data.filter(d => d.year === latestYear);

    const summaries = districts.map(d => {
      const records = latestData.filter(r => r.district === d);
      const avg = records.reduce((a, b) => a + b.coverageGapScore, 0) / records.length;
      const population = records[0]?.population || 0;
      const eligible = records.reduce((a, b) => a + b.eligible, 0);
      const actual = records.reduce((a, b) => a + b.actual, 0);
      const criticalScheme = [...records].sort((a, b) => a.coverageGapScore - b.coverageGapScore)[0];

      return {
        district: d,
        population,
        eligible,
        actual,
        score: avg,
        criticalScheme: criticalScheme?.scheme || "N/A",
        priority: avg < 0.5 ? "High" : avg < 0.75 ? "Medium" : "Low"
      };
    });

    return summaries.sort((a, b) => a.score - b.score);
  }, [data, latestYear]);

  const filteredData = useMemo(() => {
    return reportData.filter(d => {
      const matchesSearch = d.district.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;
      if (filter === 'all') return true;
      if (filter === 'red') return d.score < 0.5;
      if (filter === 'yellow') return d.score >= 0.5 && d.score < 0.75;
      if (filter === 'green') return d.score >= 0.75;
      return true;
    });
  }, [reportData, filter, searchTerm]);

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59);
    doc.text('Karnataka Welfare Scheme Coverage Audit', 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
    doc.text(`Data Year: ${latestYear} | Filter: ${filter.toUpperCase()} Zone`, 14, 35);

    const tableData = filteredData.map((d, i) => [
      i + 1,
      d.district,
      d.eligible.toLocaleString(),
      d.actual.toLocaleString(),
      `${(d.score * 100).toFixed(1)}%`,
      d.criticalScheme,
      d.score < 0.5 ? 'CRITICAL' : d.score < 0.75 ? 'MODERATE' : 'GOOD'
    ]);

    autoTable(doc, {
      startY: 42,
      head: [['#', 'District', 'Eligible', 'Actual', 'Coverage', 'Gaps Found In', 'Zone']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59], fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 10 },
        4: { fontStyle: 'bold' },
        6: { fontStyle: 'bold' }
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 6) {
          const val = data.cell.text[0];
          if (val === 'CRITICAL') data.cell.styles.textColor = [225, 29, 72];
          if (val === 'MODERATE') data.cell.styles.textColor = [217, 119, 6];
          if (val === 'GOOD') data.cell.styles.textColor = [21, 128, 61];
        }
      }
    });

    doc.save(`Karnataka_Welfare_Audit_${latestYear}.pdf`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <FileText size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Coverage Gap Intelligence</h2>
            <p className="text-sm text-slate-500">Comprehensive audit of statewide scheme penetration</p>
          </div>
        </div>
        
        <button 
          onClick={exportPDF}
          className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-slate-900/20"
        >
          <Download size={18} />
          Export Report as PDF
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search districts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex p-1 bg-slate-100 rounded-lg">
          {(['all', 'red', 'yellow', 'green'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-1.5 rounded-md text-xs font-bold uppercase transition-all",
                filter === f 
                  ? "bg-white text-slate-900 shadow-md"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              {f} Zone
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Rank</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">District Name</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Population</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Eligible</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actual</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Score</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Critical Scheme</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Priority</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredData.map((d, i) => (
              <tr key={d.district} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4 text-sm font-bold text-slate-400 group-hover:text-slate-900">#{i + 1}</td>
                <td className="px-6 py-4 text-sm font-bold text-slate-700">{d.district}</td>
                <td className="px-6 py-4 text-sm text-slate-600 text-right">{d.population.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-slate-600 text-right">{d.eligible.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-slate-600 text-right">{d.actual.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full",
                          d.score < 0.5 ? "bg-rose-500" : d.score < 0.75 ? "bg-amber-500" : "bg-emerald-500"
                        )}
                        style={{ width: `${d.score * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-700">{(d.score * 100).toFixed(0)}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 italic">{d.criticalScheme}</td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                    d.score < 0.5 ? "bg-rose-100 text-rose-600" :
                    d.score < 0.75 ? "bg-amber-100 text-amber-600" :
                    "bg-emerald-100 text-emerald-600"
                  )}>
                    {d.score < 0.5 ? "Critical" : d.score < 0.75 ? "Moderate" : "Good"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
