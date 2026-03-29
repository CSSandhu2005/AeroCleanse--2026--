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

export default function Home() {
  return (
    <div className="min-h-screen ">
      <NavBar />
    </div>
  );
}