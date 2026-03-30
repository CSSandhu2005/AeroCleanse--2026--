// app/test/layout.tsx
import "../globals.css";

export default function TestLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background text-foreground">
      {children}
    </div>
  );
}
