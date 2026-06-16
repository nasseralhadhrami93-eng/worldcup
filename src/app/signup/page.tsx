"use client"
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, Trophy, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Navbar } from "@/components/Navbar";
import { createClient } from "@/utils/supabase/client";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !name.trim() || !password) return;

    setLoading(true);
    setError(null);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: name,
        }
      }
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // Automatically redirected to dashboard via middleware, or push directly:
    router.push("/dashboard");
    router.refresh();
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
              <Trophy className="w-8 h-8 text-accent" />
            </div>
            <h1 className="text-2xl font-black">إنشاء حساب جديد</h1>
            <p className="text-muted-foreground mt-2 text-sm">انضم للمنافسة واجمع النقاط!</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-6 relative z-10">
            {error && (
              <div className="bg-destructive/10 text-destructive border border-destructive/20 p-3 rounded-md text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-bold">اسم المستخدم</label>
              <Input 
                type="text" 
                placeholder="أدخل اسمك لإنشاء الحساب..." 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
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
              <label className="text-sm font-bold">كلمة المرور</label>
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

            <Button type="submit" className="w-full gap-2" size="lg" disabled={loading}>
              <UserPlus className="w-4 h-4" />
              {loading ? "جاري التسجيل..." : "سجل حسابك"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm relative z-10">
            <span className="text-muted-foreground">لديك حساب بالفعل؟ </span>
            <Link href="/login" className="text-primary font-bold hover:underline">
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
