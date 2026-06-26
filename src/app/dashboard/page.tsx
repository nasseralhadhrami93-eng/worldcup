"use client"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { MatchCard } from "@/components/MatchCard";
import { LayoutDashboard } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { Sponsors } from "@/components/Sponsors";

// Types matching Supabase schema + UI needs
type Question = {
  id: string;
  text: string;
  options?: { id: string; text: string }[];
  note?: string; // Not explicitly in SQL, but UI uses it. We can skip or add to text
}

type Match = {
  id: string;
  homeTeam: { name: string; flag: string };
  awayTeam: { name: string; flag: string };
  kickoffTime: string;
  isLocked: boolean;
  questions: Question[];
  results?: Record<string, string>;
}

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      setUserId(session.user.id);

      // Fetch Matches & Questions (Filter out matches older than 48 hours to optimize mobile payload)
      const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
      const { data: matchesData } = await supabase
        .from('matches')
        .select(`
          id, team_one, team_two, match_time, is_manually_locked,
          questions (
            id, question_text, options, correct_option_index
          )
        `)
        .gte('match_time', twoDaysAgo);

      if (matchesData) {
        const mappedMatches: Match[] = matchesData.map(m => {
          // Parse "🏳️ TeamName" if needed, or fallback
          const t1 = m.team_one.split(' ');
          const t2 = m.team_two.split(' ');
          return {
            id: m.id,
            homeTeam: { flag: t1.length > 1 ? t1[0] : '🏳️', name: t1.length > 1 ? t1.slice(1).join(' ') : m.team_one },
            awayTeam: { flag: t2.length > 1 ? t2[0] : '🏳️', name: t2.length > 1 ? t2.slice(1).join(' ') : m.team_two },
            kickoffTime: m.match_time,
            isLocked: m.is_manually_locked,
            questions: m.questions.map((q: any) => ({
              id: q.id,
              text: q.question_text,
              options: q.options?.map((opt: string, i: number) => ({ id: i.toString(), text: opt }))
            })),
            results: m.questions.reduce((acc: any, q: any) => {
              if (q.correct_option_index !== null) {
                acc[q.id] = q.correct_option_index.toString();
              }
              return acc;
            }, {})
          };
        });
        setMatches(mappedMatches);
      }

      // Fetch user's predictions
      const { data: predsData } = await supabase
        .from('predictions')
        .select('*')
        .eq('user_id', session.user.id);
      
      if (predsData) {
        // Group by match_id
        const grouped = predsData.reduce((acc: any, p: any) => {
          if (!acc[p.match_id]) acc[p.match_id] = {};
          acc[p.match_id][p.question_id] = p.selected_option_index.toString();
          return acc;
        }, {});
        
        const mappedPreds = Object.keys(grouped).map(matchId => {
          const matchInfo = matchesData?.find(m => m.id === matchId);
          const allGraded = matchInfo?.questions.every((q: any) => q.correct_option_index !== null);
          const hasAnyGraded = matchInfo?.questions.some((q: any) => q.correct_option_index !== null);
          
          let points = 0;
          if (hasAnyGraded) {
             matchInfo?.questions.forEach((q: any) => {
               if (q.correct_option_index !== null && grouped[matchId][q.id] === q.correct_option_index.toString()) {
                 points += 1;
               }
             });
          }

          return {
            matchId,
            userId: session.user.id,
            answers: grouped[matchId],
            status: hasAnyGraded ? 'graded' : 'pending',
            pointsEarned: points
          };
        });
        setPredictions(mappedPreds);
      }
      setLoading(false);
    };

    fetchData();
  }, [router, supabase]);

  const handlePredictionSubmit = async (matchId: string, answers: Record<string, string>) => {
    if (!userId) return;

    // Upsert predictions
    const updates = Object.entries(answers).map(([qId, val]) => ({
      user_id: userId,
      match_id: matchId,
      question_id: qId,
      selected_option_index: parseInt(val)
    }));

    const { error } = await supabase.from('predictions').upsert(updates, { onConflict: 'user_id, question_id' });
    if (error) {
      alert("حدث خطأ أثناء حفظ التوقعات: " + error.message);
    } else {
      alert("تم حفظ توقعاتك بنجاح!");
      // Update local state loosely
      setPredictions(prev => {
        const existing = prev.filter(p => p.matchId !== matchId);
        return [...existing, { matchId, userId, answers, status: 'pending', pointsEarned: 0 }];
      });
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>;
  }

  const sortedMatches = [...matches].sort((a, b) => 
    new Date(a.kickoffTime.replace(' ', 'T')).getTime() - new Date(b.kickoffTime.replace(' ', 'T')).getTime()
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center gap-3 border-b border-border pb-4">
          <LayoutDashboard className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-black">توقعات مباريات اليوم</h1>
            <p className="text-muted-foreground text-sm mt-1">
              استعرض المباريات المتاحة وأدخل توقعاتك.
            </p>
          </div>
        </div>

        {sortedMatches.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-2xl border border-border">
            <p className="text-muted-foreground">لا توجد مباريات متاحة حالياً.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedMatches.map(match => {
              const userPrediction = predictions.find(
                p => p.matchId === match.id
              );
              return (
                <MatchCard
                  key={match.id}
                  match={match}
                  prediction={userPrediction}
                  onSubmitPrediction={handlePredictionSubmit}
                />
              );
            })}
          </div>
        )}
      </main>

      {/* Sponsors Section */}
      <div className="border-t border-white/5 bg-black/20 mt-auto">
        <Sponsors />
      </div>
    </div>
  );
}
