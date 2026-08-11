import * as React from 'react';
import { format, parseISO, isValid, subDays, startOfYear } from 'date-fns';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface DatePickerProps {
  value?: string | Date | null;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  clearable?: boolean;
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Pick a date',
  className,
  disabled = false,
  minDate,
  maxDate,
  clearable = true,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const selectedDate = React.useMemo(() => {
    if (!value) return undefined;
    if (value instanceof Date) return value;
    try {
      const parsed = parseISO(value);
      return isValid(parsed) ? parsed : undefined;
    } catch {
      return undefined;
    }
  }, [value]);

  const handleSelect = (date?: Date) => {
    if (onChange) {
      if (date && isValid(date)) {
        onChange(format(date, 'yyyy-MM-dd'));
      } else {
        onChange('');
      }
    }
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onChange) onChange('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            'w-full justify-start text-left font-medium h-10 rounded-xl transition-all duration-200 border-input bg-background/80 hover:bg-accent hover:text-accent-foreground shadow-xs',
            !selectedDate && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="mr-2.5 h-4 w-4 text-indigo-500 shrink-0" />
          <span className="truncate flex-1">
            {selectedDate ? format(selectedDate, 'PPP') : placeholder}
          </span>
          {clearable && selectedDate && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => e.key === 'Enter' && handleClear(e as any)}
              className="ml-1 p-0.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 rounded-2xl shadow-2xl border border-border" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          disabled={(date) => {
            if (minDate && date < minDate) return true;
            if (maxDate && date > maxDate) return true;
            return false;
          }}
          initialFocus
          className="rounded-2xl"
        />
        <div className="p-2 border-t flex justify-between items-center bg-muted/30">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-xs h-7 rounded-lg text-indigo-600 font-semibold"
            onClick={() => handleSelect(new Date())}
          >
            Today
          </Button>
          {selectedDate && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs h-7 rounded-lg text-rose-500 font-semibold"
              onClick={() => handleSelect(undefined)}
            >
              Clear
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface DateRangePickerProps {
  dateFrom: string;
  dateTo: string;
  onUpdate: (from: string, to: string) => void;
  className?: string;
}

export function DateRangePicker({
  dateFrom,
  dateTo,
  onUpdate,
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);

  const range: DateRange | undefined = React.useMemo(() => {
    const from = dateFrom ? parseISO(dateFrom) : undefined;
    const to = dateTo ? parseISO(dateTo) : undefined;
    return {
      from: from && isValid(from) ? from : undefined,
      to: to && isValid(to) ? to : undefined,
    };
  }, [dateFrom, dateTo]);

  const handleSelect = (newRange?: DateRange) => {
    if (!newRange) return;
    const fromStr = newRange.from && isValid(newRange.from) ? format(newRange.from, 'yyyy-MM-dd') : '';
    const toStr = newRange.to && isValid(newRange.to) ? format(newRange.to, 'yyyy-MM-dd') : fromStr;
    onUpdate(fromStr, toStr);
    if (newRange.from && newRange.to) {
      setOpen(false);
    }
  };

  const applyPreset = (days: number | 'ytd') => {
    const today = new Date();
    let fromDate: Date;

    if (days === 'ytd') {
      fromDate = startOfYear(today);
    } else {
      fromDate = subDays(today, days);
    }

    onUpdate(format(fromDate, 'yyyy-MM-dd'), format(today, 'yyyy-MM-dd'));
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            'justify-start text-left font-medium h-9 rounded-xl border border-white/20 bg-black/20 text-white hover:bg-white/10 hover:text-white shadow-xs text-xs',
            className
          )}
        >
          <CalendarIcon className="mr-2 h-3.5 w-3.5 text-indigo-300 shrink-0" />
          {range?.from ? (
            range.to ? (
              <>
                {format(range.from, 'MMM dd, yyyy')} - {format(range.to, 'MMM dd, yyyy')}
              </>
            ) : (
              format(range.from, 'MMM dd, yyyy')
            )
          ) : (
            <span>Pick date range</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 rounded-2xl shadow-2xl border border-border" align="end">
        <div className="flex flex-col sm:flex-row">
          <div className="p-3 border-b sm:border-b-0 sm:border-r border-border flex sm:flex-col gap-1.5 justify-center bg-muted/20">
            <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground px-2 hidden sm:block mb-1">Presets</span>
            <Button type="button" variant="ghost" size="sm" className="h-7 text-xs rounded-lg justify-start" onClick={() => applyPreset(7)}>7 Days</Button>
            <Button type="button" variant="ghost" size="sm" className="h-7 text-xs rounded-lg justify-start" onClick={() => applyPreset(30)}>30 Days</Button>
            <Button type="button" variant="ghost" size="sm" className="h-7 text-xs rounded-lg justify-start" onClick={() => applyPreset(90)}>90 Days</Button>
            <Button type="button" variant="ghost" size="sm" className="h-7 text-xs rounded-lg justify-start" onClick={() => applyPreset('ytd')}>YTD</Button>
          </div>
          <div className="p-2">
            <Calendar
              mode="range"
              defaultMonth={range?.from}
              selected={range}
              onSelect={handleSelect}
              numberOfMonths={1}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
