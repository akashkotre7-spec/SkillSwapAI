import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";

export default function Privacy() {
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
        <h1 className="text-4xl font-black mb-8">Privacy Policy</h1>
        <div className="space-y-6 text-white/60 leading-relaxed">
          <p>At SkillSwap AI, your data privacy is our priority. This policy outlines how we handle your information.</p>
          
          <h2 className="text-xl font-bold text-white mt-10">1. Data Collection</h2>
          <p>We collect information provided by you (profile data, skills) and platform interaction data (messages, matches) to improve your experience.</p>
          
          <h2 className="text-xl font-bold text-white">2. AI Processing</h2>
          <p>Our AI systems analyze your skill preferences to provide better recommendations. This data is processed securely and is not shared with third-party advertisers.</p>
          
          <h2 className="text-xl font-bold text-white">3. Security</h2>
          <p>We use industry-standard encryption (Firebase Auth, Firestore Security Rules) to protect your data from unauthorized access.</p>
          
          <h2 className="text-xl font-bold text-white">4. Cookies</h2>
          <p>We use essential cookies to maintain your session and security. No non-essential tracking cookies are used without your consent.</p>
        </div>
      </motion.div>
    </div>
  );
}
