import { useState, useEffect } from "react";
import { db, handleFirestoreError, OperationType } from "../lib/firebase.ts";
import { collection, getDocs, query, limit, orderBy } from "firebase/firestore";
import { 
  Users, BarChart3, MessageCircle, AlertTriangle, 
  TrendingUp, ArrowUpRight, ArrowDownRight, Zap, 
  Activity, ShieldCheck, Search, Filter, MoreHorizontal,
  Database
} from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { doc, writeBatch, serverTimestamp } from "firebase/firestore";
import { cn } from "../lib/utils.ts";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 1240,
    matches: 890,
    activeChats: 342,
    reports: 12
  });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const seedUsers = async () => {
    try {
      setSeeding(true);
      const batch = writeBatch(db);
      
      const skillPairs = [
        ["React", "Video Editing"], ["Python", "Photography"], ["Figma", "Marketing"],
        ["Spanish", "Coding"], ["Yoga", "Branding"], ["Finance", "Guitar"],
        ["AI Models", "Public Speaking"], ["Cooking", "SaaS Scaling"], ["Product Management", "French"],
        ["Data Science", "Web3"], ["UI Design", "SEO"], ["Music Theory", "Copywriting"]
      ];

      const seedData = Array.from({ length: 25 }).map((_, i) => {
        const pairing = skillPairs[i % skillPairs.length];
        const userId = `bot_${i}_${Math.random().toString(36).substr(2, 5)}`;
        return {
          userId,
          name: [
            "Sarah", "Alex", "Mia", "Leo", "Elena", "Marcus", "Sophie", "Liam", "Zoe", "Dante",
            "Yuki", "Chloe", "Ivan", "Nina", "Oscar", "Maya", "Felix", "Aria", "Kai", "Luna"
          ][i % 20] + " " + ["Chen", "Rover", "Wong", "Silva", "Gomez", "Kahn", "Moretti", "O'Connor", "Kim", "Brooks"][i % 10],
          email: `demo_${i}@skillswap.ai`,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
          teaches: [pairing[0]],
          learns: [pairing[1]],
          bio: `Passionate ${pairing[0]} enthusiast here to exchange skills. I'm currently super excited about mastering ${pairing[1]}!`,
          points: 100 + (i * 10),
          xp: 200 + (i * 20),
          level: Math.floor(i / 5) + 1,
          role: "user",
          status: Math.random() > 0.3 ? "online" : "offline",
          onboarded: true,
          skillLevel: i % 3 === 0 ? "Expert" : "Intermediate",
          interests: ["Tech", "Art", "Growth", "Music"].slice(0, (i % 3) + 1),
          createdAt: serverTimestamp()
        };
      });

      seedData.forEach(user => {
        const ref = doc(db, "users", user.userId);
        batch.set(ref, user);
      });

      await batch.commit();
      alert("Successfully seeded 25 startup-quality users into Firestore!");
      window.location.reload();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "users");
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, orderBy("createdAt", "desc"), limit(10));
        const snap = await getDocs(q);
        setRecentUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, "users");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-brand-black bg-mesh p-10 overflow-y-auto">
      <header className="mb-12 flex justify-between items-end">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-brand-purple rounded-lg flex items-center justify-center glow-purple">
                 <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Admin Terminal</h1>
           </div>
           <p className="text-white/40 text-sm">Platform health and moderation oversight</p>
        </div>
        <div className="flex gap-4">
           <button 
             onClick={seedUsers}
             disabled={seeding}
             className="glass px-6 py-3 rounded-2xl flex items-center gap-3 hover:bg-white/10 transition-all text-xs font-bold disabled:opacity-50"
           >
              <Database className={cn("w-4 h-4", seeding && "animate-spin")} />
              <span>{seeding ? "Seeding..." : "Seed Firestore Users"}</span>
           </button>
           <div className="glass px-6 py-3 rounded-2xl flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22C55E]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">System Operational</span>
           </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
         {[
           { label: "Active Swappers", count: stats.users, trend: "+12%", icon: <Users className="text-brand-purple" />, positive: true },
           { label: "Successful Matches", count: stats.matches, trend: "+8%", icon: <Zap className="text-brand-cyan" />, positive: true },
           { label: "Chat Volume", count: stats.activeChats, trend: "-2%", icon: <MessageCircle className="text-blue-400" />, positive: false },
           { label: "Flagged Content", count: stats.reports, trend: "+1", icon: <AlertTriangle className="text-red-500" />, positive: false }
         ].map((stat, i) => (
           <motion.div 
             key={i}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: i * 0.1 }}
             className="glass p-8 rounded-[40px] border-white/5 hover:border-white/10 transition-all group"
           >
              <div className="flex justify-between items-start mb-6">
                 <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    {stat.icon}
                 </div>
                 <div className={cn(
                    "flex items-center gap-1 text-[10px] font-black uppercase tracking-widest",
                    stat.positive ? "text-green-500" : "text-red-500"
                 )}>
                    {stat.trend} {stat.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                 </div>
              </div>
              <h3 className="text-3xl font-black mb-1">{stat.count.toLocaleString()}</h3>
              <p className="text-xs text-white/30 uppercase font-black tracking-widest">{stat.label}</p>
           </motion.div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         {/* User Management */}
         <div className="lg:col-span-2 glass-card rounded-[48px] p-10 overflow-hidden">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-xl font-bold flex items-center gap-3">
                  <Activity className="w-5 h-5 text-brand-cyan" /> Recent Activity
               </h3>
               <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input 
                    type="text" 
                    placeholder="Search users..." 
                    className="glass bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-[10px] focus:outline-none focus:border-brand-purple"
                  />
               </div>
            </div>

            <div className="space-y-4">
               {recentUsers.map((user, i) => (
                  <div key={user.id} className="flex items-center justify-between p-4 glass bg-white/5 hover:bg-white/10 rounded-2xl transition-all group cursor-pointer">
                     <div className="flex items-center gap-4">
                        <img src={user.avatar} alt="User" className="w-10 h-10 rounded-full" />
                        <div>
                           <h4 className="font-bold text-sm">{user.name}</h4>
                           <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest">{user.userId.slice(0, 8)}...</p>
                        </div>
                     </div>
                     <div className="flex gap-4 items-center">
                        <div className="text-right">
                           <div className="text-[10px] font-black text-brand-purple">LEVEL 8</div>
                           <div className="text-[8px] text-white/20 font-bold">JOINED TODAY</div>
                        </div>
                        <button className="p-2 glass rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                           <MoreHorizontal className="w-4 h-4" />
                        </button>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* Growth Chart (Mock) */}
         <div className="glass-card rounded-[48px] p-10 flex flex-col">
            <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
               <TrendingUp className="w-5 h-5 text-brand-purple" /> Growth Curve
            </h3>
            <div className="flex-1 flex items-end gap-2 px-2">
               {[40, 60, 35, 70, 90, 55, 80, 100].map((h, i) => (
                  <motion.div 
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    className="flex-1 bg-gradient-to-t from-brand-purple to-brand-cyan rounded-t-lg relative group"
                  >
                     <div className="absolute -top-8 left-1/2 -translate-x-1/2 glass px-2 py-1 rounded text-[8px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        +{h}%
                     </div>
                  </motion.div>
               ))}
            </div>
            <div className="mt-8 flex justify-between text-[10px] font-black text-white/20 uppercase tracking-widest">
               <span>Week 1</span>
               <span>Week 4</span>
            </div>
         </div>
      </div>
    </div>
  );
}

