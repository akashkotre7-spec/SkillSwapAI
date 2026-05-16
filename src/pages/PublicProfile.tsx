import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { db, handleFirestoreError, OperationType } from "../lib/firebase.ts";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { 
  ArrowLeft, MessageCircle, Heart, Shield, Award, 
  MapPin, Calendar, Star, Zap, Brain, Code, Palette, 
  Globe, Github, Twitter, Linkedin, MoreHorizontal, X
} from "lucide-react";
import { motion } from "motion/react";
import { useStore } from "../lib/store.ts";
import { cn, getUserAvatar } from "../lib/utils.ts";

export default function PublicProfile() {
  const { userId } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [matched, setMatched] = useState(false);
  const { user: currentUser } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (userId) fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const userRef = doc(db, "users", userId!);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setProfile(userSnap.data());
      }
      
      // Check if matched
      if (currentUser?.userId) {
        const matchId = [currentUser.userId, userId!].sort().join("_");
        const matchRef = doc(db, "matches", matchId);
        const matchSnap = await getDoc(matchRef);
        if (matchSnap.exists() && matchSnap.data().status === "matched") {
          setMatched(true);
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `users/${userId}`);
    } finally {
      setLoading(false);
    }
  };

  const handleMatchRequest = async () => {
    if (!currentUser?.userId || !profile) return;
    try {
      const matchId = [currentUser.userId, profile.userId].sort().join("_");
      const matchRef = doc(db, "matches", matchId);
      await setDoc(matchRef, {
        matchId,
        users: [currentUser.userId, profile.userId],
        status: "matched", // For one-click match in public profile (premium feel)
        score: 95,
        createdAt: serverTimestamp()
      });
      setMatched(true);
      navigate("/chats");
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "matches");
    }
  };

  if (loading) return <div className="h-screen bg-brand-black flex items-center justify-center"><Zap className="animate-spin text-brand-purple" /></div>;
  if (!profile) return <div className="h-screen bg-brand-black flex items-center justify-center text-white/40 italic">Profile not found.</div>;

  return (
    <div className="min-h-screen bg-brand-black bg-mesh flex flex-col items-center pb-20">
      {/* Hero Section */}
      <div className="w-full h-80 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center blur-sm scale-110 opacity-30"
          style={{ backgroundImage: `url(${getUserAvatar(profile)})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-black to-transparent" />
        
        <header className="absolute top-0 left-0 right-0 p-8 flex justify-between items-center z-10">
          <button onClick={() => navigate(-1)} className="w-12 h-12 glass rounded-full flex items-center justify-center">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="relative group">
            <button className="w-12 h-12 glass rounded-full flex items-center justify-center group-hover:bg-white/10 transition-all">
              <MoreHorizontal className="w-6 h-6" />
            </button>
            <div className="absolute right-0 top-14 w-40 glass p-2 rounded-2xl border border-white/10 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all scale-95 group-hover:scale-100 z-50">
               <button className="w-full py-3 px-4 text-left text-xs font-bold text-red-500 hover:bg-red-500/10 rounded-xl transition-colors flex items-center gap-2">
                 <Shield className="w-3 h-3" /> Report User
               </button>
               <button className="w-full py-3 px-4 text-left text-xs font-bold text-white/50 hover:bg-white/5 rounded-xl transition-colors flex items-center gap-2">
                 <X className="w-3 h-3" /> Block User
               </button>
            </div>
          </div>
        </header>

        <div className="absolute bottom-0 left-0 right-0 p-10 flex flex-col items-center">
           <motion.div 
             initial={{ scale: 0.5, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="relative"
           >
             <div className="w-32 h-32 rounded-full border-4 border-brand-purple p-1 glow-purple bg-brand-black">
               <img src={profile.avatar} alt={profile.name} className="w-full h-full rounded-full" />
             </div>
             <div className="absolute -bottom-2 right-0 w-10 h-10 bg-brand-cyan rounded-full border-4 border-brand-black flex items-center justify-center">
               <Shield className="w-4 h-4 text-brand-black" />
             </div>
           </motion.div>
           <h1 className="text-3xl font-bold mt-6">{profile.name}</h1>
           <div className="flex items-center gap-4 mt-2 text-white/40 text-sm font-medium">
             <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {profile.location || "San Francisco, CA"}</span>
             <span className="w-1 h-1 bg-white/20 rounded-full" />
             <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Joined May 2024</span>
           </div>
        </div>
      </div>

      {/* Profile Content */}
      <main className="w-full max-w-4xl px-8 mt-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Stats & Side info */}
        <div className="space-y-8">
           <div className="glass p-8 rounded-[40px] flex justify-between">
              <div className="text-center">
                 <div className="text-xl font-black">{profile.points || 0}</div>
                 <div className="text-[10px] uppercase tracking-widest text-white/30 font-bold">XP</div>
              </div>
              <div className="w-px bg-white/5" />
              <div className="text-center">
                 <div className="text-xl font-black">12</div>
                 <div className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Swaps</div>
              </div>
              <div className="w-px bg-white/5" />
              <div className="text-center">
                 <div className="text-xl font-black">8</div>
                 <div className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Level</div>
              </div>
           </div>

           <div className="glass p-8 rounded-[40px]">
              <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-white/30 mb-6">Expertise</h3>
              <div className="space-y-4">
                 <div>
                   <div className="flex justify-between text-xs mb-2">
                     <span className="text-white/60">Technical Skills</span>
                     <span className="text-brand-purple">92%</span>
                   </div>
                   <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                     <div className="h-full bg-brand-purple w-[92%]" />
                   </div>
                 </div>
                 <div>
                   <div className="flex justify-between text-xs mb-2">
                     <span className="text-white/60">Collaboration</span>
                     <span className="text-brand-cyan">88%</span>
                   </div>
                   <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                     <div className="h-full bg-brand-cyan w-[88%]" />
                   </div>
                 </div>
              </div>
           </div>

           <div className="glass p-1 rounded-[32px] overflow-hidden">
              {matched ? (
                 <Link to={`/chat/${[currentUser?.userId, userId].sort().join("_")}`} className="block w-full py-5 bg-white text-brand-black rounded-[30px] font-black text-center text-sm uppercase tracking-widest glow-white">
                   Message Now
                 </Link>
              ) : (
                 <button onClick={handleMatchRequest} className="w-full py-5 bg-brand-purple text-white rounded-[30px] font-black text-center text-sm uppercase tracking-widest glow-purple">
                   Request Swap
                 </button>
              )}
           </div>
        </div>

        {/* Right Column: Bio & Portfolio */}
        <div className="lg:col-span-2 space-y-10">
           <section>
              <h3 className="text-xl font-bold mb-4">Bio</h3>
              <p className="text-white/50 leading-relaxed italic">
                {profile.bio || "Passionate creator dedicated to teaching and learning. Currently focusing on modular architectures and creative expression through code."}
              </p>
           </section>

           <div className="grid grid-cols-2 gap-6">
              <div className="glass p-8 rounded-[40px]">
                 <h4 className="text-xs font-black uppercase text-brand-purple tracking-widest mb-4">Teaching</h4>
                 <div className="flex flex-wrap gap-2">
                    {profile.teaches?.map((s: string) => (
                      <span key={s} className="px-3 py-1.5 bg-brand-purple/5 border border-brand-purple/20 rounded-xl text-[10px] font-bold">{s}</span>
                    ))}
                 </div>
              </div>
              <div className="glass p-8 rounded-[40px]">
                 <h4 className="text-xs font-black uppercase text-brand-cyan tracking-widest mb-4">Learning</h4>
                 <div className="flex flex-wrap gap-2">
                    {profile.learns?.map((s: string) => (
                      <span key={s} className="px-3 py-1.5 bg-brand-cyan/5 border border-brand-cyan/20 rounded-xl text-[10px] font-bold">{s}</span>
                    ))}
                 </div>
              </div>
           </div>

           <section>
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-xl font-bold flex items-center gap-2">
                    <Award className="text-brand-cyan w-5 h-5" /> Badges & Stats
                 </h3>
                 <span className="text-[10px] text-white/30 uppercase font-black tracking-widest">View All</span>
              </div>
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                 {[
                   { icon: <Zap className="text-yellow-400" />, label: "Fast Learner" },
                   { icon: <Brain className="text-brand-purple" />, label: "AI Pioneer" },
                   { icon: <Star className="text-brand-cyan" />, label: "Expert Tutor" },
                   { icon: <Shield className="text-green-500" />, label: "Verified" }
                 ].map((badge, i) => (
                    <div key={i} className="flex-shrink-0 w-28 aspect-square glass flex flex-col items-center justify-center rounded-[32px] border-white/5 hover:border-white/20 transition-all p-2 group">
                       <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                          {badge.icon}
                       </div>
                       <span className="text-[8px] font-black uppercase tracking-widest text-white/40 text-center">{badge.label}</span>
                    </div>
                 ))}
              </div>
           </section>

           <div className="flex items-center gap-4 opacity-30 mt-10">
              <Github className="w-5 h-5 cursor-pointer hover:opacity-100 transition-opacity" />
              <Twitter className="w-5 h-5 cursor-pointer hover:opacity-100 transition-opacity" />
              <Linkedin className="w-5 h-5 cursor-pointer hover:opacity-100 transition-opacity" />
              <Globe className="w-5 h-5 cursor-pointer hover:opacity-100 transition-opacity" />
           </div>
        </div>
      </main>
    </div>
  );
}
