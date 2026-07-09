import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { 
  ArrowRight, Mail, Lock, Eye, EyeOff, ShieldCheck, 
  Sparkles, CheckCircle2, ChevronLeft, Github, Chrome
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useAuth } from "../context/AuthContext";

export function Login() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }
      login(data.accessToken, data.user);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090E] flex relative overflow-hidden font-sans">
      
      {/* LEFT PANEL - Brand Experience */}
      <div className="hidden lg:flex flex-1 relative flex-col justify-between p-12 border-r border-white/5 overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-[#07090E] to-purple-900/20 z-0" />
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-blue-600/10 blur-[120px] z-0" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-purple-600/10 blur-[120px] z-0" />
        
        <div className="relative z-10 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-b from-white/10 to-white/0 border border-white/10 overflow-hidden">
               <div className="w-3 h-3 bg-white rounded-[2px] group-hover:rotate-90 group-hover:scale-75 transition-all duration-500" />
            </div>
            <span className="text-white font-display font-semibold tracking-tight text-xl">HUSTLR</span>
          </Link>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Ecosystem Online
          </div>
        </div>

        <div className="relative z-10 max-w-lg mt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl lg:text-5xl font-display font-medium text-white mb-6 leading-[1.1] tracking-tight">
              Welcome back to <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">the arena.</span>
            </h1>
            <p className="text-lg text-gray-400 font-light leading-relaxed mb-12">
              The premier ecosystem for ambitious Indian students. Find work, form teams, and build your verifiable reputation.
            </p>
          </motion.div>

          {/* Live Ecosystem Stats */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="grid grid-cols-2 gap-4"
          >
            {[
              { label: "Active Builders", value: "12,402", trend: "+124 this week" },
              { label: "Opportunities", value: "₹4.2M+", trend: "Value created" },
              { label: "Teams Formed", value: "850+", trend: "Across 40+ campuses" },
              { label: "Projects Shipped", value: "3,200+", trend: "Verified work" },
            ].map((stat, i) => (
              <div key={i} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm">
                 <h3 className="text-2xl font-display font-medium text-white mb-1">{stat.value}</h3>
                 <p className="text-sm font-medium text-gray-300">{stat.label}</p>
                 <p className="text-xs font-light text-gray-500 mt-1">{stat.trend}</p>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-sm text-gray-500 font-medium">
           <ShieldCheck className="w-5 h-5 text-emerald-400/70" />
           Secure, encrypted, and privacy-first student platform.
        </div>
      </div>

      {/* RIGHT PANEL - Sign In Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12 relative z-10">
        
        {/* Mobile Header */}
        <div className="absolute top-6 left-6 lg:hidden">
          <Link to="/" className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-b from-white/10 to-white/0 border border-white/10">
               <div className="w-3 h-3 bg-white rounded-[2px]" />
            </div>
            <span className="text-white font-display font-semibold tracking-tight text-xl">HUSTLR</span>
          </Link>
        </div>

        <div className="w-full max-w-[420px]">
           <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-8">
             <ChevronLeft className="w-4 h-4" /> Back to home
           </Link>

           <div className="mb-10">
             <h2 className="text-3xl font-display font-medium text-white mb-3">Sign in</h2>
             <p className="text-gray-400 font-light">Continue to your HUSTLR workspace.</p>
           </div>

           {error && (
             <div className="p-4 mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 font-light">
               {error}
             </div>
           )}

           <form onSubmit={handleLogin} className="space-y-5">
              
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

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-gray-300">Password</label>
                  <Link to="/forgot-password" className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500 group-focus-within:text-blue-400 transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3 pl-11 pr-11 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:bg-blue-500/5 transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 py-2">
                <input 
                  type="checkbox" 
                  id="remember" 
                  className="w-4 h-4 rounded border-white/10 bg-white/5 text-blue-500 focus:ring-blue-500/20 focus:ring-offset-0"
                />
                <label htmlFor="remember" className="text-sm text-gray-400 select-none cursor-pointer">
                  Keep me signed in
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading || !email || !password}
                className="w-full h-12 flex items-center justify-center gap-2 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                ) : (
                  <>Sign In <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                )}
              </button>
           </form>

           <div className="mt-8 relative">
              <div className="absolute inset-0 flex items-center">
                 <div className="w-full border-t border-white/5"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                 <span className="px-4 bg-[#07090E] text-gray-500">Or continue with</span>
              </div>
           </div>

           <div className="mt-8 grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-2 h-11 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-white hover:bg-white/10 transition-colors">
                <Chrome className="w-4 h-4" /> Google
              </button>
              <button className="flex items-center justify-center gap-2 h-11 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-white hover:bg-white/10 transition-colors">
                <Github className="w-4 h-4" /> GitHub
              </button>
           </div>

           <p className="mt-10 text-center text-sm text-gray-500">
              Don't have an account?{" "}
              <Link to="/register" className="font-medium text-white hover:text-blue-400 transition-colors">
                Get started
              </Link>
           </p>
        </div>
      </div>
    </div>
  );
}
