import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";

export default function Terms() {
  return (
    <div className="min-h-screen bg-brand-black p-10 lg:p-20 overflow-y-auto">
      <Link to="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-12 group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Home
      </Link>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto glass-card p-10 lg:p-16 rounded-[48px]"
      >
        <h1 className="text-4xl font-black mb-8">Terms of Service</h1>
        <div className="space-y-6 text-white/60 leading-relaxed">
          <p>Welcome to SkillSwap AI. By using our platform, you agree to these terms...</p>
          <h2 className="text-xl font-bold text-white mt-10">1. Core Exchange Principles</h2>
          <p>SkillSwap is built on the principle of mutual respect and talent exchange. Users are expected to provide high-quality teaching in exchange for learning.</p>
          
          <h2 className="text-xl font-bold text-white">2. Community Conduct</h2>
          <p>Harassment, discrimination, or any form of abuse is strictly prohibited. Users violating these principles will be banned immediately.</p>
          
          <h2 className="text-xl font-bold text-white">3. Artificial Intelligence</h2>
          <p>Our platform uses Gemini AI to facilitate connections and coaching. AI-generated responses are for educational purposes only.</p>
          
          <h2 className="text-xl font-bold text-white">4. Cancellations & Bookings</h2>
          <p>Bookings made via the platform should be honored. Repeated no-shows will affect your reputation score.</p>
        </div>
      </motion.div>
    </div>
  );
}
