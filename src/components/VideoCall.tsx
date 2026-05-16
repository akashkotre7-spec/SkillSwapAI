import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Video, VideoOff, Mic, MicOff, PhoneOff, 
  Monitor, Maximize2, Users, MessageSquare, 
  Settings, Loader2, Sparkles, Brain
} from "lucide-react";
import { cn } from "../lib/utils.ts";

interface VideoCallProps {
  onClose: () => void;
  otherUser: any;
}

export default function VideoCall({ onClose, otherUser }: VideoCallProps) {
  const [videoOn, setVideoOn] = useState(true);
  const [audioOn, setAudioOn] = useState(true);
  const [isConnecting, setIsConnecting] = useState(true);
  const [showAiInsight, setShowAiInsight] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsConnecting(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-brand-black flex flex-col"
    >
      <header className="p-6 flex items-center justify-between absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-brand-black to-transparent">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
             <Video className="w-6 h-6 text-brand-purple" />
          </div>
          <div>
            <h2 className="font-bold">SkillSwap Live</h2>
            <p className="text-[10px] text-white/40 uppercase font-black tracking-widest flex items-center gap-2">
               <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" /> 00:42:15 • {otherUser?.name}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="p-3 glass rounded-xl hover:bg-white/10 transition-all"><Users className="w-5 h-5 text-white/50" /></button>
          <button className="p-3 glass rounded-xl hover:bg-white/10 transition-all"><Settings className="w-5 h-5 text-white/50" /></button>
        </div>
      </header>

      <div className="flex-1 p-6 pt-24 pb-32 flex gap-6">
        <div className="flex-1 relative group bg-white/5 rounded-[48px] overflow-hidden border border-white/10 shadow-2xl">
          {videoOn ? (
            <div className="w-full h-full relative">
               <img src={otherUser?.avatar} alt="Remote" className="w-full h-full object-cover grayscale-[20%]" />
               <div className="absolute inset-x-0 bottom-0 p-10 bg-gradient-to-t from-brand-black to-transparent">
                 <h3 className="text-2xl font-bold">{otherUser?.name}</h3>
                 <p className="text-brand-cyan text-sm font-bold uppercase tracking-widest mt-1">Teaching: TypeScript Patterns</p>
               </div>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-6">
               <div className="w-32 h-32 rounded-full border border-white/10 p-1 bg-white/5">
                  <img src={otherUser?.avatar} alt="Avatar" className="w-full h-full rounded-full opacity-20" />
               </div>
               <p className="text-white/20 font-bold uppercase tracking-widest">Video is off</p>
            </div>
          )}

          {/* Local Preview */}
          <div className="absolute top-6 right-6 w-48 aspect-video glass rounded-3xl border border-white/20 overflow-hidden shadow-2xl transform hover:scale-105 transition-all">
             <div className="w-full h-full bg-brand-navy flex items-center justify-center">
                <Users className="w-10 h-10 text-white/5" />
                <div className="absolute bottom-3 left-3 px-2 py-1 glass bg-brand-black/40 rounded-lg text-[8px] font-black uppercase tracking-widest">You (Me)</div>
             </div>
          </div>

          <AnimatePresence>
            {isConnecting && (
              <motion.div 
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-brand-black z-20 flex flex-col items-center justify-center text-center p-10"
              >
                 <Loader2 className="w-12 h-12 text-brand-purple animate-spin mb-6" />
                 <h3 className="text-xl font-bold">Establishing Secure Bridge...</h3>
                 <p className="text-white/40 text-xs mt-2 uppercase tracking-widest font-black">Encrypted via WebRTC</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* AI Co-pilot Side panel */}
        <AnimatePresence>
           {showAiInsight && (
             <motion.aside
               initial={{ x: 20, opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               exit={{ x: 20, opacity: 0 }}
               className="w-80 glass border border-brand-purple/20 rounded-[48px] p-8 flex flex-col gap-8 shadow-2xl"
             >
                <div className="flex items-center justify-between">
                   <h3 className="text-sm font-bold flex items-center gap-2">
                     <Brain className="w-4 h-4 text-brand-purple" /> AI Co-pilot
                   </h3>
                   <button onClick={() => setShowAiInsight(false)} className="text-xs text-white/20 font-black">HIDE</button>
                </div>

                <div className="p-5 bg-brand-purple/5 border border-brand-purple/10 rounded-2xl">
                   <h4 className="text-[10px] font-black uppercase text-brand-purple mb-2">Lesson Suggestion</h4>
                   <p className="text-xs text-white/60 leading-relaxed italic">
                     "Ask Elena about how she handles Type Guards in complex interfaces. It matches your recent learning goals."
                   </p>
                </div>

                <div className="space-y-4">
                   <h4 className="text-[10px] font-black uppercase text-white/20 tracking-widest">Real-time Transcript</h4>
                   <div className="space-y-3 opacity-40">
                      <div className="text-[10px] italic">"So if we use the generic type here..."</div>
                      <div className="text-[10px] italic">"Exactly, it ensures strict safety across..."</div>
                   </div>
                </div>

                <div className="mt-auto p-4 bg-gradient-to-tr from-brand-purple to-brand-cyan rounded-2xl text-[10px] text-center font-black uppercase tracking-widest text-brand-black">
                   Auto-Summary Active
                </div>
             </motion.aside>
           )}
        </AnimatePresence>
      </div>

      {/* Control Bar */}
      <footer className="h-28 flex items-center justify-center bg-brand-black/50 backdrop-blur-md border-t border-white/5 absolute bottom-0 left-0 right-0 px-10">
        <div className="flex items-center gap-6">
           <button 
             onClick={() => setAudioOn(!audioOn)}
             className={cn(
               "w-14 h-14 rounded-2xl flex items-center justify-center transition-all",
               audioOn ? "glass hover:bg-white/10" : "bg-red-500 text-white"
             )}
           >
             {audioOn ? <Mic className="w-6 h-6 text-white/50" /> : <MicOff className="w-6 h-6" />}
           </button>
           <button 
             onClick={() => setVideoOn(!videoOn)}
             className={cn(
               "w-14 h-14 rounded-2xl flex items-center justify-center transition-all",
               videoOn ? "glass hover:bg-white/10" : "bg-red-500 text-white"
             )}
           >
             {videoOn ? <Video className="w-6 h-6 text-white/50" /> : <VideoOff className="w-6 h-6" />}
           </button>
           
           <button 
             onClick={onClose}
             className="w-16 h-16 bg-red-500 rounded-3xl flex items-center justify-center glow-red hover:scale-105 active:scale-95 transition-all mx-4 shadow-2xl shadow-red-500/50"
           >
             <PhoneOff className="w-8 h-8 text-white" />
           </button>

           <button 
             className="w-14 h-14 glass rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all text-white/50"
             onClick={() => {}}
           >
             <Monitor className="w-6 h-6" />
           </button>
           <button 
             onClick={() => setShowAiInsight(!showAiInsight)}
             className={cn(
               "w-14 h-14 rounded-2xl flex items-center justify-center transition-all",
               showAiInsight ? "bg-brand-purple glow-purple text-white" : "glass text-white/50"
             )}
           >
             <Sparkles className="w-6 h-6" />
           </button>
        </div>
      </footer>
    </motion.div>
  );
}
