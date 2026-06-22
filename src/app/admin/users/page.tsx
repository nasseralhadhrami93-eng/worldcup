"use client"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Search, Users, ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

type Profile = {
  id: string;
  username: string;
  total_points: number;
  created_at: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [usersList, setUsersList] = useState<Profile[]>([]);
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
    const fetchUsers = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_admin', false)
        .order('created_at', { ascending: false });
        
      if (data) {
        setUsersList(data);
      }
    };
    fetchUsers();
  }, [supabase]);

  if (!mounted) return null;

  // Filter by search query
  const filteredUsers = usersList.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8 border-b border-white/10 pb-4">
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="mb-4 text-muted-foreground hover:text-foreground gap-2">
              <ArrowRight className="w-4 h-4" /> العودة للوحة الإدارة
            </Button>
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-3xl font-black">قائمة المشتركين</h1>
                <p className="text-muted-foreground text-sm mt-1">
                  إدارة والبحث في جميع حسابات المشتركين في منصة التوقعات
                </p>
              </div>
            </div>
            
            {/* Stats Counter */}
            <div className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-2 flex items-center gap-3">
              <div className="text-primary font-bold">إجمالي المسجلين</div>
              <div className="text-2xl font-black">{usersList.length}</div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6 relative">
          <Search className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="البحث بالاسم..." 
            className="pl-4 pr-12 h-14 bg-white/5 border-white/10 text-lg rounded-xl focus-visible:ring-primary/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Users Table / Cards */}
        <div className="bg-card/50 border border-white/5 rounded-xl overflow-hidden shadow-2xl backdrop-blur-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead className="bg-black/40 border-b border-white/10">
                <tr>
                  <th className="px-6 py-5 font-bold">المشترك</th>
                  <th className="px-6 py-5 font-bold">تاريخ الانضمام</th>
                  <th className="px-6 py-5 font-bold text-center">النقاط</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-base">{user.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {user.created_at 
                          ? format(new Date(user.created_at.replace(' ', 'T')), "dd MMM yyyy - hh:mm a", { locale: ar })
                          : "غير معروف"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-black text-lg">
                      {user.total_points}
                    </td>
                  </tr>
                ))}
                
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-16 text-center text-muted-foreground">
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      لا توجد نتائج مطابقة لبحثك.
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
