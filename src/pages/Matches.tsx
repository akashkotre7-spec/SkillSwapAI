import { useState, useEffect } from "react";
import { db, handleFirestoreError, OperationType } from "../lib/firebase.ts";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { Heart, Search, MessageCircle, Sparkles, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../lib/store.ts";
import EmptyState from "../components/EmptyState.tsx";
import { cn, getUserAvatar } from "../lib/utils.ts";

export default function Matches() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchMatches();
    }
  }, [user]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const matchesRef = collection(db, "matches");
      const q = query(matchesRef, where("userIds", "array-contains", user.userId));
      const querySnapshot = await getDocs(q);
      
      const matchPromises = querySnapshot.docs.map(async (matchDoc) => {
        const data = matchDoc.data();
        const otherUserId = data.userIds.find((id: string) => id !== user.userId);
        const userRef = doc(db, "users", otherUserId);
        const userSnap = await getDoc(userRef);
        return {
          id: matchDoc.id,
          ...data,
          otherUser: userSnap.exists() ? userSnap.data() : null
        };
      });

      const resolvedMatches = await Promise.all(matchPromises);
      setMatches(resolvedMatches.filter(m => m.otherUser));
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, "matches");
    } finally {
      setLoading(false);
    }
  };

  const displayMatches = matches;

  return (
    <div className="min-h-screen bg-brand-black pb-32 pt-8 px-6 lg:px-12 max-w-5xl mx-auto overflow-y-auto">
      <header className="mb-12">
        <div className="flex items-center gap-2 mb-2">
          <Heart className="w-4 h-4 text-brand-purple" />
          <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Talent Sync</span>
        </div>
        <h1 className="text-4xl font-black">Your Matches</h1>
      </header>

      <AnimatePresence mode="popLayout">
        {loading ? (
          <div className="flex items-center justify-center mt-20">
            <Sparkles className="animate-spin text-brand-purple w-10 h-10" />
          </div>
        ) : displayMatches.length === 0 ? (
          <EmptyState 
            icon={Heart}
            title="Searching for signal"
            description="No matches found yet. Keep exploring the talent pool to find your perfect skill partner."
            actionLabel="Start Discovery"
            onAction={() => navigate("/discovery")}
            className="mt-20"
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 relative z-10">
            {displayMatches.map((match) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -8 }}
                className="glass-card rounded-[32px] overflow-hidden group border-white/5 hover:border-brand-purple/30 transition-all shadow-xl"
              >
                <Link to={`/profile/${match.otherUser.userId}`} className="block relative aspect-square overflow-hidden">
                  <img src={getUserAvatar(match.otherUser)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-4 left-4 right-4 translate-y-10 group-hover:translate-y-0 transition-transform duration-500">
                    <button 
                      onClick={(e) => { e.preventDefault(); navigate(`/chat/${match.id}`); }}
                      className="w-full py-3 bg-brand-purple rounded-2xl flex items-center justify-center gap-2 font-bold text-[10px] uppercase tracking-widest"
                    >
                      <MessageCircle className="w-4 h-4" /> Message
                    </button>
                  </div>
                </Link>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-sm truncate">{match.otherUser.name}</h3>
                    {match.otherUser.status === "online" && (
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_#22C55E]" />
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {match.otherUser.teaches?.slice(0, 2).map((s: string) => (
                      <span key={s} className="text-[8px] font-black uppercase text-brand-purple tracking-tighter opacity-70">{s}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
