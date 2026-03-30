import Heatmap from "@/components/heatmap";

export default function HeatmapPage() {
  return (
    <main className="min-h-screen bg-gray-100 p-6">
      
      {/* Page Title */}
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        AeroCleanse Dashboard
      </h1>

      {/* Card Container */}
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <Heatmap />
      </div>

    </main>
  );
}