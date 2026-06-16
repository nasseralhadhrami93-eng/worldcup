"use client"
import { useState, useEffect } from "react";
import { format, isPast } from "date-fns";
import { ar } from "date-fns/locale";
import { Lock, Clock, CheckCircle2 } from "lucide-react";
export type Question = {
  id: string;
  text: string;
  options?: { id: string; text: string }[];
  note?: string;
};

export type Match = {
  id: string;
  homeTeam: { name: string; flag: string };
  awayTeam: { name: string; flag: string };
  kickoffTime: string;
  isLocked: boolean;
  questions: Question[];
  results?: Record<string, string>;
};

export type Prediction = {
  status: 'pending' | 'graded';
  answers: Record<string, string>;
  pointsEarned?: number;
};

import { Button } from "./ui/Button";

interface MatchCardProps {
  match: Match;
  prediction?: Prediction;
  onSubmitPrediction?: (matchId: string, answers: Record<string, string>) => void;
  isAdmin?: boolean;
}

export function MatchCard({ match, prediction, onSubmitPrediction, isAdmin }: MatchCardProps) {
  const [answers, setAnswers] = useState<Record<string, string>>(prediction?.answers || {});
  const [isClientLocked, setIsClientLocked] = useState(false);

  useEffect(() => {
    // Re-check locking status periodically if not already locked by admin
    if (match.isLocked) {
      setIsClientLocked(true);
      return;
    }
    const checkLock = () => {
      setIsClientLocked(isPast(new Date(match.kickoffTime)));
    };
    checkLock();
    const interval = setInterval(checkLock, 60000);
    return () => clearInterval(interval);
  }, [match.kickoffTime, match.isLocked]);

  const isLocked = isClientLocked || match.isLocked;
  const isPending = prediction?.status === "pending";
  const isGraded = prediction?.status === "graded";

  const handleOptionSelect = (questionId: string, option: string) => {
    if (isLocked && !isAdmin) return;
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleInputChange = (questionId: string, value: string) => {
    if (isLocked && !isAdmin) return;
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmitPrediction) {
      onSubmitPrediction(match.id, answers);
    }
  };

  return (
    <div className={`rounded-xl border ${isLocked ? 'border-white/5 bg-black/40' : 'border-white/10 bg-white/5'} backdrop-blur-lg overflow-hidden shadow-2xl transition-all hover:border-white/20`}>
      {/* Header */}
      <div className="p-4 border-b border-white/5 bg-black/20 flex justify-between items-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
          <Clock className="w-4 h-4" />
          <span dir="ltr">
            {format(new Date(match.kickoffTime), "dd MMM yyyy - HH:mm", { locale: ar })}
          </span>
        </div>
        <div>
          {isLocked ? (
            <span className="flex items-center gap-1 text-xs font-bold text-destructive bg-destructive/10 px-2 py-1 rounded-md border border-destructive/20">
              <Lock className="w-3 h-3" /> مغلقة
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md border border-primary/20">
              مفتوحة للتوقع
            </span>
          )}
        </div>
      </div>

      {/* Teams */}
      <div className="p-6 flex justify-between items-center gap-4">
        <div className="flex flex-col items-center gap-2 flex-1">
          <span className="text-4xl">{match.homeTeam.flag}</span>
          <span className="font-bold text-lg text-center">{match.homeTeam.name}</span>
        </div>
        <div className="text-xl font-bold text-muted-foreground">VS</div>
        <div className="flex flex-col items-center gap-2 flex-1">
          <span className="text-4xl">{match.awayTeam.flag}</span>
          <span className="font-bold text-lg text-center">{match.awayTeam.name}</span>
        </div>
      </div>

      {/* Questions Form */}
      <form onSubmit={handleSubmit} className="p-6 pt-0 space-y-6">
        <div className="space-y-4">
          {match.questions.map((q) => (
            <div key={q.id} className="space-y-2">
              <label className="text-sm font-bold block">{q.text}</label>
              
              {q.note && (
                <p className="text-xs text-muted-foreground bg-background p-2 rounded-md border border-border mt-1 mb-3">
                  💡 {q.note}
                </p>
              )}
              
              {q.options ? (
                <div className="flex flex-wrap gap-2 mt-2">
                  {q.options.map((opt) => (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => handleOptionSelect(q.id, opt.id)}
                      disabled={isLocked && !isAdmin}
                      className={`px-4 py-2 text-sm font-medium rounded-md border transition-colors flex-1 ${
                        answers[q.id] === opt.id 
                          ? 'bg-primary text-primary-foreground border-primary' 
                          : 'bg-card border-border hover:bg-card-hover'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {opt.text}
                    </button>
                  ))}
                </div>
              ) : (
                <input
                  type="text"
                  value={answers[q.id] || ""}
                  onChange={(e) => handleInputChange(q.id, e.target.value)}
                  disabled={isLocked && !isAdmin}
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary disabled:opacity-50"
                  placeholder="أدخل توقعك..."
                />
              )}

              {/* Show result if graded */}
              {isGraded && match.results && (
                <div className="mt-2 text-xs font-medium">
                  {match.results[q.id] === answers[q.id] ? (
                    <span className="text-primary flex items-center gap-1 bg-primary/10 p-2 rounded-md border border-primary/20">
                      <CheckCircle2 className="w-4 h-4" /> إجابة صحيحة (+10 نقطة)
                    </span>
                  ) : (
                    <span className="text-destructive bg-destructive/10 p-2 rounded-md border border-destructive/20 block">
                      إجابة خاطئة. الإجابة الصحيحة: {
                        q.options?.find(o => o.id === match.results![q.id])?.text || match.results[q.id]
                      }
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Action Button & Status */}
        <div className="pt-4 flex flex-col gap-3">
          {!isAdmin && !isLocked && (
            <Button type="submit" className="w-full" variant={prediction ? "outline" : "default"}>
              {prediction ? "تحديث التوقع" : "حفظ التوقع"}
            </Button>
          )}

          {!isAdmin && prediction && (
            <div className={`text-center text-sm p-3 rounded-md font-medium border ${
              isGraded 
                ? 'bg-primary/10 text-primary border-primary/20' 
                : 'bg-accent/10 text-accent border-accent/20'
            }`}>
              {isGraded ? `تم التقييم - حصلت على ${prediction.pointsEarned} نقطة` : 'توقعك معلق بانتظار النتيجة'}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
