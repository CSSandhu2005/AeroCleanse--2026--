"use client";
import React from "react";
import { motion } from "motion/react";
import { SystemStatus } from "./spray/SystemStatus";
import { SprayLogicConfig } from "./spray/SprayLogicConfig";
import { PulseConfig } from "./spray/PulseConfig";
import { SprayMetrics } from "./spray/SprayMetrics";
import { OverspraySafety } from "./spray/OverspraySafety";
import { SprayControls } from "./spray/SprayControls";
import Heatmap from "./heatmap";
import HeatmapIncidentReportCard from "./heat-map-middle";

export const Agent3 = () => {
  return ( <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-neutral-900 p-4 transition-colors duration-300">
      <HeatmapIncidentReportCard title="Incident Heatmap" />
    </div>
  );
};
