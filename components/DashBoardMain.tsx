"use client";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import GarbageDetection from "@/components/GarbageDetection";
import { Sidebar, SidebarBody, SidebarLink } from "./sidebar";
import {
  IconArrowLeft,
  IconBrandTabler,
  IconSettings,
  IconUserBolt,
  IconDrone,
  IconCpu,
  IconMap2,
} from "@tabler/icons-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { UserButton, useUser } from "@clerk/nextjs";
import { IconEye } from "@tabler/icons-react";
import { Agent2 } from "@/components/Agent2";
import { Agent3 } from "@/components/Agent3";
import { CommandCenter } from "./command/CommandCenter";
import MissionPlanner from "@/components/MissionPlanner";
import Agent4 from "./Agent4";
import Agent1 from "./Agent1";
export function DashBoardMain({ initialView }: { initialView?: string }) {
  const { user, isLoaded } = useUser();
  const links = [
    {
      label: "Main DashBoard",
      onClick: () => setActiveView("overview"),
      icon: (
        <IconBrandTabler className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },

    {
      label: "Alert System Monitoring",
      onClick: () => setActiveView("Agent1"),
      icon: (
        <IconDrone className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Agent2",
      onClick: () => setActiveView("Agent2"),
      icon: (
        <IconEye className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Garbage HeatMap",
      onClick: () => setActiveView("Agent3"),
      icon: (
        <IconCpu className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Agent4",
      onClick: () => setActiveView("Agent4"),
      icon: (
        <IconMap2 className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Garbage Detection",
      onClick: () => setActiveView("garbage"),
      icon: <IconEye className="h-5 w-5" />,
    },
    {
      label: "Mission-Planner (Agent5)",
      onClick: () => setActiveView("mission-planner"),
      icon: (
        <IconMap2 className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Settings",
      href: "#",
      icon: (
        <IconSettings className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Profile",
      onClick: () => setActiveView("profile"),
      icon: (
        <IconUserBolt className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Logout",
      href: "#",
      icon: (
        <IconArrowLeft className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
  ];
  const [open, setOpen] = useState(false);
  const [activeView, setActiveView] = useState(initialView || "overview");

  return (
    <div
      className={cn(
        "mx-auto flex w-full flex-1 flex-col overflow-hidden rounded-md border border-neutral-200 bg-gray-100 md:flex-row dark:border-neutral-700 dark:bg-neutral-800",
        "h-screen", // for your use case, use `h-screen` instead of `h-[60vh]`
      )}
    >
      <Sidebar open={open} setOpen={setOpen} animate={false}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            <>
              <Logo />
            </>
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <div
                  key={idx}
                  onClick={link.onClick}
                  className="cursor-pointer"
                >
                  <SidebarLink link={link} />
                </div>
              ))}
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                // Display the user's name (or "User" while loading)
                label: isLoaded ? user?.fullName || "User" : "Loading...",
                href: "#",
                icon: (
                  // Clerk's UserButton handles the Image, Menu, Logout, and Settings automatically
                  <UserButton
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        avatarBox: "h-7 w-7", // Ensures the avatar size matches your design
                      },
                    }}
                  />
                ),
              }}
              className="pb-10"
            />
          </div>
        </SidebarBody>
      </Sidebar>
      <Dashboard activeView={activeView} />
    </div>
  );
}
export const Logo = () => {
  return (
    <a
      href="#"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium whitespace-pre text-black dark:text-white"
      >
        AeroCleanse
      </motion.span>
    </a>
  );
};
export const LogoIcon = () => {
  return (
    <a
      href="#"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
    </a>
  );
};

//  dashboard component with content
const Dashboard = ({ activeView }: { activeView: string }) => {
  const [data, setData] = useState<any[]>([]);
  const [summary, setSummary] = useState("");
  const [regionScore, setRegionScore] = useState(0);
  const hasCritical = data.some((item) => item.risk === "High");

  return (
    <div className="flex flex-1">
      <div
        className={cn(
          "flex h-full w-full flex-1 flex-col rounded-tl-2xl border",
          "border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900",
          activeView === "overview"
            ? "p-0 gap-0 overflow-hidden"
            : "p-6 md:p-10 gap-6 overflow-y-auto",
        )}
      >
        {activeView === "profile" && (
          <div>
            <h1 className="text-2xl font-bold">Profile</h1>
          </div>
        )}

        {activeView === "Agent1" && (
          <div className="-m-6 md:-m-10 flex-1">
            <Agent1 />
          </div>
        )}

        {activeView === "Agent2" && (
          <div className="-m-6 md:-m-10 flex-1 h-full scrollbar-hide">
            <Agent2 />
          </div>
        )}

        {activeView === "Agent3" && (
          <div className="-m-6 md:-m-10 flex-1 h-full">
            <Agent3 />
          </div>
        )}
        {activeView === "Agent4" && (
          <div className="-m-6 md:-m-10 flex-1 h-full">
            <Agent4 />
          </div>
        )}
        {activeView === "garbage" && (
          <div className="-m-6 md:-m-10 flex-1">
            <GarbageDetection />
          </div>
        )}
        {activeView === "mission-planner" && <MissionPlanner />}
        {activeView === "overview" && (
          <div className="flex-1 h-full">
            <CommandCenter />
          </div>
        )}
      </div>
    </div>
  );
};
