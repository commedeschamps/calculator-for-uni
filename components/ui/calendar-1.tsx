"use client";

import { useMemo, useState } from "react";
import {
  DatePicker,
  parseDate,
  type DatePickerValueChangeDetails,
  type DateValue,
} from "@ark-ui/react/date-picker";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";

function getWeekOfYear(dateValue: DateValue) {
  const date = dateValue.toDate(
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  );
  const jan1 = new Date(date.getFullYear(), 0, 1);
  const dayOfYear =
    Math.floor(
      (Number(date) -
        Number(jan1) +
        (jan1.getTimezoneOffset() - date.getTimezoneOffset()) * 60000) /
        86400000,
    ) + 1;

  const jan1Day = jan1.getDay();
  return Math.ceil((dayOfYear + jan1Day) / 7);
}

type BasicDatePickerProps = {
  value?: Date;
  onDateChange?: (date: Date) => void;
  className?: string;
};

export default function BasicDatePicker({
  value,
  onDateChange,
  className,
}: BasicDatePickerProps) {
  const [internalDate, setInternalDate] = useState<Date>(value ?? new Date());
  const activeDate = value ?? internalDate;
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const parsedValue = useMemo(() => [parseDate(activeDate)], [activeDate]);

  function handleValueChange(details: DatePickerValueChangeDetails) {
    const nextValue = details.value[0];
    if (!nextValue) {
      return;
    }

    const nextDate = nextValue.toDate(timeZone);
    setInternalDate(nextDate);
    onDateChange?.(nextDate);
  }

  return (
    <DatePicker.Root
      inline
      fixedWeeks
      value={parsedValue}
      onValueChange={handleValueChange}
      timeZone={timeZone}
    >
      <DatePicker.Content
        className={cn(
          "inline-block rounded-lg border border-border bg-card p-3 shadow-sm",
          className,
        )}
      >
        <DatePicker.View view="day">
          <DatePicker.Context>
            {(api) => (
              <>
                <DatePicker.ViewControl className="mb-3 flex items-center justify-between">
                  <DatePicker.PrevTrigger className="rounded-md p-1 text-foreground transition-colors hover:bg-muted">
                    <ChevronLeftIcon className="h-4 w-4" />
                  </DatePicker.PrevTrigger>
                  <DatePicker.ViewTrigger className="rounded-md px-2 py-1 text-sm font-medium text-foreground transition-colors hover:bg-muted">
                    <DatePicker.RangeText />
                  </DatePicker.ViewTrigger>
                  <DatePicker.NextTrigger className="rounded-md p-1 text-foreground transition-colors hover:bg-muted">
                    <ChevronRightIcon className="h-4 w-4" />
                  </DatePicker.NextTrigger>
                </DatePicker.ViewControl>
                <DatePicker.Table className="w-full border-separate border-spacing-y-0.5">
                  <DatePicker.TableHead>
                    <DatePicker.TableRow>
                      <th />
                      {api.weekDays.map((weekDay, id) => (
                        <DatePicker.TableHeader
                          key={id}
                          className="h-7 w-9 text-center text-sm font-medium text-muted-foreground"
                        >
                          {weekDay.narrow}
                        </DatePicker.TableHeader>
                      ))}
                    </DatePicker.TableRow>
                  </DatePicker.TableHead>
                  <DatePicker.TableBody>
                    {api.weeks.map((week, id) => (
                      <DatePicker.TableRow key={id}>
                        <td className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium text-muted-foreground">
                          {getWeekOfYear(week[0])}
                        </td>
                        {week.map((day, idx) => (
                          <DatePicker.TableCell
                            key={idx}
                            value={day}
                            className="p-0"
                          >
                            <DatePicker.TableCellTrigger className="relative flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium text-foreground transition-colors hover:bg-muted data-[selected]:bg-foreground data-[selected]:text-background data-[outside-range]:text-muted-foreground/60 data-[today]:after:absolute data-[today]:after:bottom-0.5 data-[today]:after:h-1 data-[today]:after:w-1 data-[today]:after:rounded-full data-[today]:after:bg-foreground data-[selected][data-today]:after:bg-background">
                              {day.day}
                            </DatePicker.TableCellTrigger>
                          </DatePicker.TableCell>
                        ))}
                      </DatePicker.TableRow>
                    ))}
                  </DatePicker.TableBody>
                </DatePicker.Table>
              </>
            )}
          </DatePicker.Context>
        </DatePicker.View>
        <DatePicker.View view="month">
          <DatePicker.Context>
            {(api) => (
              <>
                <DatePicker.ViewControl className="mb-4 flex items-center justify-between">
                  <DatePicker.PrevTrigger className="rounded-md p-1 text-foreground transition-colors hover:bg-muted">
                    <ChevronLeftIcon className="h-4 w-4" />
                  </DatePicker.PrevTrigger>
                  <DatePicker.ViewTrigger className="rounded-md px-2 py-1 text-base font-semibold text-foreground transition-colors hover:bg-muted">
                    <DatePicker.RangeText />
                  </DatePicker.ViewTrigger>
                  <DatePicker.NextTrigger className="rounded-md p-1 text-foreground transition-colors hover:bg-muted">
                    <ChevronRightIcon className="h-4 w-4" />
                  </DatePicker.NextTrigger>
                </DatePicker.ViewControl>
                <DatePicker.Table className="w-full border-separate border-spacing-y-0.5">
                  <DatePicker.TableBody>
                    {api
                      .getMonthsGrid({ columns: 4, format: "short" })
                      .map((months, id) => (
                        <DatePicker.TableRow key={id}>
                          {months.map((month, idx) => (
                            <DatePicker.TableCell key={idx} value={month.value}>
                              <DatePicker.TableCellTrigger className="flex h-10 w-16 items-center justify-center rounded-lg text-sm font-medium text-foreground transition-colors hover:bg-muted data-[selected]:bg-foreground data-[selected]:text-background">
                                {month.label}
                              </DatePicker.TableCellTrigger>
                            </DatePicker.TableCell>
                          ))}
                        </DatePicker.TableRow>
                      ))}
                  </DatePicker.TableBody>
                </DatePicker.Table>
              </>
            )}
          </DatePicker.Context>
        </DatePicker.View>
        <DatePicker.View view="year">
          <DatePicker.Context>
            {(api) => (
              <>
                <DatePicker.ViewControl className="mb-4 flex items-center justify-between">
                  <DatePicker.PrevTrigger className="rounded-md p-1 text-foreground transition-colors hover:bg-muted">
                    <ChevronLeftIcon className="h-4 w-4" />
                  </DatePicker.PrevTrigger>
                  <DatePicker.ViewTrigger className="rounded-md px-2 py-1 text-base font-semibold text-foreground transition-colors hover:bg-muted">
                    <DatePicker.RangeText />
                  </DatePicker.ViewTrigger>
                  <DatePicker.NextTrigger className="rounded-md p-1 text-foreground transition-colors hover:bg-muted">
                    <ChevronRightIcon className="h-4 w-4" />
                  </DatePicker.NextTrigger>
                </DatePicker.ViewControl>
                <DatePicker.Table className="w-full border-separate border-spacing-y-0.5">
                  <DatePicker.TableBody>
                    {api.getYearsGrid({ columns: 4 }).map((years, id) => (
                      <DatePicker.TableRow key={id}>
                        {years.map((year, idx) => (
                          <DatePicker.TableCell key={idx} value={year.value}>
                            <DatePicker.TableCellTrigger className="flex h-10 w-16 items-center justify-center rounded-lg text-sm font-medium text-foreground transition-colors hover:bg-muted data-[selected]:bg-foreground data-[selected]:text-background">
                              {year.label}
                            </DatePicker.TableCellTrigger>
                          </DatePicker.TableCell>
                        ))}
                      </DatePicker.TableRow>
                    ))}
                  </DatePicker.TableBody>
                </DatePicker.Table>
              </>
            )}
          </DatePicker.Context>
        </DatePicker.View>
      </DatePicker.Content>
    </DatePicker.Root>
  );
}
