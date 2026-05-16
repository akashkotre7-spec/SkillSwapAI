import { motion } from "motion/react";
import { LucideIcon, Sparkles } from "lucide-react";
import { cn } from "../lib/utils.ts";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export default function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction,
  className 
}: EmptyStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex flex-col items-center justify-center p-12 text-center max-w-sm mx-auto", className)}
    >
      <div className="relative mb-8 group">
        <div className="absolute inset-0 bg-brand-purple/20 rounded-[32px] blur-2xl group-hover:bg-brand-purple/30 transition-all duration-500" />
        <div className="relative w-24 h-24 glass rounded-[32px] flex items-center justify-center border-white/5 group-hover:border-brand-purple/30 transition-all duration-500">
          <Icon className="w-10 h-10 text-brand-purple animate-pulse-slow" />
        </div>
        <div className="absolute -top-2 -right-2 p-2 glass rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <Sparkles className="w-4 h-4 text-brand-glow animate-spin" />
        </div>
      </div>
      
      <h3 className="text-2xl font-black mb-3">{title}</h3>
      <p className="text-white/40 text-sm leading-relaxed mb-10">{description}</p>
      
      {actionLabel && (
        <button 
          onClick={onAction}
          className="px-10 py-4 bg-brand-purple rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg glow-purple"
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
}
