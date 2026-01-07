import { cn } from "@/lib/utils";
import { Frown, Meh, Smile, SmilePlus, Angry } from "lucide-react";

interface MoodEmojiPickerProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  disabled?: boolean;
}

const moods = [
  { value: 1, label: "Very Low", icon: Angry, color: "text-red-500 dark:text-red-400" },
  { value: 2, label: "Low", icon: Frown, color: "text-orange-500 dark:text-orange-400" },
  { value: 3, label: "Neutral", icon: Meh, color: "text-yellow-500 dark:text-yellow-400" },
  { value: 4, label: "Good", icon: Smile, color: "text-lime-500 dark:text-lime-400" },
  { value: 5, label: "Great", icon: SmilePlus, color: "text-emerald-500 dark:text-emerald-400" },
];

export function MoodEmojiPicker({ value, onChange, label, disabled }: MoodEmojiPickerProps) {
  return (
    <div className="space-y-3">
      {label && (
        <label className="text-sm font-medium text-foreground">{label}</label>
      )}
      <div className="flex items-center justify-between gap-2">
        {moods.map((mood) => {
          const Icon = mood.icon;
          const isSelected = value === mood.value;
          return (
            <button
              key={mood.value}
              type="button"
              onClick={() => onChange(mood.value)}
              disabled={disabled}
              data-testid={`button-mood-${mood.value}`}
              className={cn(
                "flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all duration-200",
                "hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                "min-w-[60px] disabled:opacity-50 disabled:cursor-not-allowed",
                isSelected && "bg-accent scale-105 ring-2 ring-primary/30"
              )}
              aria-label={mood.label}
              aria-pressed={isSelected}
            >
              <Icon
                className={cn(
                  "w-10 h-10 transition-all duration-200",
                  mood.color,
                  isSelected && "scale-110"
                )}
              />
              <span className={cn(
                "text-xs font-medium",
                isSelected ? "text-foreground" : "text-muted-foreground"
              )}>
                {mood.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function getMoodEmoji(level: number) {
  const mood = moods.find((m) => m.value === level);
  if (!mood) return null;
  const Icon = mood.icon;
  return <Icon className={cn("w-5 h-5", mood.color)} />;
}

export function getMoodLabel(level: number) {
  return moods.find((m) => m.value === level)?.label || "Unknown";
}

export function getMoodColor(level: number) {
  return moods.find((m) => m.value === level)?.color || "";
}
