import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { 
  ArrowRight, Mail, Lock, KeyRound, CheckCircle2, ChevronLeft, 
  ArrowLeft
} from "lucide-react";
import { cn } from "@/src/lib/utils";

export function ForgotPassword() {
  const [step, setStep] = useState<"email" | "otp" | "new_password" | "success">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep("otp");
    }, 1500);
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep("new_password");
    }, 1500);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep("success");
    }, 1500);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  return (
    <div className="min-h-screen bg-[#07090E] flex flex-col justify-center items-center p-6 relative overflow-hidden font-sans">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.05)_0%,transparent_50%)]" />
      
      <div className="w-full max-w-[420px] relative z-10">
        
        {step !== "success" && (
          <Link to={step === "email" ? "/login" : "#"} onClick={() => step !== "email" && setStep(step === "otp" ? "email" : "otp")} className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        )}

        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: EMAIL */}
            {step === "email" && (
              <motion.div
                key="email"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6">
                  <KeyRound className="w-6 h-6 text-blue-400" />
                </div>
                <h2 className="text-2xl font-display font-medium text-white mb-2">Reset Password</h2>
                <p className="text-gray-400 font-light mb-8 text-sm leading-relaxed">
                  Enter your email address and we'll send you a verification code to reset your password.
                </p>

                <form onSubmit={handleEmailSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Email Address</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500 group-focus-within:text-blue-400 transition-colors">
                        <Mail className="w-5 h-5" />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:bg-blue-500/5 transition-all"
                        placeholder="dhruv@example.com"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading || !email}
                    className="w-full h-12 flex items-center justify-center gap-2 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    {isLoading ? (
                      <span className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    ) : (
                      <>Send Code <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {/* STEP 2: OTP */}
            {step === "otp" && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6">
                  <Mail className="w-6 h-6 text-purple-400" />
                </div>
                <h2 className="text-2xl font-display font-medium text-white mb-2">Check your email</h2>
                <p className="text-gray-400 font-light mb-8 text-sm leading-relaxed">
                  We sent a 6-digit verification code to <span className="font-medium text-white">{email}</span>.
                </p>

                <form onSubmit={handleOtpSubmit} className="space-y-6">
                  <div className="flex justify-between gap-2">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        inputMode="numeric"
                        pattern="\d*"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-12 h-14 bg-white/[0.02] border border-white/10 rounded-xl text-center text-xl font-medium text-white focus:outline-none focus:border-blue-500/50 focus:bg-blue-500/5 transition-all"
                      />
                    ))}
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading || otp.some(d => !d)}
                    className="w-full h-12 flex items-center justify-center gap-2 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    {isLoading ? (
                      <span className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    ) : (
                      <>Verify Code <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                    )}
                  </button>
                  <p className="text-center text-sm text-gray-500">
                    Didn't receive it? <button type="button" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">Resend code</button>
                  </p>
                </form>
              </motion.div>
            )}

            {/* STEP 3: NEW PASSWORD */}
            {step === "new_password" && (
              <motion.div
                key="new_password"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
                  <Lock className="w-6 h-6 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-display font-medium text-white mb-2">Create new password</h2>
                <p className="text-gray-400 font-light mb-8 text-sm leading-relaxed">
                  Your new password must be different from previously used passwords.
                </p>

                <form onSubmit={handlePasswordSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">New Password</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500 group-focus-within:text-emerald-400 transition-colors">
                        <Lock className="w-5 h-5" />
                      </div>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 focus:bg-emerald-500/5 transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading || newPassword.length < 8}
                    className="w-full h-12 flex items-center justify-center gap-2 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    {isLoading ? (
                      <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>Reset Password <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {/* STEP 4: SUCCESS */}
            {step === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="text-center py-6"
              >
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-display font-medium text-white mb-3">Password Reset Complete</h2>
                <p className="text-gray-400 font-light mb-8 text-sm leading-relaxed max-w-xs mx-auto">
                  Your password has been successfully reset. You can now log in with your new credentials.
                </p>
                <Link
                  to="/login"
                  className="w-full h-12 flex items-center justify-center bg-white text-black font-semibold rounded-xl hover:bg-gray-100 transition-all"
                >
                  Return to Sign In
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
