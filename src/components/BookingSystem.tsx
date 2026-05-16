import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, Clock, Video, X, ChevronRight, CheckCircle2, Globe } from "lucide-react";
import { format, addDays, startOfDay } from "date-fns";
import { cn } from "../lib/utils.ts";

interface BookingSystemProps {
  onClose: () => void;
  otherUser: any;
}

export default function BookingSystem({ onClose, otherUser }: BookingSystemProps) {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(addDays(new Date(), 1)));
  const [selectedTime, setSelectedTime] = useState("");
  const [loading, setLoading] = useState(false);

  const timeSlots = ["09:00 AM", "10:30 AM", "01:00 PM", "03:30 PM", "05:00 PM", "08:00 PM"];

  const handleConfirm = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(3);
    }, 1500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-brand-black/90 backdrop-blur-xl flex items-center justify-center p-6"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-lg glass border border-white/10 rounded-[40px] overflow-hidden"
      >
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
           <div>
              <h2 className="text-xl font-bold">Schedule a Swap</h2>
              <p className="text-xs text-white/40 mt-1">Booking session with {otherUser?.name}</p>
           </div>
           <button onClick={onClose} className="p-2 glass rounded-full hover:bg-white/10 transition-all">
             <X className="w-5 h-5 text-white/50" />
           </button>
        </div>

        <div className="p-8">
           <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                   <div>
                      <h4 className="text-[10px] font-black uppercase text-brand-cyan tracking-widest mb-4">Select Date</h4>
                      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                         {[...Array(7)].map((_, i) => {
                            const date = addDays(new Date(), i + 1);
                            const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                            return (
                               <button
                                 key={i}
                                 onClick={() => setSelectedDate(date)}
                                 className={cn(
                                   "flex-shrink-0 w-16 h-20 rounded-2xl flex flex-col items-center justify-center transition-all border",
                                   isSelected ? "bg-brand-purple border-brand-purple glow-purple scale-105" : "glass border-white/5 bg-white/5"
                                 )}
                               >
                                  <span className="text-[10px] uppercase font-bold opacity-50">{format(date, 'EEE')}</span>
                                  <span className="text-lg font-black">{format(date, 'd')}</span>
                               </button>
                            );
                         })}
                      </div>
                   </div>

                   <div>
                      <h4 className="text-[10px] font-black uppercase text-brand-cyan tracking-widest mb-4">Select Time</h4>
                      <div className="grid grid-cols-3 gap-3">
                         {timeSlots.map(time => (
                            <button
                              key={time}
                              onClick={() => setSelectedTime(time)}
                              className={cn(
                                "py-3 rounded-xl text-xs font-bold border transition-all",
                                selectedTime === time ? "bg-brand-cyan text-brand-black border-brand-cyan shadow-lg" : "glass border-white/5 hover:border-white/20"
                              )}
                            >
                               {time}
                            </button>
                         ))}
                      </div>
                   </div>

                   <div className="flex items-center gap-3 p-4 glass bg-white/5 rounded-2xl">
                      <Globe className="w-4 h-4 text-white/20" />
                      <span className="text-[10px] text-white/40 uppercase font-black tracking-widest">Timezone: UTC+5:30 (India)</span>
                   </div>

                   <button 
                     disabled={!selectedTime}
                     onClick={() => setStep(2)}
                     className="w-full py-4 bg-white text-brand-black rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                   >
                     Review Details <ChevronRight className="w-4 h-4" />
                   </button>
                </motion.div>
              )}

              {step === 2 && (
                 <motion.div 
                   key="step2"
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                   className="space-y-8"
                 >
                    <div className="glass p-8 rounded-[32px] space-y-4">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                             <Calendar className="w-5 h-5 text-brand-purple" />
                          </div>
                          <div>
                             <div className="text-[10px] text-white/30 uppercase font-bold">Date</div>
                             <div className="font-bold">{format(selectedDate, 'EEEE, MMM d')}</div>
                          </div>
                       </div>
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                             <Clock className="w-5 h-5 text-brand-cyan" />
                          </div>
                          <div>
                             <div className="text-[10px] text-white/30 uppercase font-bold">Time</div>
                             <div className="font-bold">{selectedTime}</div>
                          </div>
                       </div>
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                             <Video className="w-5 h-5 text-brand-purple" />
                          </div>
                          <div>
                             <div className="text-[10px] text-white/30 uppercase font-bold">Platform</div>
                             <div className="font-bold">SkillSwap Live Video</div>
                          </div>
                       </div>
                    </div>

                    <div className="flex flex-col gap-3">
                       <button 
                         disabled={loading}
                         onClick={handleConfirm}
                         className="w-full py-5 bg-brand-purple text-white rounded-2xl font-black text-sm uppercase tracking-widest glow-purple disabled:opacity-50"
                       >
                         {loading ? "Confirming..." : "Confirm Booking"}
                       </button>
                       <button onClick={() => setStep(1)} className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors">
                         Go Back
                       </button>
                    </div>
                 </motion.div>
              )}

              {step === 3 && (
                 <motion.div 
                   key="step3"
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="text-center py-10"
                 >
                    <div className="w-20 h-20 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
                       <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Session Booked!</h3>
                    <p className="text-white/40 text-sm max-w-xs mx-auto mb-10 leading-relaxed">
                       A calendar invitation and notification has been sent to {otherUser?.name}.
                    </p>
                    <button onClick={onClose} className="px-10 py-4 bg-white text-brand-black rounded-2xl font-black text-xs uppercase tracking-widest">
                       Return to Chat
                    </button>
                 </motion.div>
              )}
           </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
