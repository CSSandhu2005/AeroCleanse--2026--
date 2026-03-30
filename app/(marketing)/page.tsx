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
import { CTASection } from "@/components/hero-dithering-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import ScrollExpandMedia from "@/components/scroll-expansion-hero";
import Demo from "@/components/Demo";
import TracingBeamDemo from "@/components/tracing-beam-demo";
import Features from "@/components/features-10";
import FeaturesSection from "@/components/features-9";
import TimelineDemo from "@/components/timeline-demo";

export default function Home() {
  return (
    <div className="min-h-screen ">
      <ResponsiveHeroBanner />
      <section className="relative z-10 dark:bg-transparent">
        <CTASection />
      </section>
      <TimelineDemo />
    </div>
  );
}
