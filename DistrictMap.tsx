import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, Tooltip, CircleMarker } from 'react-leaflet';
import { SchemeData } from '../types';
import L from 'leaflet';

interface DistrictMapProps {
  data: SchemeData[];
}

// District centers for fallback if GeoJSON fails
const DISTRICT_CENTERS: Record<string, [number, number]> = {
  "Bagalkot": [16.1820, 75.6967],
  "Ballari": [15.1394, 76.9214],
  "Belagavi": [15.8497, 74.4977],
  "Bengaluru Rural": [13.2500, 77.5833],
  "Bengaluru Urban": [12.9716, 77.5946],
  "Bidar": [17.9104, 77.5199],
  "Chamarajanagar": [11.9261, 76.9437],
  "Chikkaballapur": [13.4355, 77.7290],
  "Chikkamagaluru": [13.3161, 75.7720],
  "Chitradurga": [14.2251, 76.4001],
  "Dakshina Kannada": [12.8706, 74.8827],
  "Davanagere": [14.4644, 75.9218],
  "Dharwad": [15.4589, 75.0078],
  "Gadag": [15.4227, 75.6318],
  "Kalaburagi": [17.3297, 76.8343],
  "Hassan": [13.0068, 76.1017],
  "Haveri": [14.7937, 75.3999],
  "Kodagu": [12.4244, 75.7382],
  "Kolar": [13.1363, 78.1291],
  "Koppal": [15.3463, 76.1552],
  "Mandya": [12.5218, 76.8951],
  "Mysuru": [12.2958, 76.6394],
  "Raichur": [16.2120, 77.3551],
  "Ramanagara": [12.7150, 77.2813],
  "Shivamogga": [13.9299, 75.5681],
  "Tumakuru": [13.3392, 77.1140],
  "Udupi": [13.3315, 74.7473],
  "Uttara Kannada": [14.8185, 74.1297],
  "Vijayapura": [16.8302, 75.7100],
  "Yadgir": [16.7641, 77.1352],
  "Vijayanagara": [15.2678, 76.3884]
};

const GEOJSON_URL = "https://raw.githubusercontent.com/datameet/maps/master/Karnataka/2011_Dist.json";

export default function DistrictMap({ data }: DistrictMapProps) {
  const [geoData, setGeoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(GEOJSON_URL)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(json => {
        setGeoData(json);
        setLoading(false);
      })
      .catch(err => {
        console.warn("GeoJSON load failed, using Bubble Map fallback:", err.message);
        setUsingFallback(true);
        setLoading(false);
      });
  }, []);

  const getDistrictSummary = (name: string) => {
    const normalizedName = name.trim().toLowerCase();
    const districtRecords = data.filter(d => d.district.toLowerCase() === normalizedName);
    if (!districtRecords.length) return null;
    
    const avg = districtRecords.reduce((acc, curr) => acc + curr.coverageGapScore, 0) / districtRecords.length;
    const worst = [...districtRecords].sort((a, b) => a.coverageGapScore - b.coverageGapScore)[0];
    
    return {
      avg,
      worstScheme: worst?.scheme || "N/A",
      worstScore: worst?.coverageGapScore || 0
    };
  };

  const getColor = (coverage: number | null) => {
    if (coverage === null) return '#94a3b8'; // Grey
    if (coverage < 0.5) return '#ef4444'; // Red
    if (coverage < 0.75) return '#f59e0b'; // Yellow
    return '#10b981'; // Green
  };

  if (loading) return <div className="flex items-center justify-center h-[500px]">Loading Karnataka Map...</div>;
  if (!geoData && !usingFallback) return <div className="p-10 text-center bg-rose-50 text-rose-600 rounded-xl">Error loading map boundaries. Please ensure internet access.</div>;

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Geospatial Coverage Analyst</h2>
          <p className="text-sm text-slate-500">
            {usingFallback ? "Statistical Distribution (Bubble Map)" : "Categorical distribution across Karnataka districts"}
          </p>
        </div>
        <div className="flex gap-4 items-center text-xs font-semibold">
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-rose-500" /> Critical (&lt;50%)</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-amber-500" /> Moderate (50-75%)</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-emerald-500" /> Good (&gt;75%)</div>
        </div>
      </div>

      <div className="bg-slate-200 rounded-xl overflow-hidden shadow-inner border-4 border-white h-[600px] relative">
        <MapContainer 
          center={[15.3173, 75.7139]} 
          zoom={7} 
          className="h-full w-full"
          scrollWheelZoom={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {usingFallback ? (
            Object.entries(DISTRICT_CENTERS).map(([name, coords]) => {
              const summary = getDistrictSummary(name);
              const label = summary ? `${(summary.avg * 100).toFixed(1)}%` : "No Data";
              return (
                <CircleMarker
                  key={name}
                  center={coords}
                  radius={12}
                  pathOptions={{
                    fillColor: getColor(summary?.avg || null),
                    fillOpacity: 0.8,
                    color: 'white',
                    weight: 2
                  }}
                >
                  <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                    <div className="p-1 space-y-1">
                      <p className="font-bold border-b border-slate-200 pb-1">{name}</p>
                      <p className="text-xs">Avg Coverage: <span className="font-bold">{label}</span></p>
                      {summary && (
                        <p className="text-[10px] text-rose-500 font-medium">
                          Worst: {summary.worstScheme} ({(summary.worstScore * 100).toFixed(0)}%)
                        </p>
                      )}
                    </div>
                  </Tooltip>
                </CircleMarker>
              );
            })
          ) : (
            <GeoJSON 
              data={geoData} 
              style={(feature) => {
                const name = feature.properties.DISTRICT || feature.properties.district || feature.properties.DISTRICT_N || "";
                const summary = getDistrictSummary(name);
                return {
                  fillColor: getColor(summary?.avg || null),
                  weight: 1,
                  opacity: 1,
                  color: 'white',
                  fillOpacity: 0.7
                };
              }}
              onEachFeature={(feature, layer) => {
                const name = feature.properties.DISTRICT || feature.properties.district || feature.properties.DISTRICT_N || "Unknown";
                const summary = getDistrictSummary(name);
                const label = summary ? `${(summary.avg * 100).toFixed(1)}%` : "No Data";
                
                layer.on({
                  mouseover: (e) => {
                    const l = e.target;
                    l.setStyle({ fillOpacity: 0.9, weight: 2 });
                  },
                  mouseout: (e) => {
                    const l = e.target;
                    l.setStyle({ fillOpacity: 0.7, weight: 1 });
                  }
                });
                
                layer.bindTooltip(`
                  <div class="p-1 space-y-1">
                    <p class="font-bold border-b border-slate-200 pb-1">${name}</p>
                    <p class="text-xs">Avg Coverage: <span class="font-bold">${label}</span></p>
                    ${summary ? `
                      <p class="text-[10px] text-rose-500 font-medium">
                        Worst: ${summary.worstScheme} (${(summary.worstScore * 100).toFixed(0)}%)
                      </p>
                    ` : ""}
                  </div>
                `, { sticky: true });
              }}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
}
