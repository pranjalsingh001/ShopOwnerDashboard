import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DateRange } from "@/lib/date-utils";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

type DateRangePickerProps = {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  onApply: () => void;
};

export function DateRangePicker({ dateRange, onDateRangeChange, onApply }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localDateRange, setLocalDateRange] = useState<DateRange>(dateRange);
  
  const handleSelect = (range: DateRange | undefined) => {
    if (range) {
      setLocalDateRange(range);
    }
  };
  
  const handleApply = () => {
    onDateRangeChange(localDateRange);
    onApply();
    setIsOpen(false);
  };
  
  return (
    <div className="mb-6 flex flex-wrap gap-4 p-4 bg-white rounded-lg shadow-sm">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex flex-col">
          <span className="block text-sm font-medium text-gray-700 mb-1">Date Range</span>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[300px] justify-start text-left font-normal",
                !dateRange && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.startDate && dateRange?.endDate ? (
                <>
                  {format(dateRange.startDate, "PPP")} - {format(dateRange.endDate, "PPP")}
                </>
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
        </div>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            defaultMonth={dateRange.startDate}
            selected={{
              from: localDateRange.startDate,
              to: localDateRange.endDate,
            }}
            onSelect={(selected) => 
              handleSelect(selected ? 
                { startDate: selected.from!, endDate: selected.to! } : 
                undefined
              )
            }
            numberOfMonths={2}
          />
          <div className="flex justify-end gap-2 p-3 border-t">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleApply}>
              Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
