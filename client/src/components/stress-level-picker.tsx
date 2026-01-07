import { cn } from "@/lib/utils";
import { Activity, Zap, Flame, AlertTriangle, Skull } from "lucide-react";

interface StressLevelPickerProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  disabled?: boolean;
}

const stressLevels = [
  { value: 1, label: "Relaxed", icon: Activity, color: "text-emerald-500 dark:text-emerald-400", bgColor: "bg-emerald-50 dark:bg-emerald-950/30" },
  { value: 2, label: "Mild", icon: Zap, color: "text-lime-500 dark:text-lime-400", bgColor: "bg-lime-50 dark:bg-lime-950/30" },
  { value: 3, label: "Moderate", icon: Flame, color: "text-yellow-500 dark:text-yellow-400", bgColor: "bg-yellow-50 dark:bg-yellow-950/30" },
  { value: 4, label: "High", icon: AlertTriangle, color: "text-orange-500 dark:text-orange-400", bgColor: "bg-orange-50 dark:bg-orange-950/30" },
  { value: 5, label: "Severe", icon: Skull, color: "text-red-500 dark:text-red-400", bgColor: "bg-red-50 dark:bg-red-950/30" },
];

export function StressLevelPicker({ value, onChange, label, disabled }: StressLevelPickerProps) {
  return (
    <div className="space-y-3">
      {label && (
        <label className="text-sm font-medium text-foreground">{label}</label>
      )}
      <div className="flex items-center justify-between gap-2">
        {stressLevels.map((level) => {
          const Icon = level.icon;
          const isSelected = value === level.value;
          return (
            <button
              key={level.value}
              type="button"
              onClick={() => onChange(level.value)}
              disabled={disabled}
              data-testid={`button-stress-${level.value}`}
              className={cn(
                "flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all duration-200",
                "hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                "min-w-[60px] disabled:opacity-50 disabled:cursor-not-allowed",
                isSelected && [level.bgColor, "scale-105 ring-2 ring-primary/30"]
              )}
              aria-label={level.label}
              aria-pressed={isSelected}
            >
              <Icon
                className={cn(
                  "w-10 h-10 transition-all duration-200",
                  level.color,
                  isSelected && "scale-110"
                )}
              />
              <span className={cn(
                "text-xs font-medium",
                isSelected ? "text-foreground" : "text-muted-foreground"
              )}>
                {level.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function getStressIcon(level: number) {
  const stress = stressLevels.find((s) => s.value === level);
  if (!stress) return null;
  const Icon = stress.icon;
  return <Icon className={cn("w-5 h-5", stress.color)} />;
}

export function getStressLabel(level: number) {
  return stressLevels.find((s) => s.value === level)?.label || "Unknown";
}

export function getStressColor(level: number) {
  return stressLevels.find((s) => s.value === level)?.color || "";
}
