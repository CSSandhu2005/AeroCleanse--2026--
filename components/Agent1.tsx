"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  generateMockDetection,
  GarbageDetection,
  getSeverityIcon,
} from "./alerts/DetectionAlert";
import { GarbageAlertModal } from "./alerts/GarbageAlertModal";
import { playAlertSound, playTripleBeep } from "@/lib/audio/alertSound";
import { X, Camera, History, Video, Circle, Download, Trash2, Edit2 } from "lucide-react";

// Static Notification Component (Bottom-Right Corner)
interface NotificationBoxProps {
  detection: GarbageDetection;
  onClose: () => void;
}

interface CapturedImage {
  id: string;
  imageData: string; // base64
  timestamp: string;
  label?: string;
}

interface RecordingSession {
  id: string;
  startTime: string;
  endTime: string;
  duration: number;
  fileData: Blob;
  label?: string;
}

const NotificationBox: React.FC<NotificationBoxProps> = ({
  detection,
  onClose,
}) => {
  const severityColors = {
    critical: "bg-red-950/80 border-red-700",
    warning: "bg-orange-950/80 border-orange-700",
    info: "bg-yellow-950/80 border-yellow-700",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 20 }}
      className={`w-72 ${
        severityColors[detection.severity]
      } border-2 rounded-lg shadow-2xl backdrop-blur`}
    >
      {/* Header */}
      <div className="bg-black/80 px-4 py-2 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-xl">{getSeverityIcon(detection.severity)}</span>
          <span className="text-white font-bold text-xs">
            {detection.severity.toUpperCase()}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 py-2 space-y-1">
        <p className="text-white font-semibold text-sm">{detection.detectionType}</p>
        <div className="space-y-0.5 text-xs text-gray-300">
          <p>📍 {detection.zone}</p>
          <p>🎯 {detection.confidence}%</p>
          <p>⏰ {new Date(detection.timestamp).toLocaleTimeString()}</p>
        </div>

        {/* Confidence Bar */}
        <div className="mt-2 bg-black/40 rounded h-1.5 overflow-hidden">
          <motion.div
            className={`h-full ${
              detection.confidence > 90
                ? "bg-red-500"
                : detection.confidence > 80
                  ? "bg-orange-500"
                  : "bg-yellow-500"
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${detection.confidence}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </motion.div>
  );
};

const SmartGarbageAlertSystem = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [currentAlert, setCurrentAlert] = useState<GarbageDetection | null>(null);
  const [alertHistory, setAlertHistory] = useState<GarbageDetection[]>([]);
  const [notifications, setNotifications] = useState<GarbageDetection[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [detectionCount, setDetectionCount] = useState(0);
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  // Recording & Image Capture
  const [isRecording, setIsRecording] = useState(false);
  const [capturedImages, setCapturedImages] = useState<CapturedImage[]>([]);
  const [recordingSessions, setRecordingSessions] = useState<RecordingSession[]>([]);
  const [showCapturedImages, setShowCapturedImages] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const [editingRecordingId, setEditingRecordingId] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState("");
  const recordingRef = useRef<number | null>(null);
  const recordingStartTimeRef = useRef<Date | null>(null);

  // Initialize camera cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  // Poll for garbage detections
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newDetection = generateMockDetection();
        setCurrentAlert(newDetection);
        setAlertHistory((prev) => [newDetection, ...prev].slice(0, 50));
        setDetectionCount((prev) => prev + 1);
        setNotifications((prev) => [newDetection, ...prev].slice(0, 3)); // Keep last 3 notifications
        setIsModalOpen(true);

        if (newDetection.severity === "critical") {
          playTripleBeep();
        } else {
          playAlertSound();
        }
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [isPaused]);

  const handleDismiss = () => {
    setIsModalOpen(false);
    setCurrentAlert(null);
  };

  const handleSendDrone = (detection: GarbageDetection) => {
    console.log("Sending drone to:", detection.latitude, detection.longitude);
    setIsModalOpen(false);
  };

  const handleRemoveNotification = (detectionId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== detectionId));
  };

  const toggleCamera = async () => {
    if (cameraActive) {
      // Turn off camera
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setCameraActive(false);
    } else {
      // Turn on camera
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user"
          },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }

        setStream(mediaStream);
        setCameraActive(true);
      } catch (err: any) {
        console.error("Camera access failed:", err);
        setCameraActive(false);
        alert(`Camera access failed: ${err.message || "Please check your camera permissions"}`);
      }
    }
  };

  // Capture image from video feed
  const captureImage = () => {
    if (!videoRef.current || !cameraActive) {
      alert("Camera not active");
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0);

    const imageData = canvas.toDataURL("image/jpeg");
    const newImage: CapturedImage = {
      id: `img_${Date.now()}`,
      imageData,
      timestamp: new Date().toLocaleString(),
      label: "Captured Image",
    };

    setCapturedImages((prev) => [newImage, ...prev]);
    alert("✅ Image captured and added to dataset!");
  };

  // Toggle recording
  const toggleRecording = async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        if (recordingRef.current) {
          clearInterval(recordingRef.current);
        }
      }
    } else {
      // Start recording
      if (!stream) {
        alert("Camera not active. Please enable camera first.");
        return;
      }

      try {
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: "video/webm",
        });

        const chunks: BlobPart[] = [];
        const startTime = new Date();
        recordingStartTimeRef.current = startTime;

        mediaRecorder.ondataavailable = (e) => {
          chunks.push(e.data);
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: "video/webm" });
          const endTime = new Date();
          const duration = (endTime.getTime() - startTime.getTime()) / 1000;

          const newRecording: RecordingSession = {
            id: `rec_${Date.now()}`,
            startTime: startTime.toLocaleString(),
            endTime: endTime.toLocaleString(),
            duration: Math.round(duration),
            fileData: blob,
            label: `Recording ${recordingSessions.length + 1}`,
          };

          setRecordingSessions((prev) => [newRecording, ...prev]);
          alert("✅ Recording saved to dataset!");
        };

        mediaRecorder.start();
        mediaRecorderRef.current = mediaRecorder;
        setIsRecording(true);
        setRecordingTime(0);

        // Timer for recording duration
        recordingRef.current = window.setInterval(() => {
          setRecordingTime((prev) => prev + 1);
        }, 1000);
      } catch (err) {
        console.error("Recording failed:", err);
        alert("Failed to start recording");
      }
    }
  };

  // Delete captured image
  const deleteImage = (id: string) => {
    setCapturedImages((prev) => prev.filter((img) => img.id !== id));
  };

  // Edit image label
  const updateImageLabel = (id: string) => {
    setCapturedImages((prev) =>
      prev.map((img) =>
        img.id === id ? { ...img, label: newLabel || img.label } : img
      )
    );
    setEditingImageId(null);
    setNewLabel("");
  };

  // Download captured image
  const downloadImage = (imageData: string, label: string) => {
    const link = document.createElement("a");
    link.href = imageData;
    link.download = `${label || "captured"}_${Date.now()}.jpg`;
    link.click();
  };

  // Delete recording
  const deleteRecording = (id: string) => {
    setRecordingSessions((prev) => prev.filter((rec) => rec.id !== id));
  };

  // Edit recording label
  const updateRecordingLabel = (id: string) => {
    setRecordingSessions((prev) =>
      prev.map((rec) =>
        rec.id === id ? { ...rec, label: newLabel || rec.label } : rec
      )
    );
    setEditingRecordingId(null);
    setNewLabel("");
  };

  // Download recording
  const downloadRecording = (fileData: Blob, label: string, duration: number) => {
    const url = URL.createObjectURL(fileData);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${label || "recording"}_${duration}s_${Date.now()}.webm`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export all as ZIP
  const exportAllAsZip = async () => {
    try {
      // Dynamic import for JSZip
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      // Add images folder
      if (capturedImages.length > 0) {
        const imagesFolder = zip.folder("Images");
        if (imagesFolder) {
          capturedImages.forEach((img, index) => {
            const base64Data = img.imageData.split(",")[1];
            const fileName = `${img.label || `image_${index}`}_${img.timestamp.replace(/\//g, "-").replace(/:/g, "-")}.jpg`;
            imagesFolder.file(fileName, base64Data, { base64: true });
          });
        }
      }

      // Add recordings folder
      if (recordingSessions.length > 0) {
        const recordingsFolder = zip.folder("Recordings");
        if (recordingsFolder) {
          recordingSessions.forEach((rec) => {
            const fileName = `${rec.label || "recording"}_${rec.startTime.replace(/\//g, "-").replace(/:/g, "-")}_${rec.duration}s.webm`;
            recordingsFolder.file(fileName, rec.fileData);
          });
        }
      }

      // Generate and download ZIP
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `AeroCleanse-Dataset-${new Date().toLocaleString().replace(/\//g, "-").replace(/:/g, "-")}.zip`;
      link.click();
      URL.revokeObjectURL(url);

      alert("✅ Dataset exported as ZIP successfully!");
    } catch (err) {
      console.error("ZIP export failed:", err);
      alert("Failed to export dataset as ZIP. Make sure jszip is installed.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-200 flex flex-col overflow-hidden">
      {/* Top Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-black/80 border-b border-gray-800/50 px-6 py-4 flex items-center justify-between backdrop-blur-md shrink-0"
      >
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
          <h1 className="text-2xl font-bold text-white">Alert System Monitoring</h1>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Total Detections:</span>
            <motion.span
              key={detectionCount}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="text-green-400 font-bold text-lg"
            >
              {detectionCount}
            </motion.span>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              isPaused ? "bg-red-900/50 text-red-300" : "bg-green-900/50 text-green-300"
            }`}
          >
            {isPaused ? "PAUSED" : "MONITORING"}
          </div>
        </div>
      </motion.div>

      {/* Camera Feed Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative flex-1 bg-black overflow-hidden"
      >
        {cameraActive && stream ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ transform: "scaleX(-1)" }}
            />
            {/* Camera Overlay HUD */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
              {/* Top Left Info */}
              <div className="absolute top-6 left-6 text-green-400 font-mono text-sm">
                <p>● LIVE</p>
                <p>RES: 1280x720</p>
                <p>FPS: 30</p>
              </div>

              {/* Center Crosshair */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-32 h-32 border-2 border-green-500/30 rounded-full" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-green-500" />
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center flex-col gap-4">
            <Camera className="w-24 h-24 text-gray-600" />
            <p className="text-gray-400 text-lg">Camera access denied or not available</p>
            <p className="text-gray-500 text-sm">Click "Camera ON" button to enable camera access</p>
          </div>
        )}
      </motion.div>

      {/* Control Panel Below Camera */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-black/90 border-t border-gray-800/50 px-6 py-4 backdrop-blur-md shrink-0"
      >
        <div className="flex items-center justify-between">
          {/* Left: Pause/Resume */}
          <div className="flex gap-3">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className={`px-6 py-2 rounded-lg font-bold transition-all ${
                isPaused
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-red-600 hover:bg-red-700 text-white"
              }`}
            >
              {isPaused ? "▶ Resume Monitoring" : "⏸ Pause Monitoring"}
            </button>
          </div>

          {/* Right: Camera, Record, Capture & History Buttons */}
          <div className="flex gap-3">
            <button
              onClick={toggleCamera}
              className={`px-6 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${
                cameraActive
                  ? "bg-purple-600 hover:bg-purple-700 text-white"
                  : "bg-gray-600 hover:bg-gray-700 text-white"
              }`}
            >
              <Video className="w-4 h-4" />
              {cameraActive ? "Camera ON" : "Camera OFF"}
            </button>

            <button
              onClick={toggleRecording}
              disabled={!cameraActive}
              className={`px-6 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${
                isRecording
                  ? "bg-red-600 hover:bg-red-700 text-white animate-pulse"
                  : cameraActive
                    ? "bg-orange-600 hover:bg-orange-700 text-white"
                    : "bg-gray-600 text-gray-400 cursor-not-allowed"
              }`}
            >
              <Circle className="w-4 h-4" />
              {isRecording ? `Recording... ${recordingTime}s` : "Record"}
            </button>

            <button
              onClick={captureImage}
              disabled={!cameraActive}
              className={`px-6 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${
                cameraActive
                  ? "bg-cyan-600 hover:bg-cyan-700 text-white"
                  : "bg-gray-600 text-gray-400 cursor-not-allowed"
              }`}
            >
              <Camera className="w-4 h-4" />
              Capture ({capturedImages.length})
            </button>

            <button
              onClick={() => setShowCapturedImages(!showCapturedImages)}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Dataset ({capturedImages.length + recordingSessions.length})
            </button>

            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-all flex items-center gap-2"
            >
              <History className="w-4 h-4" />
              Detections ({alertHistory.length})
            </button>
          </div>
        </div>
      </motion.div>

      {/* Right-Bottom Corner: Notifications Stack */}
      <div className="fixed bottom-6 right-6 z-50 max-w-sm space-y-3 pointer-events-auto">
        <AnimatePresence>
          {notifications.map((notification) => (
            <NotificationBox
              key={notification.id}
              detection={notification}
              onClose={() => handleRemoveNotification(notification.id)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Hidden Canvas for Image Capture */}
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* Captured Images Dataset Modal */}
      {showCapturedImages && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-40 p-4"
          onClick={() => setShowCapturedImages(false)}
        >
          <motion.div
            className="bg-gray-900 border border-gray-800 rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-black/80 border-b border-gray-800 px-6 py-4 sticky top-0 flex items-center justify-between shrink-0">
              <h2 className="text-xl font-bold text-white">Media Dataset</h2>
              <button
                onClick={() => setShowCapturedImages(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto">
              {capturedImages.length === 0 && recordingSessions.length === 0 ? (
                <div className="text-center py-12">
                  <Camera className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No media yet. Click "Capture" or "Record" to add media to your dataset.</p>
                </div>
              ) : (
                <div className="p-6 space-y-8">
                  {/* Images Section */}
                  {capturedImages.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Camera className="w-5 h-5" /> Images ({capturedImages.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {capturedImages.map((image) => (
                          <motion.div
                            key={image.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden hover:border-gray-600 transition-all"
                          >
                            {/* Image Preview */}
                            <div className="relative h-48 bg-black overflow-hidden">
                              <img
                                src={image.imageData}
                                alt={image.label}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            {/* Image Info */}
                            <div className="p-4 space-y-3">
                              {/* Label */}
                              {editingImageId === image.id ? (
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={newLabel}
                                    onChange={(e) => setNewLabel(e.target.value)}
                                    placeholder="Enter label..."
                                    className="flex-1 bg-gray-700 text-white px-3 py-1 rounded text-sm border border-gray-600"
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => updateImageLabel(image.id)}
                                    className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-sm"
                                  >
                                    Save
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between">
                                  <p className="text-white font-semibold text-sm">{image.label}</p>
                                  <button
                                    onClick={() => {
                                      setEditingImageId(image.id);
                                      setNewLabel(image.label || "");
                                    }}
                                    className="text-blue-400 hover:text-blue-300 transition-colors"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                </div>
                              )}

                              {/* Timestamp */}
                              <p className="text-xs text-gray-400">{image.timestamp}</p>

                              {/* Actions */}
                              <div className="flex gap-2">
                                <button
                                  onClick={() => downloadImage(image.imageData, image.label)}
                                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2"
                                >
                                  <Download className="w-4 h-4" />
                                  Download
                                </button>
                                <button
                                  onClick={() => deleteImage(image.id)}
                                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recordings Section */}
                  {recordingSessions.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Video className="w-5 h-5" /> Recordings ({recordingSessions.length})
                      </h3>
                      <div className="space-y-4">
                        {recordingSessions.map((recording) => (
                          <motion.div
                            key={recording.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-all"
                          >
                            <div className="space-y-3">
                              {/* Label */}
                              {editingRecordingId === recording.id ? (
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={newLabel}
                                    onChange={(e) => setNewLabel(e.target.value)}
                                    placeholder="Enter label..."
                                    className="flex-1 bg-gray-700 text-white px-3 py-1 rounded text-sm border border-gray-600"
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => updateRecordingLabel(recording.id)}
                                    className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-sm"
                                  >
                                    Save
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-white font-semibold">{recording.label}</p>
                                    <p className="text-xs text-gray-400 mt-1">Duration: {recording.duration}s</p>
                                  </div>
                                  <button
                                    onClick={() => {
                                      setEditingRecordingId(recording.id);
                                      setNewLabel(recording.label || "");
                                    }}
                                    className="text-blue-400 hover:text-blue-300 transition-colors"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                </div>
                              )}

                              {/* Timings */}
                              <div className="text-xs text-gray-400 space-y-1">
                                <p>Start: {recording.startTime}</p>
                                <p>End: {recording.endTime}</p>
                              </div>

                              {/* Actions */}
                              <div className="flex gap-2">
                                <button
                                  onClick={() => downloadRecording(recording.fileData, recording.label, recording.duration)}
                                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2"
                                >
                                  <Download className="w-4 h-4" />
                                  Download
                                </button>
                                <button
                                  onClick={() => deleteRecording(recording.id)}
                                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer with Export */}
            {(capturedImages.length > 0 || recordingSessions.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-t border-gray-800 bg-black/50 px-6 py-4 flex justify-center gap-4 sticky bottom-0 shrink-0"
              >
                <button
                  onClick={exportAllAsZip}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold transition-all flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Export All as ZIP
                </button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* History Modal */}
      {showHistory && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-40 p-4"
          onClick={() => setShowHistory(false)}
        >
          <motion.div
            className="bg-gray-900 border border-gray-800 rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-black/80 border-b border-gray-800 px-6 py-4 sticky top-0 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Detection History</h2>
              <button
                onClick={() => setShowHistory(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="divide-y divide-gray-800">
              {alertHistory.length === 0 ? (
                <div className="p-6 text-center text-gray-400">
                  No detections yet
                </div>
              ) : (
                alertHistory.map((detection, index) => (
                  <motion.div
                    key={detection.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 hover:bg-gray-800/50 transition-colors border-l-4 ${
                      detection.severity === "critical"
                        ? "border-red-500"
                        : detection.severity === "warning"
                          ? "border-orange-500"
                          : "border-yellow-500"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-white font-semibold flex items-center gap-2">
                          <span className="text-lg">
                            {getSeverityIcon(detection.severity)}
                          </span>
                          {detection.detectionType}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          📍 {detection.zone} • 🎯 {detection.confidence}% • ⏰{" "}
                          {new Date(detection.timestamp).toLocaleTimeString()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          GPS: {detection.latitude.toFixed(4)}, {detection.longitude.toFixed(4)} | Alt: {detection.altitude}m
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ml-4 ${
                          detection.severity === "critical"
                            ? "bg-red-700 text-white"
                            : detection.severity === "warning"
                              ? "bg-orange-700 text-white"
                              : "bg-yellow-700 text-white"
                        }`}
                      >
                        {detection.severity.toUpperCase()}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Alert Modal */}
      <GarbageAlertModal
        isOpen={isModalOpen}
        onDismiss={handleDismiss}
        detection={currentAlert}
        onSendDrone={handleSendDrone}
        onExportReport={() => {}}
        alertHistory={alertHistory}
      />
    </div>
  );
};

export default SmartGarbageAlertSystem;
