"use client";

import React from "react";
import { ModelControls } from "./computer-vision/ModelControls";
import { LiveFeed } from "./computer-vision/LiveFeed";
import { DetectionSummary } from "./computer-vision/DetectionSummary";
import { HeatmapPanel } from "./computer-vision/HeatmapPanel";
import { AIInsights } from "./computer-vision/AIInsights";
import { DetectionTable } from "./computer-vision/DetectionTable";

export function Agent2() {
    return (
        <div className="flex flex-col gap-6 p-6 overflow-y-auto h-full scrollbar-hide bg-[#0b1120] text-slate-100">
           Agent2
        </div>
    );
}
