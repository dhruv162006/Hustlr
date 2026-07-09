import React from "react";
import { motion } from "motion/react";
import { ShieldCheck, Calendar, Lock } from "lucide-react";

export function Privacy() {
  return (
    <div className="bg-gray-950 min-h-screen text-gray-200 pb-20 pt-28 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-xs font-medium text-emerald-400 mb-6">
            <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
            Privacy Safeguards
          </div>
          <h1 className="text-4xl font-display font-medium text-white mb-4">Privacy Policy</h1>
          <p className="text-gray-500 text-sm flex items-center justify-center gap-1.5"><Calendar className="w-4 h-4"/> Last Updated: July 9, 2026</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-8 rounded-3xl bg-white/[0.01] border border-white/5 space-y-8 font-light text-gray-300 leading-relaxed text-sm">
          <div className="space-y-3">
            <h2 className="text-lg font-display font-medium text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-400" /> 1. Data Collection & Hashing
            </h2>
            <p>HUSTLR stores basic profile identifiers including names, university emails, and skills endorsements. To keep passwords completely safe, we hash them using robust blowfish encryption salts prior to database storage.</p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-display font-medium text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-400" /> 2. Token Security & Session Invalidation
            </h2>
            <p>We issue short-lived 15-minute JSON Web Tokens (JWT) for route verification alongside 7-day cookies for session refreshes. Refresh Token Rotation (RTR) is enforced globally: refresh requests immediately invalidate old credentials to safeguard active sessions.</p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-display font-medium text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-400" /> 3. Third-Party Integrations
            </h2>
            <p>File uploads (such as avatars and PDF resumes) are processed securely and uploaded to Cloudinary. These links are managed through strict CORS origin configurations to prevent injection or parameter manipulation.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
