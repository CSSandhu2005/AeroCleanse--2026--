// app/dashboard/layout.tsx
import "../globals.css";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background text-foreground">
      {children}
    </div>
  );
}
