import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { 
  ArrowRight, ArrowLeft, Mail, Lock, User, GraduationCap, 
  Code, Layout, Rocket, Briefcase, Zap, CheckCircle2, Star, Target
} from "lucide-react";
import { cn } from "@/src/lib/utils";

const COLLEGES = [
  "IIT Delhi", "IIT Bombay", "IIT Madras", "BITS Pilani", 
  "NIT Trichy", "IIIT Hyderabad", "Delhi Technological University",
  "VIT Vellore", "SRM Institute", "Other"
];

const SKILLS = [
  { id: "react", label: "React", icon: Code },
  { id: "node", label: "Node.js", icon: Code },
  { id: "python", label: "Python", icon: Code },
  { id: "java", label: "Java", icon: Code },
  { id: "cpp", label: "C++", icon: Code },
  { id: "uiux", label: "UI/UX Design", icon: Layout },
  { id: "figma", label: "Figma", icon: Layout },
  { id: "aiml", label: "AI/ML", icon: Zap },
  { id: "marketing", label: "Growth", icon: Target },
];

const GOALS = [
  { id: "freelance", title: "Find Freelance Work", desc: "Monetize your skills", icon: Briefcase },
  { id: "projects", title: "Build Projects", desc: "Collaborate and ship", icon: Rocket },
  { id: "startup", title: "Join Startup Teams", desc: "Find early-stage roles", icon: Users },
  { id: "internship", title: "Find Internships", desc: "Kickstart your career", icon: Target },
];

function Users(props: any) { return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> }

import { useAuth } from "../context/AuthContext";

export function Register() {
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    college: "",
    degree: "",
    gradYear: "",
    skills: [] as string[],
    goals: [] as string[]
  });

  const nextStep = () => setStep(prev => Math.min(prev + 1, 5));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleComplete = async () => {
    setIsLoading(true);
    setError("");
    try {
      const mappedSkills = formData.skills.map(id => SKILLS.find(s => s.id === id)?.label || id);
      const payload = {
        ...formData,
        skills: mappedSkills,
      };

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      login(data.accessToken, data.user);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
      setStep(1); // Take them back to step 1 to review details
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelection = (field: "skills" | "goals", id: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(id) 
        ? prev[field].filter(i => i !== id)
        : [...prev[field], id]
    }));
  };

  return (
    <div className="min-h-screen bg-[#07090E] flex relative overflow-hidden font-sans">
      {/* Background */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <div className="absolute top-[-20%] left-[20%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[40%] h-[40%] rounded-full bg-purple-900/20 blur-[120px]" />
      </div>

      <div className="w-full max-w-2xl mx-auto px-4 py-12 flex flex-col relative z-10 min-h-screen">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-12 shrink-0">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-b from-white/10 to-white/0 border border-white/10">
               <div className="w-3 h-3 bg-white rounded-[2px]" />
            </div>
            <span className="text-white font-display font-semibold tracking-tight text-xl">HUSTLR</span>
          </Link>
          <div className="text-sm font-medium text-gray-500">
            Step {step} of 5
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-white/5 rounded-full mb-12 shrink-0 overflow-hidden">
           <motion.div 
             className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
             initial={{ width: 0 }}
             animate={{ width: `${(step / 5) * 100}%` }}
             transition={{ duration: 0.5, ease: "easeInOut" }}
           />
        </div>

        {/* Form Container */}
        <div className="flex-1 flex flex-col justify-center pb-12">
          <AnimatePresence mode="wait" custom={step}>
            
            {/* STEP 1: Basic Info */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-md mx-auto"
              >
                <div className="mb-10 text-center">
                  <h2 className="text-3xl font-display font-medium text-white mb-3 tracking-tight">Create your account</h2>
                  <p className="text-gray-400 font-light">Join the most exclusive student network.</p>
                </div>

                {error && (
                  <div className="p-4 mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 font-light">
                    {error}
                  </div>
                )}

                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Full Name</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                        <User className="w-5 h-5" />
                      </div>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 transition-all"
                        placeholder="Dhruv Sharma"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Email Address</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                        <Mail className="w-5 h-5" />
                      </div>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 transition-all"
                        placeholder="dhruv@college.edu"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Password</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                        <Lock className="w-5 h-5" />
                      </div>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={e => setFormData({...formData, password: e.target.value})}
                        className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                    {/* Password Strength Indicator */}
                    {formData.password && (
                      <div className="flex gap-1 pt-2">
                         <div className={cn("h-1 w-1/3 rounded-full", formData.password.length > 0 ? "bg-red-500" : "bg-white/10")} />
                         <div className={cn("h-1 w-1/3 rounded-full", formData.password.length > 5 ? "bg-yellow-500" : "bg-white/10")} />
                         <div className={cn("h-1 w-1/3 rounded-full", formData.password.length > 8 ? "bg-emerald-500" : "bg-white/10")} />
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={nextStep}
                    disabled={!formData.name || !formData.email || !formData.password}
                    className="w-full h-12 mt-4 flex items-center justify-center gap-2 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    Continue <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <p className="text-center text-sm text-gray-500 mt-4">
                    Already have an account? <Link to="/login" className="text-white hover:text-blue-400 transition-colors">Sign in</Link>
                  </p>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Academic Profile */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-md mx-auto"
              >
                <div className="mb-10 text-center">
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4">
                    <GraduationCap className="w-6 h-6 text-blue-400" />
                  </div>
                  <h2 className="text-3xl font-display font-medium text-white mb-3 tracking-tight">Academic Profile</h2>
                  <p className="text-gray-400 font-light">Where are you building from?</p>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">College / University</label>
                    <select
                      value={formData.college}
                      onChange={e => setFormData({...formData, college: e.target.value})}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500/50 appearance-none"
                    >
                      <option value="" disabled className="bg-gray-900">Select your college</option>
                      {COLLEGES.map(c => <option key={c} value={c} className="bg-gray-900">{c}</option>)}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Degree/Branch</label>
                      <input
                        type="text"
                        value={formData.degree}
                        onChange={e => setFormData({...formData, degree: e.target.value})}
                        className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500/50"
                        placeholder="B.Tech CS"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Grad Year</label>
                      <input
                        type="text"
                        value={formData.gradYear}
                        onChange={e => setFormData({...formData, gradYear: e.target.value})}
                        className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500/50"
                        placeholder="2026"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button onClick={prevStep} className="h-12 px-6 rounded-xl bg-white/5 text-white font-medium hover:bg-white/10 transition-colors">
                      Back
                    </button>
                    <button
                      onClick={nextStep}
                      disabled={!formData.college || !formData.degree}
                      className="flex-1 h-12 flex items-center justify-center gap-2 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 transition-all disabled:opacity-50 group"
                    >
                      Continue <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Skills */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-xl mx-auto"
              >
                <div className="mb-10 text-center">
                  <h2 className="text-3xl font-display font-medium text-white mb-3 tracking-tight">Your Arsenal</h2>
                  <p className="text-gray-400 font-light">Select the skills and domains you excel at.</p>
                </div>

                <div className="flex flex-wrap gap-3 justify-center mb-10">
                   {SKILLS.map(skill => {
                     const isSelected = formData.skills.includes(skill.id);
                     return (
                       <button
                         key={skill.id}
                         onClick={() => toggleSelection("skills", skill.id)}
                         className={cn(
                           "flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all duration-300 font-medium text-sm",
                           isSelected 
                             ? "bg-blue-500/20 border-blue-500/50 text-blue-400 scale-105" 
                             : "bg-white/[0.02] border-white/10 text-gray-400 hover:bg-white/5 hover:border-white/20"
                         )}
                       >
                         <skill.icon className="w-4 h-4" /> {skill.label}
                       </button>
                     );
                   })}
                </div>

                <div className="flex gap-3 max-w-md mx-auto">
                  <button onClick={prevStep} className="h-12 px-6 rounded-xl bg-white/5 text-white font-medium hover:bg-white/10 transition-colors">
                    Back
                  </button>
                  <button
                    onClick={nextStep}
                    disabled={formData.skills.length === 0}
                    className="flex-1 h-12 flex items-center justify-center gap-2 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 transition-all disabled:opacity-50 group"
                  >
                    Continue <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Goals */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-xl mx-auto"
              >
                <div className="mb-10 text-center">
                  <h2 className="text-3xl font-display font-medium text-white mb-3 tracking-tight">What brings you here?</h2>
                  <p className="text-gray-400 font-light">We'll personalize your ecosystem experience.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                   {GOALS.map(goal => {
                     const isSelected = formData.goals.includes(goal.id);
                     return (
                       <div
                         key={goal.id}
                         onClick={() => toggleSelection("goals", goal.id)}
                         className={cn(
                           "p-5 rounded-2xl border cursor-pointer transition-all duration-300",
                           isSelected 
                             ? "bg-purple-500/10 border-purple-500/40" 
                             : "bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.04]"
                         )}
                       >
                         <div className={cn(
                           "w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors",
                           isSelected ? "bg-purple-500/20 text-purple-400" : "bg-white/5 text-gray-400"
                         )}>
                           <goal.icon className="w-5 h-5" />
                         </div>
                         <h3 className="text-white font-medium mb-1">{goal.title}</h3>
                         <p className="text-sm text-gray-500 font-light">{goal.desc}</p>
                       </div>
                     );
                   })}
                </div>

                <div className="flex gap-3 max-w-md mx-auto">
                  <button onClick={prevStep} className="h-12 px-6 rounded-xl bg-white/5 text-white font-medium hover:bg-white/10 transition-colors">
                    Back
                  </button>
                  <button
                    onClick={nextStep}
                    disabled={formData.goals.length === 0}
                    className="flex-1 h-12 flex items-center justify-center gap-2 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 transition-all disabled:opacity-50 group"
                  >
                    Complete <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 5: Welcome Success */}
            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-lg mx-auto text-center py-10"
              >
                <div className="relative w-32 h-32 mx-auto mb-8">
                   <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
                   <div className="relative w-full h-full rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-2xl border-4 border-[#07090E]">
                     <CheckCircle2 className="w-14 h-14 text-[#07090E]" />
                   </div>
                </div>

                <h2 className="text-4xl font-display font-medium text-white mb-4">Welcome to HUSTLR, <br/><span className="text-emerald-400">{formData.name.split(' ')[0]}</span></h2>
                <p className="text-lg text-gray-400 font-light mb-10 max-w-sm mx-auto leading-relaxed">
                  Your profile is set up. The ecosystem is waiting.
                </p>

                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 mb-10 text-left">
                  <div className="flex items-center gap-3 mb-4">
                    <Star className="w-5 h-5 text-yellow-400" />
                    <h3 className="font-medium text-white">Recommended for you</h3>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-sm text-gray-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                      Browse 40+ freelance gigs matching your skills
                    </li>
                    <li className="flex items-center gap-3 text-sm text-gray-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      Join the '{formData.college}' exclusive network
                    </li>
                  </ul>
                </div>

                <button
                  onClick={handleComplete}
                  disabled={isLoading}
                  className="w-full max-w-sm mx-auto h-14 flex items-center justify-center gap-2 bg-white text-black font-semibold text-lg rounded-xl hover:bg-gray-100 hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.15)]"
                >
                  {isLoading ? (
                    <span className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  ) : (
                    "Enter Workspace"
                  )}
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
