"use client"
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Medal, Trophy } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

type Profile = {
  id: string;
  username: string;
  total_points: number;
}

export default function LeaderboardPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setCurrentUserId(session.user.id);
      }

      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, username, total_points')
        .eq('is_admin', false)
        .order('total_points', { ascending: false });

      if (profilesData) {
        setUsers(profilesData);
      }
      setLoading(false);
    };

    fetchData();
  }, [supabase]);

  const getBadgeColor = (index: number) => {
    if (index === 0) return "text-yellow-400 bg-yellow-400/10 border-yellow-400/30"; // Gold
    if (index === 1) return "text-slate-300 bg-slate-300/10 border-slate-300/30";   // Silver
    if (index === 2) return "text-amber-600 bg-amber-600/10 border-amber-600/30";   // Bronze
    return "text-muted-foreground bg-card border-border";
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <Trophy className="w-16 h-16 text-accent mx-auto mb-4" />
            <h1 className="text-4xl font-black">جدول الترتيب</h1>
            <p className="text-muted-foreground mt-2">
              أفضل المتوقعين والمنافسة على المراكز الأولى
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl shadow-xl overflow-hidden">
            <table className="w-full text-right">
              <thead className="bg-card-hover/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-bold text-muted-foreground w-20">المركز</th>
                  <th className="px-6 py-4 font-bold text-muted-foreground">المتسابق</th>
                  <th className="px-6 py-4 font-bold text-muted-foreground w-32 text-center">النقاط</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user, index) => {
                  const isTop3 = index < 3;
                  const isMe = currentUserId === user.id;

                  return (
                    <tr 
                      key={user.id} 
                      className={`transition-colors hover:bg-card-hover/30 ${isMe ? 'bg-primary/5' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border ${getBadgeColor(index)}`}>
                          {isTop3 ? <Medal className="w-4 h-4" /> : index + 1}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold flex items-center gap-2">
                        {user.username}
                        {isMe && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                            أنت
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-black text-lg text-accent">
                          {user.total_points}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center py-8 text-muted-foreground">
                      لا يوجد متسابقين حتى الآن.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
