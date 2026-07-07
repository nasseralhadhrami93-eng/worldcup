"use client"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { format, isPast } from "date-fns";
import { ar } from "date-fns/locale";
import { ShieldCheck, Lock, Unlock, CheckCircle, Edit, Plus, Trash2, Users, Bot, Loader2 } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

import dynamic from "next/dynamic";
import { type Question } from "@/components/admin/QuestionsEditor";

// Lazy loading the QuestionsEditor for better performance
const QuestionsEditor = dynamic(() => import("@/components/admin/QuestionsEditor"), {
  loading: () => <div className="p-4 text-center text-muted-foreground animate-pulse">جاري تحميل أداة الأسئلة...</div>,
  ssr: false
});

export default function AdminPage() {
  const router = useRouter();
  const supabase = createClient();
  const [mounted, setMounted] = useState(false);

  const [matches, setMatches] = useState<any[]>([]);
  const [usersCount, setUsersCount] = useState(0);

  // New Match State
  const [homeName, setHomeName] = useState("");
  const [awayName, setAwayName] = useState("");
  const [kickoff, setKickoff] = useState("");
  const [newMatchQuestions, setNewMatchQuestions] = useState<Question[]>([]);
  const [isQuestionsEdited, setIsQuestionsEdited] = useState(false);

  // Grading State (matchId -> { qId -> answer })
  const [gradingAnswers, setGradingAnswers] = useState<Record<string, Record<string, string>>>({});
  const [generatingAI, setGeneratingAI] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    const { data: matchesData } = await supabase
      .from('matches')
      .select(`
        id, team_one, team_two, match_time, manual_override,
        questions ( id, question_text, options, correct_option_index )
      `)
      .order('match_time', { ascending: false });

    if (matchesData) setMatches(matchesData);

    const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_admin', false);
    if (count !== null) setUsersCount(count);
  };

  useEffect(() => {
    setMounted(true);
    fetchDashboardData();
  }, [supabase]);

  // Handle Dynamic Generation of New Match Questions
  useEffect(() => {
    if (!isQuestionsEdited) {
      const home = homeName.trim() || "الفريق الأول";
      const away = awayName.trim() || "الفريق الثاني";
      
      setNewMatchQuestions([
        { text: 'من هو الفريق المتأهل للدور القادم؟', options: [{ id: '0', text: home }, { id: '1', text: away }] },
        { text: 'من سيسجل أولاً في المباراة؟', options: [{ id: '0', text: home }, { id: '1', text: away }, { id: '2', text: 'لا توجد أهداف في الوقت الأصلي والإضافي' }] },
        { text: 'ما هي نتيجة المباراة النهائية (فارق الأهداف)؟', options: [
            { id: '0', text: `فوز ${home} بفارق هدف` }, 
            { id: '1', text: `فوز ${home} بفارق هدفين أو أكثر` }, 
            { id: '2', text: `فوز ${away} بفارق هدف` },
            { id: '3', text: `فوز ${away} بفارق هدفين أو أكثر` },
            { id: '4', text: `الحسم بركلات الترجيح (تأهل ${home})` },
            { id: '5', text: `الحسم بركلات الترجيح (تأهل ${away})` }
          ] 
        },
        { text: 'في أي وقت سيتم تسجيل أول هدف في المباراة؟', options: [
            { id: '0', text: 'الشوط الأول' }, 
            { id: '1', text: 'الشوط الثاني' }, 
            { id: '2', text: 'الأشواط الإضافية' },
            { id: '3', text: 'لا توجد أهداف' }
          ] 
        },
        { text: 'كم عدد البطاقات الملونة (الصفراء والحمراء) التي ستشهدها المباراة؟', note: 'الإنذار الثاني ثم الطرد = 3 بطاقات. الطرد المباشر = بطاقة.',
          options: [ { id: '0', text: '0-2' }, { id: '1', text: '3-4' }, { id: '2', text: '5-6' }, { id: '3', text: '7+' } ] 
        },
        { text: 'هل سينجح أي من الفريقين في الحفاظ على نظافة شباكه؟', options: [
            { id: '0', text: `نعم، ${home} فقط` }, 
            { id: '1', text: `نعم، ${away} فقط` }, 
            { id: '2', text: 'لا' },
            { id: '3', text: 'نعم، كلاهما' }
          ] 
        },
        { text: 'هل ستشهد المباراة احتساب ركلة جزاء؟', options: [
            { id: '0', text: 'نعم، مسجلة' }, 
            { id: '1', text: 'نعم، مهدرة' }, 
            { id: '2', text: 'لا' }
          ] 
        },
        { text: 'كم عدد الأهداف المسجلة في المباراة؟', note: 'تُحسب أهداف الوقت الأصلي والإضافي فقط ولا تشمل أهداف ركلات الترجيح', options: [
            { id: '0', text: 'لا توجد أهداف' }, 
            { id: '1', text: 'هدف' }, 
            { id: '2', text: 'هدفين' },
            { id: '3', text: 'ثلاثة أهداف' },
            { id: '4', text: 'أربعة أهداف' },
            { id: '5', text: 'خمسة أهداف أو أكثر' }
          ] 
        }
      ]);
    }
  }, [homeName, awayName, isQuestionsEdited]);

  if (!mounted) return null;

  const handleAddMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!homeName || !awayName || !kickoff) return;

    const { data: newMatch, error: matchError } = await supabase
      .from('matches')
      .insert({
        team_one: homeName,
        team_two: awayName,
        match_time: new Date(kickoff).toISOString(),
        manual_override: 'auto'
      })
      .select('id')
      .single();

    if (matchError || !newMatch) {
      alert("خطأ أثناء الإضافة: " + matchError?.message);
      return;
    }

    const qsToInsert = newMatchQuestions.map((q, idx) => ({
      match_id: newMatch.id,
      question_text: q.note ? `${q.text} (${q.note})` : q.text,
      options: q.options?.map(o => o.text) || [],
      question_order: idx
    }));

    await supabase.from('questions').insert(qsToInsert);

    setHomeName(""); setAwayName(""); setKickoff("");
    setIsQuestionsEdited(false);
    fetchDashboardData();
    alert("تم إضافة المباراة بنجاح!");
  };

  const updateManualOverride = async (matchId: string, state: string) => {
    const { error } = await supabase.from('matches').update({ manual_override: state }).eq('id', matchId);
    if (error) {
      alert("حدث خطأ! يرجى التأكد من تشغيل كود الـ SQL في Supabase\n" + error.message);
    }
    fetchDashboardData();
  };

  const deleteMatch = async (matchId: string) => {
    if (confirm("هل أنت متأكد من رغبتك في حذف هذه المباراة نهائياً؟")) {
      await supabase.from('matches').delete().eq('id', matchId);
      fetchDashboardData();
    }
  };

  const handleGradeMatch = async (match: any) => {
    const answers = gradingAnswers[match.id];
    if (!answers || Object.keys(answers).length !== match.questions.length) {
      alert("الرجاء إدخال جميع الإجابات الصحيحة قبل التقييم.");
      return;
    }
    
    // Call Supabase RPC to grade securely and award points
    const { error } = await supabase.rpc('grade_match', { match_uuid: match.id, results: answers });
    if (error) {
      alert("حدث خطأ أثناء التقييم: " + error.message);
      return;
    }

    alert("تم التقييم وتحديث النقاط!");
    fetchDashboardData();
  };

  const updateGradingAnswer = (matchId: string, qId: string, val: string) => {
    setGradingAnswers(prev => ({
      ...prev,
      [matchId]: {
        ...(prev[matchId] || {}),
        [qId]: val
      }
    }));
  };

  const handleGenerateAI = async (match: any) => {
    setGeneratingAI(match.id);
    try {
      const res = await fetch('/api/match-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamOne: match.team_one,
          teamTwo: match.team_two,
          matchTime: match.match_time
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch AI results');
      
      if (data.answers && Array.isArray(data.answers)) {
        const newAnswers: Record<string, string> = {};
        // Match each answer to the corresponding question ordered by 'question_order' (which we assume matches the array)
        // Ensure questions are sorted by question_order just in case
        const sortedQs = [...match.questions].sort((a, b) => (a.question_order || 0) - (b.question_order || 0));
        sortedQs.forEach((q: any, i: number) => {
          if (data.answers[i] !== undefined) {
            newAnswers[q.id] = data.answers[i].toString();
          }
        });
        
        setGradingAnswers(prev => ({
          ...prev,
          [match.id]: newAnswers
        }));
        alert('تم جلب الإجابات بنجاح! يرجى مراجعتها وتأكيدها.');
      } else {
        throw new Error('تنسيق الاستجابة غير صحيح');
      }
    } catch (error: any) {
      alert("خطأ أثناء الذكاء الاصطناعي: " + error.message);
    } finally {
      setGeneratingAI(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center gap-3 border-b border-border pb-4">
          <ShieldCheck className="w-8 h-8 text-destructive" />
          <div>
            <h1 className="text-3xl font-black">لوحة الإدارة</h1>
            <p className="text-muted-foreground text-sm mt-1">إضافة المباريات، التحكم بالقفل، وإدخال النتائج الرسمية</p>
          </div>
        </div>

        <div className="space-y-12">
          
          {/* Section 1: Add Match */}
          <section className="bg-card border border-border p-6 rounded-xl relative">
            <h2 className="text-xl font-bold mb-4">إضافة مباراة جديدة</h2>
            <form onSubmit={handleAddMatch} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm">الفريق الأول</label>
                  <Input placeholder="مثال: البرازيل" value={homeName} onChange={e => setHomeName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm">الفريق الثاني</label>
                  <Input placeholder="مثال: عمان" value={awayName} onChange={e => setAwayName(e.target.value)} required />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm">وقت البداية</label>
                  <Input type="datetime-local" value={kickoff} onChange={e => setKickoff(e.target.value)} required />
                </div>
              </div>

              <div className="mt-8 bg-background border border-border p-4 rounded-lg shadow-inner">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg text-primary flex items-center gap-2"><CheckCircle className="w-4 h-4" /> معاينة الأسئلة</h3>
                </div>
                <QuestionsEditor questions={newMatchQuestions} onChange={(qs) => { setIsQuestionsEdited(true); setNewMatchQuestions(qs); }} />
              </div>

              <Button type="submit" variant="default" size="lg" className="w-full">حفظ المباراة</Button>
            </form>
          </section>

          {/* Manage Matches */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold mb-4">إدارة المباريات</h2>
            {matches.map(match => {
              const isGraded = match.questions.some((q:any) => q.correct_option_index !== null);
              const isLocked = match.manual_override === 'closed' || (match.manual_override === 'auto' && isPast(new Date(match.match_time.replace(' ', 'T'))));

              return (
                <div key={match.id} className="bg-card border border-border p-6 rounded-xl flex flex-col md:flex-row gap-6">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-lg">
                      {match.team_one} <span className="text-muted-foreground font-bold">ضد</span> {match.team_two}
                    </div>
                    <span className="text-sm font-medium" dir="ltr">
                      {format(new Date(match.match_time.replace(' ', 'T')), "dd MMM yyyy - HH:mm", { locale: ar })}
                    </span>
                    
                    <div className="pt-2 flex gap-2">
                      <div className="flex bg-muted rounded-md p-1">
                        <Button 
                          variant={match.manual_override === 'auto' || !match.manual_override ? "default" : "ghost"} 
                          size="sm" 
                          className="h-8 px-3 text-xs"
                          onClick={() => updateManualOverride(match.id, 'auto')} 
                          disabled={isGraded}>تلقائي</Button>
                        <Button 
                          variant={match.manual_override === 'open' ? "default" : "ghost"} 
                          size="sm" 
                          className="h-8 px-3 text-xs"
                          onClick={() => updateManualOverride(match.id, 'open')} 
                          disabled={isGraded}>فتح إجباري</Button>
                        <Button 
                          variant={match.manual_override === 'closed' ? "default" : "ghost"} 
                          size="sm" 
                          className="h-8 px-3 text-xs"
                          onClick={() => updateManualOverride(match.id, 'closed')} 
                          disabled={isGraded}>قفل إجباري</Button>
                      </div>
                      <Button variant="destructive" size="sm" className="h-8 px-3 text-xs ml-auto" onClick={() => deleteMatch(match.id)}>
                        <Trash2 className="w-4 h-4" /> حذف
                      </Button>
                    </div>
                  </div>

                  <div className="flex-1 bg-background rounded-lg p-4 border border-border">
                    <h3 className="font-bold text-sm mb-3">إدخال النتائج الرسمية:</h3>
                    {isGraded ? (
                      <div className="text-primary font-bold bg-primary/10 p-3 rounded-md border border-primary/20 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" /> تم تقييم هذه المباراة
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center mb-3">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            type="button"
                            onClick={() => handleGenerateAI(match)}
                            disabled={generatingAI === match.id}
                            className="text-xs bg-indigo-500/10 text-indigo-500 border-indigo-500/20 hover:bg-indigo-500/20 w-full"
                          >
                            {generatingAI === match.id ? (
                              <Loader2 className="w-4 h-4 ml-2 animate-spin" /> 
                            ) : (
                              <Bot className="w-4 h-4 ml-2" />
                            )}
                            توليد الإجابات بـ AI (Gemini)
                          </Button>
                        </div>
                        {match.questions.sort((a: any, b: any) => (a.question_order || 0) - (b.question_order || 0)).map((q: any) => (
                          <div key={q.id}>
                            <label className="text-xs text-muted-foreground mb-1 block">{q.question_text}</label>
                            <select 
                              className="w-full bg-card border border-border rounded-md px-2 py-1 text-sm focus:outline-none"
                              value={gradingAnswers[match.id]?.[q.id] || ""}
                              onChange={e => updateGradingAnswer(match.id, q.id, e.target.value)}
                            >
                              <option value="" disabled>اختر الإجابة الصحيحة...</option>
                              {q.options.map((opt: string, i: number) => (
                                <option key={i} value={i}>{opt}</option>
                              ))}
                            </select>
                          </div>
                        ))}
                        <Button size="sm" variant="gold" className="w-full mt-2" onClick={() => handleGradeMatch(match)}>تأكيد النتائج وحساب النقاط</Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </section>

          {/* Registered Users Link */}
          <section className="bg-primary/5 border border-primary/20 rounded-xl p-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2"><Users className="w-6 h-6 text-primary" /> إدارة المشتركين</h2>
            </div>
            <Link href="/admin/users">
              <Button size="lg" variant="default" className="gap-2"><Users className="w-5 h-5" /> عرض قائمة المشتركين ({usersCount})</Button>
            </Link>
          </section>

        </div>
      </main>
    </div>
  );
}
