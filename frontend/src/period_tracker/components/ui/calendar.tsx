import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

// Single-month calendar styled like the reference screenshot:
// centered month name, subtle grid, and circular blue selected day.
function Calendar({ className, classNames, showOutsideDays = false, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      numberOfMonths={1}
      className={cn("p-4", className)}
      classNames={{
        months: "flex flex-col items-center space-y-2",
        month: "space-y-2 w-full",
        caption: "flex items-center justify-between w-full px-2 pt-1",
        caption_label: "text-sm font-semibold mx-auto",
        nav: "space-x-1 flex items-center ml-auto",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100",
        ),
        nav_button_previous: "",
        nav_button_next: "",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-muted-foreground w-9 text-center font-normal text-[0.75rem]",
        row: "flex w-full mt-1",
        cell: "h-9 w-9 text-center text-sm p-0 relative",
        day: cn(
          "h-8 w-8 rounded-full flex items-center justify-center text-sm font-normal transition-colors",
          "hover:bg-blue-50 hover:text-blue-600 aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-[#2563EB] text-white hover:bg-[#2563EB] hover:text-white focus:bg-[#2563EB] focus:text-white",
        day_today: "border border-blue-400 text-blue-700",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
