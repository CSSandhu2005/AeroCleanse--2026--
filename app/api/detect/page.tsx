"use client";

import { useEffect, useState } from "react";

export default function DiseaseDetection() {
  const [data, setData] = useState({
    risk: 0,
    severity: 0,
    final_score: 0,
    status: "Loading...",
  });

  useEffect(() => {
    const interval = setInterval(() => {
      fetch("http://localhost:5000/api/ai-data")
        .then((res) => res.json())
        .then((data) => setData(data));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">🌱 Disease Detection AI</h1>

      {/* VIDEO */}
      <div className="rounded-2xl overflow-hidden border border-green-500">
        <img
          src="http://localhost:5000/video-feed"
          className="w-full"
        />
      </div>

      {/* DATA CARDS */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-black p-4 rounded-xl border border-green-500">
          <h2>Risk</h2>
          <p className="text-xl">{data.risk.toFixed(1)}%</p>
        </div>

        <div className="bg-black p-4 rounded-xl border border-yellow-500">
          <h2>Severity</h2>
          <p className="text-xl">{data.severity.toFixed(1)}%</p>
        </div>

        <div className="bg-black p-4 rounded-xl border border-red-500">
          <h2>Status</h2>
          <p className="text-xl">{data.status}</p>
        </div>
      </div>
    </div>
  );
}