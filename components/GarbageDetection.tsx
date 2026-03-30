"use client";

import { useEffect, useState } from "react";

export default function GarbageDetection() {
  const [data, setData] = useState({
    count: 0,
    status: "Loading...",
  });

  useEffect(() => {
    const interval = setInterval(() => {
      fetch("http://localhost:5000/api/garbage-data")
        .then((res) => res.json())
        .then((data) => setData(data))
        .catch((err) => console.error(err));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">🗑️ Garbage Detection AI</h1>

      {/* VIDEO STREAM */}
      <div className="rounded-2xl overflow-hidden border border-red-500">
        <img
          src="http://localhost:5000/video-feed"
          className="w-full"
        />
      </div>

      {/* DATA */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="bg-black p-4 rounded-xl border border-red-500">
          <h2>Garbage Count</h2>
          <p className="text-xl">{data.count}</p>
        </div>

        <div className="bg-black p-4 rounded-xl border border-yellow-500">
          <h2>Status</h2>
          <p className="text-xl">{data.status}</p>
        </div>
      </div>
    </div>
  );
}