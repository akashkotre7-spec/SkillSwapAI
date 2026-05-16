import { useState, useEffect } from "react";
import { db, handleFirestoreError, OperationType } from "../lib/firebase.ts";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { Link } from "react-router-dom";
import { MessageSquare, ArrowLeft, MoreHorizontal, Search, Sparkles, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import EmptyState from "../components/EmptyState.tsx";
import { useNavigate } from "react-router-dom";
import { getUserAvatar } from "../lib/utils.ts";
import { getStorageItem } from "../lib/storage.ts";

export default function ChatList() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUser = getStorageItem("user", {} as any);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMatches = async () => {
      const currentUserId = currentUser.userId || getStorageItem("user", {} as any).userId;
      if (!currentUserId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const matchesRef = collection(db, "matches");
        // We use 'userIds' as the field name consistently now
        const q = query(
          matchesRef, 
          where("userIds", "array-contains", currentUserId)
        );
        const querySnapshot = await getDocs(q);
        
        const matchPromises = querySnapshot.docs.map(async (matchDoc) => {
          const matchData = matchDoc.data();
          const otherUserId = (matchData.userIds || matchData.users || []).find((id: string) => id !== currentUserId);
          
          let otherUser = { 
            userId: otherUserId || "unknown",
            name: "Skill Explorer", 
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUserId || "unknown"}` 
          };
          
          if (otherUserId) {
            const userRef = doc(db, "users", otherUserId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              otherUser = userSnap.data() as any;
            }
          }
          
          return {
            id: matchDoc.id,
            ...matchData,
            otherUser
          };
        });

        const resolvedMatches = await Promise.all(matchPromises);
        setMatches(resolvedMatches);
      } catch (err: any) {
        console.error("ChatList Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  return (
    <div className="min-h-screen bg-brand-black bg-mesh flex flex-col overflow-hidden">
      <header className="px-6 py-8 border-b border-white/5 bg-brand-black/50 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center justify-between mb-8">
          <Link to="/discovery" className="w-10 h-10 glass rounded-full flex items-center justify-center">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-display font-bold">Messages</h1>
          <button className="w-10 h-10 glass rounded-full flex items-center justify-center">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input 
            type="text" 
            placeholder="Search matches..." 
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-brand-purple/50"
          />
        </div>
      </header>

      <main className="flex-1 px-6 py-8">
        <div className="flex items-center gap-4 mb-10 overflow-x-auto pb-4 no-scrollbar">
          {matches.map((match, i) => (
            <motion.div 
              key={match.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="flex-shrink-0 text-center"
            >
              <div className="w-16 h-16 rounded-full border-2 border-brand-purple p-1 mb-2 glow-purple">
                <img src={getUserAvatar(match.otherUser)} alt={match.otherUser.name} className="w-full h-full rounded-full" />
              </div>
              <p className="text-[10px] font-bold text-white/60 truncate w-16">{match.otherUser.name}</p>
            </motion.div>
          ))}
        </div>

        <div className="space-y-2">
           {loading ? (
             <div className="text-center text-white/20 py-20 flex flex-col items-center">
               <Sparkles className="animate-spin text-brand-purple mb-4 w-8 h-8" />
               <p className="font-bold text-[10px] uppercase tracking-widest">Signal Search...</p>
             </div>
           ) : (
             <AnimatePresence mode="wait">
               {matches.length === 0 ? (
                 <EmptyState 
                   key="empty"
                   icon={MessageCircle}
                   title="Silent signal"
                   description="Your chat feed is quiet. Start swiping to discover talent and ignite collaborations."
                   actionLabel="Start Discovery"
                   onAction={() => navigate("/discovery")}
                   className="mt-10"
                 />
               ) : (
                 matches.map((match) => (
                   <Link 
                     to={`/chat/${match.id}`} 
                     key={match.id}
                     className="flex items-center gap-4 p-4 rounded-[24px] hover:bg-white/5 transition-colors group"
                   >
                     <div className="relative">
                       <img src={getUserAvatar(match.otherUser)} alt={match.otherUser.name} className="w-14 h-14 rounded-full border border-white/10" />
                       <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-brand-black rounded-full" />
                     </div>
                     <div className="flex-1 min-w-0">
                       <div className="flex items-center justify-between mb-1">
                         <h4 className="font-bold truncate">{match.otherUser.name}</h4>
                         <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Active</span>
                       </div>
                       <p className="text-sm text-white/50 truncate italic">Ready to share knowledge...</p>
                     </div>
                   </Link>
                 ))
               )}
             </AnimatePresence>
           )}
        </div>
      </main>
    </div>
  );
}
