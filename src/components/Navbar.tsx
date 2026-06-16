"use client"
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trophy, LogOut, LayoutDashboard, Settings } from "lucide-react";
import { Button } from "./ui/Button";
import { createClient } from "@/utils/supabase/client";

type Profile = {
  id: string;
  username: string;
  is_admin: boolean;
  total_points: number;
}

export function Navbar() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setProfile(null);
        setLoading(false);
        return;
      }
      
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      if (data) {
        setProfile(data);
      }
      setLoading(false);
    };

    fetchProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchProfile();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/40 backdrop-blur-xl shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-black text-xl tracking-tight">
          <Trophy className="w-6 h-6 text-primary" />
          <span className="bg-gradient-to-l from-primary to-accent bg-clip-text text-transparent">كأس العالم 26</span>
        </Link>
        
        <div className="flex items-center gap-4">
          <Link href="/leaderboard" className="text-sm font-medium hover:text-primary transition-colors">
            جدول الترتيب
          </Link>
          
          {!loading && (
            profile ? (
              <div className="flex items-center gap-3">
                {profile.is_admin ? (
                  <Link href="/admin">
                    <Button variant="ghost" size="sm" className="gap-2 text-accent hover:text-accent">
                      <Settings className="h-4 w-4" />
                      الإدارة
                    </Button>
                  </Link>
                ) : (
                  <Link href="/dashboard">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      توقعاتي
                    </Button>
                  </Link>
                )}
                
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground hidden sm:inline">مرحباً،</span>
                  <span className="font-bold">{profile.username}</span>
                  {!profile.is_admin && (
                    <span className="bg-accent/10 text-accent px-2 py-0.5 rounded-full text-xs font-bold border border-accent/20">
                      {profile.total_points} نقطة
                    </span>
                  )}
                </div>
                
                <Button variant="outline" size="icon" onClick={logout} title="تسجيل الخروج">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button variant="default" size="sm">
                  تسجيل الدخول
                </Button>
              </Link>
            )
          )}
        </div>
      </div>
    </nav>
  );
}
