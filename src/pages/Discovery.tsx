import { useState, useEffect } from "react";
import { db, auth, handleFirestoreError, OperationType } from "../lib/firebase.ts";
import { 
  collection, query, getDocs, getDoc, doc, updateDoc, 
  arrayUnion, where, limit, addDoc, serverTimestamp 
} from "firebase/firestore";
import { 
  Sparkles, Heart, X, MessageCircle, Info, 
  MapPin, Shield, Zap, Search, Bell, Users,
  CheckCircle2, Brain, Star, TrendingUp, Activity
} from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "motion/react";
import { Link } from "react-router-dom";
import { useStore } from "../lib/store.ts";
import { useTranslation } from "../lib/i18n.ts";
import NotificationCenter from "../components/NotificationCenter.tsx";
import LanguageSwitcher from "../components/LanguageSwitcher.tsx";
import { analyzeMatch } from "../services/geminiService.ts";
import { cn, getUserAvatar } from "../lib/utils.ts";

export default function Discovery() {
  const [users, setUsers] = useState<any[]>([]);
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [matchData, setMatchData] = useState<any>(null);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const { user: currentUser } = useStore();

  useEffect(() => {
    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser]);

  const fetchUsers = async () => {
    if (!currentUser?.userId) return;
    try {
      setLoading(true);
      console.log("[Discovery] Fetching real users...");
      
      const usersRef = collection(db, "users");
      // Basic exclusion: Not the current user
      const q = query(usersRef, where("userId", "!=", currentUser.userId), limit(100));
      const querySnapshot = await getDocs(q);
      
      // Fetch fresh user data for exclusion lists
      const userDocRef = doc(db, "users", currentUser.userId);
      const userSnap = await getDoc(userDocRef);
      const userData = userSnap.data();
      
      const liked = userData?.likedUsers || [];
      const passed = userData?.passedUsers || [];
      const pref = userData?.preferredGender || "any";
      
      const filteredUsers = querySnapshot.docs
        .map(doc => doc.data())
        .filter(u => {
          // 1. Exclude already liked/passed
          if (liked.includes(u.userId) || passed.includes(u.userId)) return false;
          
          // 2. Gender filtering
          if (pref !== "any" && u.gender !== pref) return false;
          
          return true;
        });
      
      setUsers(filteredUsers.sort(() => Math.random() - 0.5));
    } catch (err: any) {
      console.error("[Discovery] Fetch Error:", err);
      handleFirestoreError(err, OperationType.LIST, "users");
    } finally {
      setLoading(false);
    }
  };

  const currentProfile = users[currentIndex];

  useEffect(() => {
    if (currentProfile && !matchData && !aiAnalyzing && currentUser) {
      setAiAnalyzing(true);
      analyzeMatch(currentUser, currentProfile)
        .then(data => setMatchData(data))
        .catch(() => setMatchData({ score: 85, reason: "AI estimates natural synergy." }))
        .finally(() => setAiAnalyzing(false));
    } else {
      setMatchData(null);
    }
  }, [currentIndex, currentProfile, currentUser]);

  const handleSwipe = async (direction: "left" | "right") => {
    if (!currentProfile || !currentUser?.userId) return;
    
    const targetUserId = currentProfile.userId;
    const userRef = doc(db, "users", currentUser.userId);

    try {
      if (direction === "right") {
        // Save to likedUsers
        await updateDoc(userRef, {
          likedUsers: arrayUnion(targetUserId),
          updatedAt: serverTimestamp()
        });

        // Check for mutual like
        const targetUserRef = doc(db, "users", targetUserId);
        const targetUserSnap = await getDoc(targetUserRef);
        const targetData = targetUserSnap.data();

        if (targetData?.likedUsers?.includes(currentUser.userId)) {
          // MUTUAL MATCH!
          console.log("[Discovery] MATCH DETECTED!");
          
          // Create match document
          const matchIds = [currentUser.userId, targetUserId].sort();
          const matchRef = collection(db, "matches");
          
          // Check if match already exists (safeguard)
          const matchQ = query(matchRef, where("userIds", "==", matchIds));
          const matchSnap = await getDocs(matchQ);
          
          if (matchSnap.empty) {
            await addDoc(matchRef, {
              userIds: matchIds,
              createdAt: serverTimestamp(),
              lastMessageAt: serverTimestamp(),
              lastMessage: "System: You've matched!"
            });
            setShowCelebration(true);
            setTimeout(() => setShowCelebration(false), 3000);
          }
        }
      } else {
        // Save to passedUsers
        await updateDoc(userRef, {
          passedUsers: arrayUnion(targetUserId),
          updatedAt: serverTimestamp()
        });
      }
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, "users");
    }
    
    setCurrentIndex(prev => prev + 1);
  };


  return (
    <div className="min-h-screen bg-brand-black pb-32 pt-6 px-6 lg:px-12 flex flex-col max-w-7xl mx-auto overflow-y-auto relative z-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-brand-purple" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{t("discovery")}</span>
          </div>
          <h1 className="text-3xl font-black">{t("discovery")}</h1>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <NotificationCenter />
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 items-start">
        {loading && users.length === 0 ? (
          <div className="w-full lg:w-[450px] aspect-[3/4] glass-card rounded-[48px] flex flex-col items-center justify-center p-10 text-center animate-pulse">
            <div className="w-20 h-20 bg-brand-purple/10 rounded-3xl flex items-center justify-center mb-6">
              <Sparkles className="w-10 h-10 text-brand-purple" />
            </div>
            <h3 className="text-xl font-black mb-2 uppercase tracking-widest">Initializing Feed...</h3>
            <p className="text-white/20 text-xs font-bold">Scanning the talent ecosystem</p>
          </div>
        ) : (
          <div className="w-full lg:w-[450px] relative aspect-[3/4] lg:aspect-auto lg:h-[600px]">
            <AnimatePresence mode="wait">
              {currentIndex < users.length ? (
                <Card 
                  key={currentProfile.userId}
                  user={currentProfile}
                  onSwipe={handleSwipe}
                />
              ) : (
          <div className="absolute top-0 flex flex-col items-center justify-center p-10 text-center">
            <div className="w-20 h-20 bg-brand-purple/10 rounded-3xl flex items-center justify-center mb-6">
              <Search className="w-10 h-10 text-brand-purple" />
            </div>
            <h3 className="text-2xl font-black mb-2">{t("noMoreUsers")}</h3>
            <p className="text-white/40 text-sm mb-8">We've reached the edge of the known universe.</p>
            <button onClick={() => setCurrentIndex(0)} className="px-8 py-4 glass rounded-2xl font-bold hover:bg-white/10 transition-all flex items-center gap-3">
              <TrendingUp className="w-4 h-4" /> {t("restartSearch")}
            </button>
          </div>
              )}
            </AnimatePresence>
          </div>
        )}

        <div className="flex-1 space-y-6 w-full lg:max-w-sm">
          <div className="glass-card rounded-[32px] p-8">
            <div className="flex items-center gap-3 mb-6">
              <Activity className="w-5 h-5 text-brand-purple animate-pulse" />
              <h3 className="font-black text-sm uppercase tracking-widest">Ecosystem Live</h3>
            </div>
            <div className="space-y-4">
              {["AI found 12 new coding ↔ design matches", "3 new skill sessions started recently", "18 users online now", "AI generated new learning paths"].map((text, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="w-1 h-full min-h-[40px] bg-white/5 rounded-full relative overflow-hidden">
                    <div className="absolute top-0 w-full h-1/2 bg-brand-purple group-hover:h-full transition-all duration-500" />
                  </div>
                  <p className="text-[11px] text-white/40 leading-relaxed py-1">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {currentProfile && (
              <motion.div key={currentProfile.userId + "_ai"} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card rounded-[32px] p-8 border-brand-purple/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 pointer-events-none">
                  <Brain className="w-12 h-12 text-brand-purple opacity-5 animate-pulse" />
                </div>
                <div className="flex items-center gap-3 mb-6">
                  <Sparkles className="w-5 h-5 text-brand-purple" />
                  <span className="font-black text-[10px] uppercase tracking-widest text-brand-purple">Gemini Insights</span>
                </div>
                {aiAnalyzing ? (
                  <div className="space-y-4">
                    <div className="h-4 bg-white/5 rounded-full shimmer w-3/4" />
                    <div className="h-4 bg-white/5 rounded-full shimmer w-1/2" />
                  </div>
                ) : matchData ? (
                  <div>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="text-4xl font-black text-brand-purple">{matchData.score}%</div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-white/20">Compatibility</div>
                    </div>
                    <p className="text-sm text-white/60 leading-relaxed italic">" {matchData.reason} "</p>
                  </div>
                ) : (
                  <p className="text-white/20 text-xs text-center py-10 uppercase tracking-widest font-black">Waiting for signal...</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {showCelebration && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none">
            <div className="absolute inset-0 bg-brand-purple/20 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} className="glass p-10 rounded-[64px] flex flex-col items-center gap-6 shadow-[0_0_100px_rgba(139,92,246,0.5)] border-brand-purple/40 text-center">
              <div className="w-24 h-24 bg-brand-purple rounded-[32px] flex items-center justify-center shadow-[0_0_30px_#8B5CF6] mb-4">
                <Heart className="w-12 h-12 text-white fill-white animate-pulse" />
              </div>
              <h2 className="text-4xl font-black mb-2">Talent Sync!</h2>
              <p className="text-white/60 text-xs font-black uppercase tracking-widest">Matched with {currentProfile?.name}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Card({ user, onSwipe }: { user: any, onSwipe: (dir: "left" | "right") => void }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x > 100) onSwipe("right");
    else if (info.offset.x < -100) onSwipe("left");
  };

  return (
    <motion.div
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing p-2"
    >
      <div className="w-full h-full glass-card rounded-[48px] overflow-hidden relative group">
        <div className="absolute inset-0 border-2 border-brand-purple/20 group-hover:border-brand-purple/50 transition-colors duration-500 rounded-[48px] z-20 pointer-events-none" />
        <img src={getUserAvatar(user)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10" />
        
        <div className="absolute top-6 left-6 z-20 flex gap-2">
          <div className="glass px-4 py-2 rounded-full flex items-center gap-2">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22C55E]" />
             <span className="text-[10px] font-black uppercase tracking-tighter">Online Now</span>
          </div>
          <div className="glass px-4 py-2 rounded-full flex items-center gap-2">
             <span className="text-[10px] font-black uppercase tracking-tighter opacity-60">{user.gender || "Member"}</span>
          </div>
        </div>

        <div className="absolute bottom-10 left-10 right-10 z-20">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-4xl font-black">{user.name}</h2>
            <CheckCircle2 className="w-6 h-6 text-brand-glow fill-brand-glow/20" />
          </div>
          <div className="flex flex-wrap gap-2 mb-8">
            {user.teaches.map((skill: string) => (
              <span key={skill} className="px-4 py-1.5 bg-brand-purple/20 backdrop-blur-md rounded-full text-[10px] font-bold border border-brand-purple/30 text-brand-purple uppercase">
                Teach: {skill}
              </span>
            ))}
          </div>
          <div className="flex gap-4">
            <button onClick={() => onSwipe("left")} className="flex-1 py-5 glass rounded-3xl flex items-center justify-center hover:bg-red-500/20 transition-all group/btn">
              <X className="w-6 h-6 text-white group-hover/btn:scale-110 transition-transform" />
            </button>
            <button onClick={() => onSwipe("right")} className="flex-[2] py-5 bg-brand-purple rounded-3xl flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-[0_20px_40px_rgba(139,92,246,0.3)] glow-purple">
              <Heart className="w-6 h-6 text-white" />
              <span className="font-black uppercase tracking-widest text-xs">I Swap</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
