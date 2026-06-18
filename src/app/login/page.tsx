"use client"
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trophy, LogIn, AlertCircle, KeyRound, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Navbar } from "@/components/Navbar";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isResetMode, setIsResetMode] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setLoading(true);
    setError(null);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      setLoading(false);
      return;
    }

    // Check if admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', data.user.id)
      .single();

    if (profile?.is_admin) {
      router.push("/admin");
    } else {
      router.push("/dashboard");
    }
    
    router.refresh();
  };

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("الرجاء إدخال البريد الإلكتروني أولاً");
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError("حدث خطأ أثناء إرسال الرابط: " + error.message);
    } else {
      setSuccessMsg("تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني بنجاح! يرجى تفقد صندوق الوارد.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-card border border-border p-8 rounded-2xl shadow-2xl relative overflow-hidden">
          {/* Decorative element */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full blur-2xl"></div>
          
          <div className="text-center mb-8 relative z-10">
            <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mx-auto mb-4 border border-border shadow-inner">
              {isResetMode ? <KeyRound className="w-8 h-8 text-primary" /> : <Trophy className="w-8 h-8 text-accent" />}
            </div>
            <h1 className="text-2xl font-black">{isResetMode ? "استعادة كلمة المرور" : "تسجيل الدخول"}</h1>
            <p className="text-muted-foreground mt-2 text-sm">
              {isResetMode ? "أدخل بريدك الإلكتروني لنرسل لك رابط إعادة التعيين" : "مرحباً بك مجدداً في مسابقة التوقعات"}
            </p>
          </div>

          {isResetMode ? (
            <form onSubmit={handleResetRequest} className="space-y-6 relative z-10">
              {error && (
                <div className="bg-destructive/10 text-destructive border border-destructive/20 p-3 rounded-md text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {successMsg && (
                <div className="bg-green-500/10 text-green-500 border border-green-500/20 p-3 rounded-md text-sm flex items-center gap-2">
                  <span>{successMsg}</span>
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-bold">البريد الإلكتروني</label>
                <Input 
                  type="email" 
                  placeholder="name@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  dir="ltr"
                  className="text-right"
                />
              </div>

              <div className="space-y-3">
                <Button type="submit" className="w-full gap-2" size="lg" disabled={loading}>
                  {loading ? "جاري الإرسال..." : "إرسال رابط الاستعادة"}
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full gap-2 text-muted-foreground" 
                  onClick={() => {
                    setIsResetMode(false);
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  disabled={loading}
                >
                  <ArrowRight className="w-4 h-4" />
                  العودة لتسجيل الدخول
                </Button>
              </div>
            </form>
          ) : (
            <>
              <form onSubmit={handleLogin} className="space-y-6 relative z-10">
                {error && (
                  <div className="bg-destructive/10 text-destructive border border-destructive/20 p-3 rounded-md text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-bold">البريد الإلكتروني</label>
                  <Input 
                    type="email" 
                    placeholder="name@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    dir="ltr"
                    className="text-right"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold">كلمة المرور</label>
                    <button 
                      type="button" 
                      onClick={() => {
                        setIsResetMode(true);
                        setError(null);
                        setSuccessMsg(null);
                      }}
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      نسيت كلمة المرور؟
                    </button>
                  </div>
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    dir="ltr"
                    className="text-right"
                  />
                </div>

                <Button type="submit" className="w-full gap-2" size="lg" disabled={loading}>
                  <LogIn className="w-4 h-4" />
                  {loading ? "جاري الدخول..." : "دخول"}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm relative z-10">
                <span className="text-muted-foreground">ليس لديك حساب؟ </span>
                <Link href="/signup" className="text-primary font-bold hover:underline">
                  سجل الآن
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
