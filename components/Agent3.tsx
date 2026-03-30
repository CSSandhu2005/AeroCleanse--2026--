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

export const Agent3 = () => {
  return (
    <div className="flex flex-col gap-6 p-6 min-h-full bg-[#0b1120] text-[#cbd5e1] font-sans relative overflow-x-hidden">
      <Heatmap />
    </div>
  );
};
