import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Brain, Zap, ArrowLeft, Send, Loader2, Sparkles, Target, BookOpen, ChevronRight, X, ExternalLink, Play, Globe, GraduationCap } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { generateLearningRoadmap, getTutorResponse, getStepResources } from "../services/geminiService.ts";
import { getStorageItem } from "../lib/storage.ts";
import { cn } from "../lib/utils.ts";

export default function AICoach() {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const [selectedSkill, setSelectedSkill] = useState("");
  const [roadmap, setRoadmap] = useState<any[]>([]);
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [inputText, setInputText] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Resource Modal State
  const [selectedStep, setSelectedStep] = useState<any>(null);
  const [resources, setResources] = useState<any[]>([]);
  const [resourcesLoading, setResourcesLoading] = useState(false);

  useEffect(() => {
    const storedUser = getStorageItem("user", {} as any);
    if (!storedUser.userId) {
      navigate("/login");
      return;
    }
    setUser(storedUser);
    if (storedUser.learns && storedUser.learns.length > 0) {
      setSelectedSkill(storedUser.learns[0]);
    } else {
      setSelectedSkill("General Learning");
    }
  }, [navigate]);

  useEffect(() => {
    if (selectedSkill) {
      handleGenerateRoadmap();
    }
  }, [selectedSkill]);

  useEffect(() => {
    chatScrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleGenerateRoadmap = async () => {
    setRoadmapLoading(true);
    try {
      const data = await generateLearningRoadmap(selectedSkill);
      setRoadmap(data);
    } catch (err) {
      console.error(err);
    } finally {
      setRoadmapLoading(false);
    }
  };

  const handleViewResources = async (step: any) => {
    setSelectedStep(step);
    setResourcesLoading(true);
    try {
      const data = await getStepResources(selectedSkill, step.title, step.search_query);
      setResources(data);
    } catch (err) {
      console.error(err);
    } finally {
      setResourcesLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || chatLoading) return;

    const userMsg = inputText.trim();
    setChatMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setInputText("");
    setChatLoading(true);

    try {
      const response = await getTutorResponse(userMsg, selectedSkill);
      setChatMessages(prev => [...prev, { role: "ai", text: response }]);
    } catch (err) {
      console.error(err);
    } finally {
      setChatLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-brand-black bg-mesh flex flex-col overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-brand-purple/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-brand-cyan/10 rounded-full blur-[120px] pointer-events-none" />

      <header className="px-6 py-6 border-b border-white/5 bg-brand-black/50 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/discovery" className="w-10 h-10 glass rounded-full flex items-center justify-center">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-display font-bold flex items-center gap-2">
              <Brain className="text-brand-purple w-5 h-5" /> AI Learning Coach
            </h1>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Personalized Tutoring by Gemini</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-1 rounded-2xl">
          {user.learns?.map((skill: string) => (
            <button
              key={skill}
              onClick={() => setSelectedSkill(skill)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedSkill === skill 
                  ? 'bg-brand-purple text-white shadow-lg shadow-brand-purple/20' 
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              {skill}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 overflow-hidden flex flex-col lg:grid lg:grid-cols-2">
        {/* Left Side: Roadmap */}
        <section className="flex-1 overflow-y-auto p-8 border-r border-white/5 no-scrollbar">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Target className="text-brand-cyan w-6 h-6" /> Your {selectedSkill} Roadmap
            </h2>
            <button 
              onClick={handleGenerateRoadmap}
              className="p-2 glass rounded-xl hover:text-brand-purple transition-colors"
              title="Regenerate Roadmap"
            >
              <Zap className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-6 relative">
            <div className="absolute left-6 top-8 bottom-8 w-px bg-white/5" />
            
            {roadmapLoading ? (
              <div className="py-20 flex flex-col items-center justify-center text-white/20">
                <Loader2 className="w-10 h-10 animate-spin mb-4" />
                <p className="text-sm font-medium">Gemini is structuring your journey...</p>
              </div>
            ) : roadmap.length === 0 ? (
               <div className="py-20 text-center text-white/20 italic">
                 Click the refresh icon to generate your roadmap.
               </div>
            ) : (
              roadmap.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="relative pl-16 group"
                >
                  <div className="absolute left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-brand-navy border-2 border-brand-purple group-hover:scale-150 transition-transform shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
                  <div className="glass-card p-6 rounded-3xl group-hover:border-brand-purple/30 transition-all group-hover:translate-x-2">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-brand-cyan text-sm uppercase tracking-wider">{step.title}</h4>
                      <span className="text-[10px] bg-white/5 px-2 py-1 rounded-lg text-white/40 font-mono">{step.time}</span>
                    </div>
                    <p className="text-sm text-white/50 leading-relaxed">{step.description}</p>
                    <button 
                      onClick={() => handleViewResources(step)}
                      className="mt-4 text-[10px] text-brand-purple font-black uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all"
                    >
                      Read Resources <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </section>

        {/* Right Side: Tutor Chat */}
        <section className="flex-1 flex flex-col bg-white/[0.02] overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-white/30">AI Tutor: Quick Help</h3>
            <div className="flex items-center gap-2 px-3 py-1 bg-brand-cyan/10 rounded-full">
              <div className="w-1.5 h-1.5 bg-brand-cyan rounded-full animate-pulse" />
              <span className="text-[10px] text-brand-cyan font-bold uppercase">Ready</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
            {chatMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-10">
                <div className="w-16 h-16 bg-brand-purple/10 rounded-full flex items-center justify-center mb-6">
                  <Sparkles className="w-8 h-8 text-brand-purple" />
                </div>
                <h4 className="text-lg font-bold mb-2">Stuck on something?</h4>
                <p className="text-xs text-white/40 leading-relaxed">
                  Ask me anything about {selectedSkill}. I can explain concepts, debug code, or suggest better tools.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-2">
                   {[`Explain core concepts`, `Best resources`, `Interview tips`].map(q => (
                     <button
                       key={q}
                       onClick={() => setInputText(`${q} for ${selectedSkill}`)}
                       className="px-3 py-1.5 glass bg-white/5 rounded-xl text-[10px] font-bold text-white/40 hover:text-white/60 hover:border-white/20 transition-all"
                     >
                       {q}
                     </button>
                   ))}
                </div>
              </div>
            ) : (
              chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-brand-purple text-white shadow-lg shadow-brand-purple/20' 
                      : 'glass border-white/10 text-white/80'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))
            )}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="glass p-4 rounded-3xl flex gap-1">
                  <div className="w-1.5 h-1.5 bg-brand-purple rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                  <div className="w-1.5 h-1.5 bg-brand-purple rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="w-1.5 h-1.5 bg-brand-purple rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            )}
            <div ref={chatScrollRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-6 bg-brand-black/30 border-t border-white/5">
            <div className="relative">
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Ask about ${selectedSkill}...`}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-16 focus:outline-none focus:border-brand-purple/50 transition-all text-sm"
              />
              <button 
                type="submit"
                disabled={!inputText.trim() || chatLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-brand-purple rounded-xl flex items-center justify-center glow-purple disabled:opacity-50 transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </section>
      </main>

      {/* Resources Modal */}
      <AnimatePresence>
        {selectedStep && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStep(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="relative w-full max-w-2xl glass-card rounded-t-[40px] sm:rounded-[40px] p-8 max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-bold flex items-center gap-3">
                    <BookOpen className="text-brand-purple w-6 h-6" /> {selectedStep.title}
                  </h3>
                  <p className="text-sm text-white/40 mt-1">Recommended learning resources</p>
                </div>
                <button 
                  onClick={() => setSelectedStep(null)}
                  className="w-10 h-10 glass rounded-full flex items-center justify-center hover:bg-white/10 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {resourcesLoading ? (
                <div className="py-20 flex flex-col items-center justify-center text-white/20">
                  <Loader2 className="w-10 h-10 animate-spin mb-4" />
                  <p className="text-sm font-medium">Gemini is curating resources...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {resources.map((res, i) => (
                    <motion.a
                      key={i}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="glass-card p-5 rounded-3xl flex items-center gap-5 hover:bg-white/5 transition-all group border-white/5"
                    >
                      <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        {res.type?.toLowerCase().includes('video') ? <Play className="w-6 h-6 text-red-400" /> :
                         res.type?.toLowerCase().includes('doc') ? <Globe className="w-6 h-6 text-brand-cyan" /> :
                         <GraduationCap className="w-6 h-6 text-brand-purple" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black uppercase tracking-widest text-white/20">{res.type}</span>
                          <div className="w-1 h-1 bg-white/10 rounded-full" />
                          <span className={cn(
                            "text-[10px] font-bold uppercase px-2 py-0.5 rounded-md",
                            res.difficulty === 'Beginner' ? 'bg-green-500/10 text-green-500' :
                            res.difficulty === 'Intermediate' ? 'bg-amber-500/10 text-amber-500' :
                            'bg-red-500/10 text-red-500'
                          )}>
                            {res.difficulty}
                          </span>
                        </div>
                        <h4 className="font-bold text-lg group-hover:text-brand-purple transition-colors">{res.title}</h4>
                        <p className="text-sm text-white/40 mt-1 line-clamp-1">{res.description}</p>
                      </div>
                      <ExternalLink className="w-5 h-5 text-white/10 group-hover:text-white transition-all group-hover:translate-x-1" />
                    </motion.a>
                  ))}
                  
                  {resources.length === 0 && (
                    <div className="py-20 text-center text-white/20 italic">
                      No resources found for this step. Try again later.
                    </div>
                  )}
                </div>
              )}
              
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 glass rounded-3xl border-brand-purple/20 bg-brand-purple/5">
                  <div className="flex items-center gap-3 mb-3">
                    <Sparkles className="w-5 h-5 text-brand-purple" />
                    <h4 className="font-bold text-sm">AI Learning Tip</h4>
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed">
                    Start with the documentation for a solid foundation, then move to video tutorials to see concepts in action. Active practice is key!
                  </p>
                </div>
                
                <div className="p-6 glass rounded-3xl border-brand-cyan/20 bg-brand-cyan/5">
                  <div className="flex items-center gap-3 mb-3">
                    <Target className="w-5 h-5 text-brand-cyan" />
                    <h4 className="font-bold text-sm">Practice Task</h4>
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed">
                    {selectedStep.practice_task || "Try to implement a small feature using the concepts learned in this step."}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
