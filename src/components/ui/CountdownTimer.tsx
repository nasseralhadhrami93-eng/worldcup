"use client"
import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  targetDate: string;
}

export function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);
  
  const [isExpired, setIsExpired] = useState(false);
  const [isLessThanHour, setIsLessThanHour] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate.replace(' ', 'T')).getTime() - new Date().getTime();

      if (difference <= 0) {
        setIsExpired(true);
        setIsLessThanHour(false);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setIsExpired(false);
      setIsLessThanHour(difference < 3600000); // Less than 1 hour

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };

    calculateTimeLeft(); // Initial call
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) return null; // Hydration mismatch prevention (return null until mounted)

  if (isExpired) {
    return (
      <div className="flex items-center gap-1.5 text-xs font-bold text-destructive bg-destructive/10 px-2.5 py-1.5 rounded-md border border-destructive/20">
        تم إغلاق التوقعات 🔒
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-md border transition-colors ${
      isLessThanHour 
        ? "text-red-500 bg-red-500/10 border-red-500/20 animate-pulse" 
        : "text-primary bg-primary/10 border-primary/20"
    }`}>
      <Clock className="w-3.5 h-3.5" />
      <div className="flex gap-1" dir="ltr">
        {timeLeft.days > 0 && <span>{timeLeft.days}d</span>}
        <span>{timeLeft.hours.toString().padStart(2, '0')}h</span>
        <span>:</span>
        <span>{timeLeft.minutes.toString().padStart(2, '0')}m</span>
        <span>:</span>
        <span>{timeLeft.seconds.toString().padStart(2, '0')}s</span>
      </div>
    </div>
  );
}
