import { Button } from "@/components/ui/button";
import { PeriodType } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

type PeriodFilterProps = {
  currentPeriod: PeriodType;
  onPeriodChange: (period: PeriodType) => void;
};

export function PeriodFilter({ currentPeriod, onPeriodChange }: PeriodFilterProps) {
  const periods = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'year', label: 'This Year' },
    { id: 'custom', label: 'Custom' },
  ] as const;
  
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {periods.map((period) => (
        <Button
          key={period.id}
          onClick={() => onPeriodChange(period.id)}
          variant={currentPeriod === period.id ? "default" : "outline"}
          className={cn(
            "px-4 py-2 rounded-lg shadow-sm text-sm font-medium transition-colors",
            currentPeriod === period.id 
              ? "bg-primary text-white" 
              : "bg-white text-gray-700 hover:bg-gray-100"
          )}
        >
          {period.label}
        </Button>
      ))}
    </div>
  );
}
