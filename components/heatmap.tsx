
const size = 13;

// generate 13x13 data (you can replace with real data later)
const data = Array.from({ length: size }, () =>
  Array.from({ length: size }, () => Math.floor(Math.random() * 10))
);

const getColor = (value: number) => {
  if (value >= 8) return "#065f46"; // dark green
  if (value >= 6) return "#10b981";
  if (value >= 4) return "#facc15";
  if (value >= 2) return "#fb923c";
  return "#dc2626"; // red
};

export default function Heatmap() {
  return (
    <div className="flex justify-center mt-10">
      <div>
        <h2 className="text-xl font-semibold mb-4 text-center">
          Garbage Heatmap (13×13 Grid)
        </h2>

        {/* 13x13 GRID */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${size}, 45px)`,
          }}
        >
          {data.map((row, i) =>
            row.map((value, j) => (
              <div
                key={`${i}-${j}`}
                style={{
                  width: "45px",
                  height: "45px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: getColor(value),
                  color: "white",
                  fontSize: "12px",
                  fontWeight: "bold",
                  border: "1px solid #d1d5db",
                }}
              >
                {value}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}