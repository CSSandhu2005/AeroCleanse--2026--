// Mock garbage detection generator

export interface GarbageDetection {
  id: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  altitude: number;
  confidence: number; // 0-100
  severity: "critical" | "warning" | "info";
  detectionType: string; // Garbage_TYPE_A, etc.
  imageUrl: string;
  zone: string;
  droneId?: string;
}

const DETECTION_TYPES = [
  "Plastic_Bag",
  "Metal_Can",
  "Glass_Bottle",
  "Organic_Waste",
  "Mixed_Garbage",
];

const ZONES = ["Zone_1", "Zone_2", "Zone_3", "Zone_4", "Zone_5"];

// Mock camera feed images (using placeholder service)
const MOCK_IMAGES = [
  "https://via.placeholder.com/400x300/FF6B6B/FFFFFF?text=Garbage+Detection",
  "https://via.placeholder.com/400x300/FFA500/FFFFFF?text=Waste+Detected",
  "https://via.placeholder.com/400x300/DC143C/FFFFFF?text=Critical+Alert",
];

/**
 * Generate a realistic mock garbage detection event
 */
export function generateMockDetection(): GarbageDetection {
  const confidence = Math.floor(Math.random() * 30) + 70; // 70-99%
  const severity =
    confidence > 90 ? "critical" : confidence > 80 ? "warning" : "info";

  // Simulate GPS coordinates within a demo area (San Francisco area)
  const baseLatitude = 37.7749 + (Math.random() - 0.5) * 0.01;
  const baseLongitude = -122.4194 + (Math.random() - 0.5) * 0.01;
  const altitude = Math.floor(Math.random() * 200) + 50; // 50-250m

  return {
    id: `detection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    latitude: parseFloat(baseLatitude.toFixed(4)),
    longitude: parseFloat(baseLongitude.toFixed(4)),
    altitude,
    confidence,
    severity,
    detectionType: DETECTION_TYPES[Math.floor(Math.random() * DETECTION_TYPES.length)],
    imageUrl: MOCK_IMAGES[Math.floor(Math.random() * MOCK_IMAGES.length)],
    zone: ZONES[Math.floor(Math.random() * ZONES.length)],
  };
}

/**
 * Get severity color for badge
 */
export function getSeverityColor(
  severity: "critical" | "warning" | "info"
): string {
  switch (severity) {
    case "critical":
      return "bg-red-700 text-white";
    case "warning":
      return "bg-orange-600 text-white";
    case "info":
      return "bg-yellow-600 text-white";
    default:
      return "bg-gray-700 text-white";
  }
}

/**
 * Get severity icon emoji
 */
export function getSeverityIcon(
  severity: "critical" | "warning" | "info"
): string {
  switch (severity) {
    case "critical":
      return "🚨";
    case "warning":
      return "⚠️";
    case "info":
      return "ℹ️";
    default:
      return "📍";
  }
}

/**
 * Format GPS coordinates for display
 */
export function formatGPS(lat: number, lon: number): string {
  return `${lat.toFixed(4)}°N, ${Math.abs(lon).toFixed(4)}°${lon < 0 ? "W" : "E"}`;
}

/**
 * Generate Google Maps URL from coordinates
 */
export function getMapURL(lat: number, lon: number): string {
  return `https://www.google.com/maps/search/${lat},${lon}`;
}
