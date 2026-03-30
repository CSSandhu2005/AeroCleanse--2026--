import Link from "next/link";
import { NavBar } from "@/components/navbar";
import {
  ArrowRight,
  Cpu,
  Target,
  Droplets,
  Map,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ResponsiveHeroBanner from "@/components/responsive-hero-banner";

export default function Home() {
  return (
    <div className="min-h-screen ">
      <ResponsiveHeroBanner />
    </div>
  );
}