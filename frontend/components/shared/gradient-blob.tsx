import { cn } from "@/lib/utils";

interface GradientBlobProps {
  className?: string;
  color?: "primary" | "secondary" | "accent";
  size?: "sm" | "md" | "lg";
}

const colorMap: Record<string, string> = {
  primary: "bg-primary/20",
  secondary: "bg-secondary/20",
  accent: "bg-accent/20",
};

const sizeMap: Record<string, string> = {
  sm: "h-48 w-48",
  md: "h-72 w-72",
  lg: "h-96 w-96",
};

export function GradientBlob({
  className,
  color = "primary",
  size = "md",
}: GradientBlobProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute rounded-full blur-3xl animate-pulse-glow",
        colorMap[color],
        sizeMap[size],
        className
      )}
      aria-hidden="true"
    />
  );
}
