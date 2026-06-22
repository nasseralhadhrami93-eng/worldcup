import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/Button";
import { Trophy, Target, TrendingUp } from "lucide-react";
import { Sponsors } from "@/components/Sponsors";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col items-center">
        {/* Hero Section */}
        <section className="w-full relative py-20 lg:py-32 overflow-hidden flex flex-col items-center justify-center text-center px-4">
          <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/40 via-background to-background"></div>
          
          <div className="z-10 max-w-4xl space-y-8 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-sm mb-4">
              <Trophy className="w-4 h-4 text-accent" />
              أكبر مسابقة توقعات كروية
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-black tracking-tight text-balance leading-tight">
              توقع النتائج. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-primary to-accent">
                اربح الجوائز.
              </span>
            </h1>
            
            <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl text-balance leading-relaxed">
              شارك في مسابقة توقعات كأس العالم 2026. توقع الفائز، النتيجة الصحيحة، والعديد من الأحداث واجمع النقاط لتتصدر الترتيب.
            </p>
            
            <div className="pt-4 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link href="/login" className="w-full sm:w-auto">
                <Button variant="gold" size="lg" className="w-full sm:w-auto text-lg gap-2">
                  <Target className="w-5 h-5" />
                  انضم للمسابقة الآن
                </Button>
              </Link>
              <Link href="/leaderboard" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg">
                  عرض جدول الترتيب
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* How to participate */}
        <section className="w-full py-20 bg-card/30 border-t border-border">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">كيفية المشاركة</h2>
              <p className="text-muted-foreground">ثلاث خطوات بسيطة لتكون بطل التوقعات</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Step 1 */}
              <div className="bg-card border border-border p-8 rounded-2xl text-center space-y-4 shadow-xl hover:-translate-y-1 transition-transform">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-black">1</span>
                </div>
                <h3 className="text-xl font-bold">سجل حسابك</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  أنشئ حسابك مجاناً وانضم لآلاف المشجعين في أكبر مسابقة لتوقعات المونديال.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-card border border-border p-8 rounded-2xl text-center space-y-4 shadow-xl hover:-translate-y-1 transition-transform">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-black">2</span>
                </div>
                <h3 className="text-xl font-bold">توقع قبل الصافرة</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  أدخل توقعاتك لكل مباراة قبل بدايتها. أجب على الأسئلة الخاصة بكل مباراة.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-card border border-border p-8 rounded-2xl text-center space-y-4 shadow-xl hover:-translate-y-1 transition-transform relative overflow-hidden">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-accent/10 rounded-full blur-2xl"></div>
                <div className="w-16 h-16 bg-accent/20 text-accent rounded-full flex items-center justify-center mx-auto mb-6 relative z-10 border border-accent/20">
                  <TrendingUp className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold relative z-10">اجمع النقاط وتصدر</h3>
                <p className="text-muted-foreground text-sm leading-relaxed relative z-10">
                  احصل على نقاط لكل توقع صحيح. تسلق جدول الترتيب ونافس على المراكز الأولى.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Sponsors Section */}
        <Sponsors />
      </main>
    </>
  );
}
