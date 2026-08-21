import { useState, useEffect } from 'react';
import { Clock, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CountdownTimerProps {
  endDate: string;
  startDate?: string;
  className?: string;
  variant?: 'card' | 'banner' | 'inline';
  showLabel?: boolean;
}

const parseDate = (dateStr: string) => {
  if (!dateStr) return null;
  const formatted = dateStr.includes(' ') && !dateStr.includes('T') ? dateStr.replace(' ', 'T') : dateStr;
  const parsed = new Date(formatted);
  return isNaN(parsed.getTime()) ? new Date(dateStr) : parsed;
};

export default function CountdownTimer({
  endDate,
  startDate,
  className,
  variant = 'card',
  showLabel = true,
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
    hasStarted: boolean;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
    hasStarted: true,
  });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const end = parseDate(endDate)?.getTime() || 0;
      const start = startDate ? parseDate(startDate)?.getTime() || 0 : 0;

      if (start && now < start) {
        const diff = start - now;
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / (1000 * 60)) % 60),
          seconds: Math.floor((diff / 1000) % 60),
          isExpired: false,
          hasStarted: false,
        });
        return;
      }

      const diff = end - now;
      if (diff <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
          hasStarted: true,
        });
      } else {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / (1000 * 60)) % 60),
          seconds: Math.floor((diff / 1000) % 60),
          isExpired: false,
          hasStarted: true,
        });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [endDate, startDate]);

  if (timeLeft.isExpired) {
    return (
      <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-600 border border-rose-500/20 font-bold text-xs", className)}>
        <Clock className="h-4 w-4" />
        <span>Offer Expired</span>
      </div>
    );
  }

  const formatUnit = (value: number) => String(value).padStart(2, '0');

  if (variant === 'inline') {
    return (
      <div className={cn("inline-flex items-center gap-1.5 text-xs font-mono font-bold text-amber-300", className)}>
        <Clock className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
        {!timeLeft.hasStarted && <span className="text-[10px] uppercase font-sans text-amber-200 mr-1">Starts in:</span>}
        {timeLeft.days > 0 && <span>{timeLeft.days}d</span>}
        <span>{formatUnit(timeLeft.hours)}h</span>
        <span>{formatUnit(timeLeft.minutes)}m</span>
        <span>{formatUnit(timeLeft.seconds)}s</span>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div className={cn("flex items-center gap-2 sm:gap-3 bg-slate-950/80 backdrop-blur-md border border-white/10 p-2 sm:p-3 rounded-2xl shadow-xl", className)}>
        {showLabel && (
          <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs sm:text-sm pr-2 border-r border-white/10">
            <Flame className="h-4 w-4 text-amber-400 animate-bounce" />
            <span className="hidden xs:inline">Ends In</span>
          </div>
        )}

        <div className="flex items-center gap-1.5 font-mono text-white text-xs sm:text-sm font-bold">
          {timeLeft.days > 0 && (
            <>
              <div className="flex flex-col items-center">
                <div className="bg-slate-900 border border-white/10 px-2 py-1 rounded-lg min-w-[32px] text-center text-amber-300">
                  {formatUnit(timeLeft.days)}
                </div>
                <span className="text-[9px] font-sans text-slate-400 uppercase mt-0.5">Days</span>
              </div>
              <span className="text-amber-400 font-bold -mt-3">:</span>
            </>
          )}

          <div className="flex flex-col items-center">
            <div className="bg-slate-900 border border-white/10 px-2 py-1 rounded-lg min-w-[32px] text-center text-amber-300">
              {formatUnit(timeLeft.hours)}
            </div>
            <span className="text-[9px] font-sans text-slate-400 uppercase mt-0.5">Hrs</span>
          </div>
          <span className="text-amber-400 font-bold -mt-3">:</span>

          <div className="flex flex-col items-center">
            <div className="bg-slate-900 border border-white/10 px-2 py-1 rounded-lg min-w-[32px] text-center text-amber-300">
              {formatUnit(timeLeft.minutes)}
            </div>
            <span className="text-[9px] font-sans text-slate-400 uppercase mt-0.5">Min</span>
          </div>
          <span className="text-amber-400 font-bold -mt-3">:</span>

          <div className="flex flex-col items-center">
            <div className="bg-slate-900 border border-amber-500/40 px-2 py-1 rounded-lg min-w-[32px] text-center text-amber-400 shadow-sm shadow-amber-500/20">
              {formatUnit(timeLeft.seconds)}
            </div>
            <span className="text-[9px] font-sans text-amber-400/80 uppercase mt-0.5">Sec</span>
          </div>
        </div>
      </div>
    );
  }

  // Default 'card' variant
  return (
    <div className={cn("space-y-3", className)}>
      {!timeLeft.hasStarted && (
        <p className="text-xs font-semibold text-amber-300 uppercase tracking-wider">Promotion Starts In</p>
      )}
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-2.5 shadow-inner">
          <div className="text-2xl sm:text-3xl font-black text-amber-300 font-mono tracking-tight">
            {formatUnit(timeLeft.days)}
          </div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Days</div>
        </div>

        <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-2.5 shadow-inner">
          <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
            {formatUnit(timeLeft.hours)}
          </div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Hours</div>
        </div>

        <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-2.5 shadow-inner">
          <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
            {formatUnit(timeLeft.minutes)}
          </div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Mins</div>
        </div>

        <div className="bg-indigo-950/80 border border-amber-500/30 rounded-2xl p-2.5 shadow-lg shadow-indigo-950/50">
          <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono tracking-tight animate-pulse">
            {formatUnit(timeLeft.seconds)}
          </div>
          <div className="text-[10px] font-bold text-amber-300/80 uppercase tracking-wider mt-1">Secs</div>
        </div>
      </div>
    </div>
  );
}
