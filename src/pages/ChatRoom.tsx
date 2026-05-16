import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { db, handleFirestoreError, OperationType } from "../lib/firebase.ts";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { ArrowLeft, Send, Image as ImageIcon, Smile, MoreVertical, Shield, Calendar, Plus, Paperclip, Loader2, Video, Users } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import BookingSystem from "../components/BookingSystem.tsx";
import VideoCall from "../components/VideoCall.tsx";
import { uploadImage } from "../lib/upload.ts";
import { cn, getUserAvatar } from "../lib/utils.ts";

import { getStorageItem } from "../lib/storage.ts";

export default function ChatRoom() {
  const { id } = useParams();
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [otherUser, setOtherUser] = useState<any>(null);
  const [showBooking, setShowBooking] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentUser = getStorageItem("user", {} as any);

  useEffect(() => {
    if (!id) return;

    // Fetch match and other user details
    const fetchMatchDetails = async () => {
      try {
        const matchRef = doc(db, "matches", id);
        const matchSnap = await getDoc(matchRef);
        if (matchSnap.exists()) {
          const matchData = matchSnap.data();
          const otherId = (matchData.userIds || []).find((uid: string) => uid !== currentUser.userId);
          if (otherId) {
            const userRef = doc(db, "users", otherId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              setOtherUser(userSnap.data());
            }
          }
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `matches/${id}`);
      }
    };
    fetchMatchDetails();

    // Listen for messages
    const messagesRef = collection(db, "matches", id, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, `matches/${id}/messages`);
    });

    return () => unsubscribe();
  }, [id, currentUser.userId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent, imageUrl?: string) => {
    e?.preventDefault();
    if ((!inputText.trim() && !imageUrl) || !id) return;
    
    try {
      const messagesRef = collection(db, "matches", id, "messages");
      await addDoc(messagesRef, {
        senderId: currentUser.userId,
        receiverId: otherUser?.userId,
        text: imageUrl ? "" : inputText.trim(),
        image: imageUrl || null,
        createdAt: serverTimestamp()
      });
      setInputText("");
      setShowActions(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `matches/${id}/messages`);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const url = await uploadImage(file);
      await handleSend(null as any, url);
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-black bg-mesh flex flex-col max-w-2xl mx-auto border-x border-white/5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-purple/5 blur-[100px] -z-10" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-cyan/5 blur-[100px] -z-10" />

      <header className="px-6 py-4 border-b border-white/5 bg-brand-black/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/chats" className="w-8 h-8 flex items-center justify-center text-white/50 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src={getUserAvatar(otherUser)} alt="User" className="w-10 h-10 rounded-full" />
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-brand-black rounded-full" />
            </div>
            <div>
              <h4 className="font-bold text-sm">{otherUser?.name || "Loading..."}</h4>
              <p className="text-[10px] text-brand-cyan font-bold uppercase tracking-widest">Online</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowVideo(true)}
            className="p-2.5 glass rounded-xl hover:text-brand-cyan hover:bg-brand-cyan/10 transition-all"
          >
            <Video className="w-5 h-5 text-brand-cyan" />
          </button>
          <button 
            onClick={() => setShowBooking(true)}
            className="p-2.5 glass rounded-xl hover:text-brand-purple hover:bg-brand-purple/10 transition-all flex items-center gap-2"
          >
            <Calendar className="w-5 h-5" />
            <span className="hidden sm:inline text-[10px] uppercase font-black tracking-widest">Book Swap</span>
          </button>
          <div className="relative group">
            <button className="p-2.5 glass rounded-xl hover:bg-white/10 transition-all">
              <MoreVertical className="w-5 h-5 text-white/50" />
            </button>
            <div className="absolute right-0 top-12 w-48 glass p-2 rounded-2xl border border-white/10 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all scale-95 group-hover:scale-100 z-[70]">
               <button className="w-full py-3 px-4 text-left text-xs font-bold text-red-500 hover:bg-red-500/10 rounded-xl transition-colors flex items-center gap-2">
                 <Shield className="w-3 h-3" /> Report Chat
               </button>
               <Link to={`/profile/${otherUser?.userId}`} className="w-full py-3 px-4 text-left text-xs font-bold text-white/50 hover:bg-white/5 rounded-xl transition-colors flex items-center gap-2">
                 <Users className="w-3 h-3" /> View Profile
               </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
        <div className="text-center mb-10">
          <div className="inline-block px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] uppercase font-bold text-white/30 tracking-widest">
            Matched Recently
          </div>
        </div>

        <AnimatePresence initial={false}>
          {messages.map((msg, i) => {
            const isMe = msg.senderId === currentUser.userId;
            return (
              <motion.div
                key={msg.id || i}
                initial={{ opacity: 0, x: isMe ? 20 : -20, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] p-4 rounded-3xl text-sm leading-relaxed ${
                  isMe 
                    ? 'bg-brand-purple text-white rounded-tr-sm glow-purpleShadow border border-white/10' 
                    : 'glass text-white/90 rounded-tl-sm'
                }`}>
                  {msg.image ? (
                     <img src={msg.image} alt="Upload" className="rounded-2xl w-full mb-2 max-h-60 object-cover" />
                  ) : (
                     msg.text
                  )}
                  {msg.createdAt && (
                    <div className={`mt-1 text-[8px] font-bold uppercase opacity-50 ${isMe ? 'text-right' : 'text-left'}`}>
                      {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={scrollRef} />
      </main>

      <footer className="p-6 bg-brand-black/80 backdrop-blur-md border-t border-white/5">
        <form onSubmit={(e) => handleSend(e)} className="relative flex items-center gap-4 max-w-4xl mx-auto">
          <div className="relative">
            <button 
              type="button"
              onClick={() => setShowActions(!showActions)}
              className="w-14 h-14 glass rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all"
            >
              <Plus className={cn("w-6 h-6 text-white/40 transition-transform", showActions && "rotate-45")} />
            </button>
            <AnimatePresence>
               {showActions && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    className="absolute bottom-16 left-0 w-48 glass p-2 rounded-3xl border border-white/10 z-50 flex flex-col gap-1 shadow-2xl"
                  >
                     <label className="w-full py-3 px-4 text-left text-xs font-bold text-white/60 hover:bg-white/5 rounded-2xl transition-all flex items-center gap-3 cursor-pointer">
                        <ImageIcon className="w-4 h-4 text-brand-purple" />
                        <span>Add Photo</span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                     </label>
                     <button type="button" className="w-full py-3 px-4 text-left text-xs font-bold text-white/60 hover:bg-white/5 rounded-2xl transition-all flex items-center gap-3">
                        <Paperclip className="w-4 h-4 text-brand-cyan" />
                        <span>Share File</span>
                     </button>
                  </motion.div>
               )}
            </AnimatePresence>
          </div>

          <div className="flex-1 relative">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={uploading ? "Uploading image..." : "Send message..."} 
              disabled={uploading}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-12 focus:outline-none focus:border-brand-purple/50 transition-all font-medium"
            />
            <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors">
              <Smile className="w-5 h-5" />
            </button>
          </div>
          <button 
            type="submit"
            disabled={!inputText.trim() && !uploading}
            className="w-14 h-14 bg-gradient-to-tr from-brand-purple to-brand-cyan rounded-2xl flex items-center justify-center glow-purple hover:scale-105 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
          >
            {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6 text-white" />}
          </button>
        </form>
      </footer>

      <AnimatePresence>
        {showBooking && <BookingSystem otherUser={otherUser} onClose={() => setShowBooking(false)} />}
        {showVideo && <VideoCall otherUser={otherUser} onClose={() => setShowVideo(false)} />}
      </AnimatePresence>
    </div>
  );
}
