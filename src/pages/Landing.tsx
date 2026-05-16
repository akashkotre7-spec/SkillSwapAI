import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { Zap, Users, Brain, MessageSquare, ArrowRight } from "lucide-react";
import { useStore } from "../lib/store.ts";

export default function Landing() {
  const { user } = useStore();
  const navigate = useNavigate();

  const handleCTA = () => {
    if (user) {
      if (user.onboarded) navigate("/discovery");
      else navigate("/onboarding");
    } else {
      navigate("/signup");
    }
  };

  return (
    <div className="relative overflow-hidden bg-brand-black bg-mesh min-h-screen">
      {/* Background Orbs */}
      <div className="absolute top-[-100px] -left-4 w-72 h-72 bg-brand-purple/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-0 -right-4 w-96 h-96 bg-brand-cyan/10 rounded-full blur-[140px]" />

      <nav className="relative z-10 flex items-center justify-between px-6 py-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-gradient-to-tr from-brand-purple to-brand-cyan rounded-xl flex items-center justify-center glow-purple transition-transform group-hover:scale-110">
            <Zap className="text-white w-6 h-6 fill-white" />
          </div>
          <span className="text-2xl font-display font-bold tracking-tight">SkillSwap</span>
        </div>
        <div className="flex items-center gap-8">
          {!user ? (
            <>
              <Link to="/login" className="text-white/40 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest">Login</Link>
              <Link to="/signup" className="px-8 py-3 bg-white text-brand-black rounded-2xl font-bold hover:bg-white/90 transition-all active:scale-95 text-sm">
                Get Started
              </Link>
            </>
          ) : (
            <button
              onClick={handleCTA}
              className="px-8 py-3 bg-brand-purple text-white rounded-2xl font-bold glow-purple transition-all active:scale-95 text-sm"
            >
              Open App
            </button>
          )}
        </div>
      </nav>

      <main className="relative z-10 pt-20 pb-32 px-6 max-w-7xl mx-auto text-center lg:text-left lg:grid lg:grid-cols-2 gap-20 items-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-purple/10 border border-brand-purple/20 rounded-full text-brand-purple text-xs font-bold mb-8 uppercase tracking-widest">
            <div className="w-2 h-2 bg-brand-purple rounded-full animate-pulse shadow-[0_0_8px_#8B5CF6]" />
            AI-Native Skill Exchange
          </div>
          <h1 className="text-7xl md:text-9xl font-display font-bold leading-[0.85] mb-8 tracking-tighter">
            Trade Skills,<br />
            <span className="text-gradient">Not Money.</span>
          </h1>
          <p className="text-lg text-white/40 max-w-xl mb-12 leading-relaxed font-medium">
            The immersive exchange where your talents are the currency. Find mentors, teach what you love, and grow with Gemini-powered matching.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
            <button
              onClick={handleCTA}
              className="px-10 py-5 bg-gradient-to-tr from-brand-purple to-brand-cyan rounded-[24px] font-bold text-lg glow-purple flex items-center justify-center gap-3 group transition-all hover:scale-105 active:scale-95 shadow-lg shadow-brand-purple/30"
            >
              {user ? "Continue Swapping" : "Start Swapping"}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <Link to="/coach" className="px-10 py-5 glass rounded-[24px] font-bold text-lg hover:bg-white/5 transition-all flex items-center justify-center gap-2">
              <Brain className="w-5 h-5 text-brand-purple" /> AI Learning Prep
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="hidden lg:block relative"
        >
          {/* Card Mockup */}
          <div className="w-[380px] h-[520px] relative group mx-auto">
            <div className="absolute inset-0 bg-brand-purple/20 blur-[60px] opacity-20 -z-10 group-hover:opacity-40 transition-opacity" />
            
            {/* Design Style Stack */}
            <div className="absolute top-4 left-4 right-4 bottom-[-16px] bg-white/5 border border-white/10 rounded-[40px] -z-10" />
            <div className="absolute top-2 left-2 right-2 bottom-[-8px] bg-white/10 border border-white/10 rounded-[40px] -z-10" />

            <div className="w-full h-full bg-brand-navy border border-white/20 rounded-[40px] shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-[65%] bg-[url('https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800')] bg-cover bg-center" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/20 to-transparent z-10" />
              
              <div className="absolute bottom-10 left-8 right-8 z-20">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h3 className="text-3xl font-bold mb-1">Sarah Chen, 24</h3>
                    <p className="text-brand-cyan text-xs font-bold uppercase tracking-widest">Product Designer</p>
                  </div>
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-center flex-col shadow-xl">
                    <span className="text-xs font-black">Lvl 8</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-white/30 text-[10px] uppercase tracking-[0.2em] font-bold mb-2">Teaches</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1.5 bg-brand-purple/20 border border-brand-purple/40 rounded-xl text-[10px] font-bold">Figma Mastery</span>
                      <span className="px-3 py-1.5 bg-brand-purple/20 border border-brand-purple/40 rounded-xl text-[10px] font-bold">UX Research</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating AI Panel */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-12 -right-20 w-56 glass-card p-5 rounded-[32px] border-brand-cyan/30"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-brand-cyan/10 rounded-xl border border-brand-cyan/20">
                  <Brain className="text-brand-cyan w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold">98% Synergy</p>
                  <p className="text-[10px] text-white/30">Gemini Match Analysis</p>
                </div>
              </div>
              <p className="text-[10px] text-white/50 leading-relaxed italic">
                \"Complementary backgrounds in React and UI components detected.\"
              </p>
            </motion.div>
          </div>
        </motion.div>
      </main>

      <section className="relative z-10 px-6 max-w-7xl mx-auto py-32 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { icon: Zap, title: "Instant Connect", desc: "Swipe through a tailored list of learners and mentors based on mutual utility.", color: "purple" },
          { icon: Brain, title: "AI Synergy", desc: "Gemini 1.5 Pro analyzes skill maps to calculate real exchange value.", color: "cyan" },
          { icon: MessageSquare, title: "Immersive Chat", desc: "Real-time, persistent channels to coordinate your skill trades.", color: "purple" },
          { icon: Users, title: "Global Guilds", desc: "Join curated communities of high-level talent expanding their stacks.", color: "cyan" },
        ].map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="p-10 glass rounded-[40px] hover:bg-white/[0.06] transition-all hover:scale-105 group relative overflow-hidden"
          >
            <div className={`w-14 h-14 rounded-2xl ${feature.color === 'purple' ? 'bg-brand-purple/10 border-brand-purple/20' : 'bg-brand-cyan/10 border-brand-cyan/20'} flex items-center justify-center border mb-8 group-hover:scale-110 transition-transform`}>
              <feature.icon className={`${feature.color === 'purple' ? 'text-brand-purple' : 'text-brand-cyan'} w-7 h-7`} />
            </div>
            <h4 className="text-xl font-bold mb-4 tracking-tight">{feature.title}</h4>
            <p className="text-white/40 leading-relaxed text-sm font-medium">{feature.desc}</p>
          </motion.div>
        ))}
      </section>
    </div>
  );
}
