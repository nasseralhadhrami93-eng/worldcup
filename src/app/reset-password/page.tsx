"use client"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, KeyRound, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Navbar } from "@/components/Navbar";
import { createClient } from "@/utils/supabase/client";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Optional: We can listen for hash changes or auth state changes
    // Usually Supabase automatically picks up the access_token from the URL hash
    // and establishes a session. If a session is established, we can update the password.
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // If there is no session and no hash in URL, this page might not work as expected.
        // But we allow it to render so the user sees the form.
        // The updateUser call will fail if the user is not authenticated via the token.
      }
    };
    checkSession();
  }, [supabase.auth]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) return;

    if (password !== confirmPassword) {
      setError("كلمات المرور غير متطابقة");
      return;
    }

    if (password.length < 6) {
      setError("كلمة المرور يجب أن تتكون من 6 أحرف على الأقل");
      return;
    }

    setLoading(true);
    setError(null);

    const { error: updateError } = await supabase.auth.updateUser({
      password: password
    });

    if (updateError) {
      setError("حدث خطأ أثناء تحديث كلمة المرور: " + updateError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    
    // Redirect to login after 3 seconds
    setTimeout(() => {
      router.push("/login");
    }, 3000);
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
              <KeyRound className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-black">إعادة تعيين كلمة المرور</h1>
            <p className="text-muted-foreground mt-2 text-sm">قم بإدخال كلمة المرور الجديدة الخاصة بحسابك</p>
          </div>

          {success ? (
            <div className="text-center space-y-4 animate-in fade-in zoom-in duration-500">
              <div className="flex justify-center">
                <CheckCircle2 className="w-16 h-16 text-green-500" />
              </div>
              <p className="text-lg font-bold text-green-500">تم تحديث كلمة المرور بنجاح!</p>
              <p className="text-muted-foreground text-sm">جاري تحويلك لصفحة تسجيل الدخول...</p>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6 relative z-10">
              {error && (
                <div className="bg-destructive/10 text-destructive border border-destructive/20 p-3 rounded-md text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-bold">كلمة المرور الجديدة</label>
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  dir="ltr"
                  className="text-right"
                  minLength={6}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-bold">تأكيد كلمة المرور</label>
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  dir="ltr"
                  className="text-right"
                  minLength={6}
                />
              </div>

              <Button type="submit" className="w-full gap-2" size="lg" disabled={loading}>
                <ShieldCheck className="w-4 h-4" />
                {loading ? "جاري التحديث..." : "تحديث كلمة المرور"}
              </Button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
