"use client";

import React from "react";
import { motion } from "motion/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  GarbageDetection,
  getSeverityColor,
  getSeverityIcon,
  formatGPS,
  getMapURL
} from "./DetectionAlert";

interface GarbageAlertModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  detection: GarbageDetection | null;
  onSendDrone: (detection: GarbageDetection) => void;
  onExportReport: (detection: GarbageDetection) => void;
  alertHistory: GarbageDetection[];
}

export function GarbageAlertModal({
  isOpen,
  onDismiss,
  detection,
  onSendDrone,
  onExportReport,
  alertHistory,
}: GarbageAlertModalProps) {
  if (!detection) return null;

  const handleExport = () => {
    const data = {
      detection,
      timestamp: new Date().toISOString(),
      alertCount: alertHistory.length,
    };

    const csv = `Garbage Detection Report\n${new Date().toLocaleString()}\n\nID,Type,Confidence,Severity,Latitude,Longitude,Zone,Time\n${detection.id},${detection.detectionType},${detection.confidence}%,${detection.severity},${detection.latitude},${detection.longitude},${detection.zone},${new Date(detection.timestamp).toLocaleString()}\n`;

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `garbage-alert-${detection.id}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onDismiss}>
      <DialogContent className="max-w-2xl max-h-96 overflow-y-auto bg-[#0a0a0a] border-gray-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <span className="text-3xl">{getSeverityIcon(detection.severity)}</span>
            <span className="text-white">Garbage Detected!</span>
            <span className={`ml-auto px-3 py-1 rounded-full text-sm font-bold ${getSeverityColor(detection.severity)}`}>
              {detection.severity.toUpperCase()}
            </span>
          </DialogTitle>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {/* Detection Image */}
          <div className="rounded-lg overflow-hidden border-2 border-green-500/50">
            <motion.img
              src={detection.imageUrl}
              alt="Garbage detection"
              className="w-full h-64 object-cover"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Detection Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {/* Type & Confidence */}
            <div className="bg-gray-900 p-3 rounded-lg border border-gray-800">
              <p className="text-gray-400">Detection Type</p>
              <p className="text-white font-semibold">{detection.detectionType}</p>
            </div>

            <div className="bg-gray-900 p-3 rounded-lg border border-gray-800">
              <p className="text-gray-400">Confidence</p>
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold">{detection.confidence}%</span>
                <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className={`h-full ${
                      detection.confidence > 90 ? "bg-red-500" : "bg-green-500"
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${detection.confidence}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            </div>

            {/* GPS Location */}
            <div className="bg-gray-900 p-3 rounded-lg border border-gray-800 col-span-2">
              <p className="text-gray-400">GPS Location</p>
              <p className="text-white font-mono text-sm">
                {formatGPS(detection.latitude, detection.longitude)}
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Altitude: {detection.altitude}m
              </p>
            </div>

            {/* Zone & Time */}
            <div className="bg-gray-900 p-3 rounded-lg border border-gray-800">
              <p className="text-gray-400">Zone</p>
              <p className="text-white font-semibold">{detection.zone}</p>
            </div>

            <div className="bg-gray-900 p-3 rounded-lg border border-gray-800">
              <p className="text-gray-400">Detected</p>
              <p className="text-white text-sm">
                {new Date(detection.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>

          {/* Alert History */}
          {alertHistory.length > 0 && (
            <Alert className="bg-blue-950/40 border-blue-900/50">
              <AlertDescription className="text-blue-300">
                Total Detections Today: <span className="font-bold">{alertHistory.length}</span>
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={onDismiss}
              className="flex-1 bg-gray-900 hover:bg-gray-800 border-gray-700 text-white"
            >
              Dismiss
            </Button>

            <Button
              onClick={() => onSendDrone(detection)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              📍 Send Drone
            </Button>

            <Button
              variant="outline"
              onClick={handleExport}
              className="flex-1 bg-gray-900 hover:bg-gray-800 border-gray-700 text-white"
            >
              📥 Export
            </Button>
          </div>

          {/* Map Link */}
          <a
            href={getMapURL(detection.latitude, detection.longitude)}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center text-blue-400 hover:text-blue-300 text-sm underline"
          >
            View on Google Maps
          </a>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
