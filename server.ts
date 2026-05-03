import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Karnataka Districts (31)
  const districts = [
    "Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban", 
    "Bidar", "Chamarajanagar", "Chikkaballapur", "Chikkamagaluru", "Chitradurga",
    "Dakshina Kannada", "Davanagere", "Dharwad", "Gadag", "Kalaburagi",
    "Hassan", "Haveri", "Kodagu", "Kolar", "Koppal", "Mandya", "Mysuru",
    "Raichur", "Ramanagara", "Shivamogga", "Tumakuru", "Udupi", "Uttara Kannada",
    "Vijayapura", "Yadgir", "Vijayanagara"
  ];

  const schemes = [
    "PM Kisan", "PDS", "Scholarship", "MGNREGA", "Housing", "Health Insurance",
    "Midday Meal", "Pension", "Udyam Employment", "Skill Development",
    "Bhagya Jyothi", "Ksheera Bhagya"
  ];
  const years = [2021, 2022, 2023, 2024];

  // Helper to generate data with specific patterns
  const generateData = () => {
    const data: any[] = [];
    const redZoneDistricts = ["Yadgir", "Raichur", "Koppal", "Bidar", "Kalaburagi", "Bellary", "Gadag", "Chamarajanagar"];
    
    districts.forEach(district => {
      schemes.forEach(scheme => {
        years.forEach(year => {
          const isRedZone = redZoneDistricts.includes(district);
          const population = Math.floor(Math.random() * 500000) + 100000;
          const eligible = Math.floor(population * (0.1 + Math.random() * 0.3));
          
          let coverageGapScore;
          if (isRedZone) {
            coverageGapScore = 0.32 + Math.random() * 0.16; // Range: 0.32 to 0.48 (Always < 0.5)
          } else if (["Bengaluru Urban", "Dakshina Kannada", "Udupi"].includes(district)) {
            coverageGapScore = 0.78 + Math.random() * 0.18; // Range: 0.78 to 0.96
          } else {
            coverageGapScore = 0.52 + Math.random() * 0.35; // Range: 0.52 to 0.87
          }

          const actual = Math.floor(eligible * coverageGapScore);
          
          data.push({
            district,
            scheme,
            year,
            population,
            eligible,
            actual,
            coverageGapScore: Math.min(coverageGapScore, 1.0)
          });
        });
      });
    });
    return data;
  };

  const rawData = generateData();

  // API Routes
  app.get("/api/data", (req, res) => {
    res.json(rawData);
  });

  app.get("/api/rules", (req, res) => {
    const rules = [
      { 
        districts: "Raichur, Kalaburagi, Yadgir",
        if: "PDS Coverage < 50%", 
        then: "MGNREGA Coverage also low", 
        support: 0.45, 
        confidence: 0.88 
      },
      { 
        districts: "Koppal, Bidar",
        if: "Skill Development < 40%", 
        then: "Udyam Employment < 30%", 
        support: 0.32, 
        confidence: 0.79 
      },
      { 
        districts: "North Karnataka Clusters",
        if: "Midday Meal < 60%", 
        then: "Scholarship Utilization < 50%", 
        support: 0.42, 
        confidence: 0.85 
      },
      { 
        districts: "South Karnataka Clusters",
        if: "Housing Scheme > 70%", 
        then: "Health Insurance > 80%", 
        support: 0.25, 
        confidence: 0.92 
      }
    ];
    res.json(rules);
  });

  app.get("/api/clusters", (req, res) => {
    const clusters = [
      {
        id: 0,
        name: "Critically Underserved (Red Zone)",
        avgCoverage: 0.42,
        suggestion: "Immediate intervention required. Increase field audits and simplified registration.",
        districts: ["Yadgir", "Raichur", "Koppal", "Bidar", "Kalaburagi"]
      },
      {
        id: 1,
        name: "Moderately Underserved (Yellow Zone)",
        avgCoverage: 0.64,
        suggestion: "Medium-term policy restructuring. Focus on digital literacy and last-mile connectivity.",
        districts: ["Ballari", "Gadag", "Haveri", "Vijayapura", "Chamarajanagar", "Mandya", "Mysuru", "Hassan", "Tumkur", "Davanagere", "Shivamogga"]
      },
      {
        id: 2,
        name: "Well Performing (Green Zone)",
        avgCoverage: 0.88,
        suggestion: "Benchmark for other districts. Explore expansion of schemes.",
        districts: ["Bengaluru Urban", "Dakshina Kannada", "Udupi", "Kodagu", "Bengaluru Rural", "Chikkaballapur", "Udupi", "Uttara Kannada"] // Added some to green
      }
    ];
    res.json(clusters);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
