"use client"
import { useEffect, useState } from "react";
import { X, Trophy, Target, Award, Star } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export interface PlayerProfile {
  id: string;
  username: string;
  total_points: number;
  rank: number;
}

interface PlayerCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: PlayerProfile | null;
}

export function PlayerCardModal({ isOpen, onClose, user }: PlayerCardModalProps) {
  const [hitRate, setHitRate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      setLoading(true);
      setHitRate(null);

      // Fetch user's predictions
      const { data: userPredictions } = await supabase
        .from('predictions')
        .select('question_id, selected_option_index')
        .eq('user_id', user.id);

      // Fetch graded questions (where correct_option_index is not null)
      const { data: gradedQuestions } = await supabase
        .from('questions')
        .select('id, correct_option_index')
        .not('correct_option_index', 'is', null);

      let totalEvaluated = 0;
      let totalCorrect = 0;

      if (userPredictions && gradedQuestions) {
        userPredictions.forEach((pred: any) => {
          const q = gradedQuestions.find((g: any) => g.id === pred.question_id);
          if (q) {
            totalEvaluated++;
            if (q.correct_option_index === pred.selected_option_index) {
              totalCorrect++;
            }
          }
        });
      }

      const rate = totalEvaluated > 0 ? ((totalCorrect / totalEvaluated) * 100).toFixed(1) : "0.0";
      setHitRate(rate);
      setLoading(false);
    };

    if (isOpen) {
      fetchStats();
    }
  }, [isOpen, user, supabase]);

  if (!isOpen || !user) return null;

  // FIFA style card gradients based on rank
  const getCardStyle = (rank: number) => {
    if (rank === 1) return "from-[#ffdf73] via-[#d4af37] to-[#aa7c11] text-black border-[#ffe55c] shadow-[0_0_30px_rgba(212,175,55,0.4)]"; // Gold
    if (rank === 2) return "from-[#e2e8f0] via-[#94a3b8] to-[#475569] text-black border-[#f8fafc] shadow-[0_0_30px_rgba(148,163,184,0.4)]"; // Silver
    if (rank === 3) return "from-[#d97706] via-[#b45309] to-[#78350f] text-white border-[#fbbf24] shadow-[0_0_30px_rgba(180,83,9,0.4)]"; // Bronze
    return "from-[#1e293b] to-[#0f172a] text-white border-slate-700/50 backdrop-blur-md"; // Base Dark Glass
  };

  const isDarkText = user.rank === 1 || user.rank === 2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="relative transform transition-all animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-foreground z-10 shadow-xl"
        >
          <X className="w-5 h-5" />
        </button>

        {/* The FIFA Card */}
        <div className={`relative w-[300px] h-[450px] rounded-t-full rounded-b-xl border-4 overflow-hidden bg-gradient-to-br ${getCardStyle(user.rank)} flex flex-col items-center p-6 pt-12`}>
          
          {/* Inner Border Details */}
          <div className="absolute inset-1 border-2 border-white/20 rounded-t-full rounded-b-lg pointer-events-none"></div>
          
          {/* Rank Badge (Top Left of Card) */}
          <div className="absolute top-16 right-8 flex flex-col items-center">
            <span className={`text-4xl font-black ${isDarkText ? 'text-black/80' : 'text-white/90'}`}>{user.rank}</span>
            <span className={`text-xs font-bold uppercase tracking-widest ${isDarkText ? 'text-black/50' : 'text-white/50'}`}>Rank</span>
          </div>

          <div className="absolute top-16 left-8 flex flex-col items-center">
             <Trophy className={`w-8 h-8 mb-1 ${isDarkText ? 'text-black/80' : 'text-white/90'}`} />
          </div>

          {/* Profile Picture Placeholder */}
          <div className={`w-32 h-32 rounded-full border-4 mt-8 flex items-center justify-center shadow-inner overflow-hidden
            ${isDarkText ? 'border-black/20 bg-black/5' : 'border-white/20 bg-white/5'}`}>
            <Star className={`w-16 h-16 ${isDarkText ? 'text-black/30' : 'text-white/30'}`} />
          </div>

          {/* Username */}
          <h2 className={`mt-6 text-3xl font-black text-center uppercase tracking-wider w-full truncate ${isDarkText ? 'text-black/90' : 'text-white/90'}`}>
            {user.username}
          </h2>

          <div className={`w-full h-px my-4 ${isDarkText ? 'bg-black/20' : 'bg-white/20'}`}></div>

          {/* Stats Grid */}
          <div className="w-full grid grid-cols-2 gap-4 px-2">
            <div className="flex flex-col items-center">
              <span className={`text-2xl font-black flex items-center gap-1 ${isDarkText ? 'text-black/90' : 'text-white/90'}`}>
                {user.total_points}
              </span>
              <span className={`text-xs font-bold uppercase ${isDarkText ? 'text-black/50' : 'text-white/50'}`}>Points</span>
            </div>
            <div className="flex flex-col items-center border-l border-white/20">
              <span className={`text-2xl font-black flex items-center gap-1 ${isDarkText ? 'text-black/90' : 'text-white/90'}`}>
                {loading ? '...' : `${hitRate}%`}
              </span>
              <span className={`text-xs font-bold uppercase ${isDarkText ? 'text-black/50' : 'text-white/50'}`}>Hit Rate</span>
            </div>
          </div>

          <div className={`w-full h-px mt-4 mb-2 ${isDarkText ? 'bg-black/20' : 'bg-white/20'}`}></div>
          <div className="flex gap-1">
            <Award className={`w-4 h-4 ${isDarkText ? 'text-black/30' : 'text-white/30'}`} />
            <Award className={`w-4 h-4 ${isDarkText ? 'text-black/30' : 'text-white/30'}`} />
            <Award className={`w-4 h-4 ${isDarkText ? 'text-black/30' : 'text-white/30'}`} />
          </div>

        </div>
      </div>
    </div>
  );
}
