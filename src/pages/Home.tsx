import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence, useSpring } from "motion/react";
import { Link } from "react-router-dom";
import { 
  Rocket, Briefcase, Code, Layout, Users, Zap, BarChart3, 
  MessageSquare, GraduationCap, ChevronRight, CheckCircle2,
  Activity, Star, Sparkles, MoveRight, Coins, Target, Terminal
} from "lucide-react";
import { cn } from "@/src/lib/utils";

// ----------------------------------------------------------------------
// 1. DYNAMIC BACKGROUND
// ----------------------------------------------------------------------
function LayeredBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Far Layer: Grid and Noise */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      {/* Middle Layer: Ambient Glows */}
      <motion.div 
        className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]"
        animate={{
          x: mousePosition.x * 0.02,
          y: mousePosition.y * 0.02,
        }}
        transition={{ type: "tween", ease: "easeOut", duration: 1 }}
      />
      <motion.div 
        className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px]"
        animate={{
          x: mousePosition.x * -0.02,
          y: mousePosition.y * -0.02,
        }}
        transition={{ type: "tween", ease: "easeOut", duration: 1 }}
      />
    </div>
  );
}

// ----------------------------------------------------------------------
// 2. HERO: OPPORTUNITY UNIVERSE
// ----------------------------------------------------------------------
const ORBIT_NODES = [
  { id: 1, angle: 0, radius: 180, label: "Frontend Dev", icon: Code, color: "text-blue-400", bg: "bg-blue-500/20", border: "border-blue-500/30", size: 1.2, speed: 20 },
  { id: 2, angle: 72, radius: 240, label: "Fintech Startup", icon: Rocket, color: "text-purple-400", bg: "bg-purple-500/20", border: "border-purple-500/30", size: 1.5, speed: 25 },
  { id: 3, angle: 144, radius: 200, label: "₹40k Gig", icon: Briefcase, color: "text-emerald-400", bg: "bg-emerald-500/20", border: "border-emerald-500/30", size: 1, speed: 18 },
  { id: 4, angle: 216, radius: 280, label: "UI Designer", icon: Layout, color: "text-pink-400", bg: "bg-pink-500/20", border: "border-pink-500/30", size: 1.1, speed: 30 },
  { id: 5, angle: 288, radius: 220, label: "Hackathon Team", icon: Users, color: "text-orange-400", bg: "bg-orange-500/20", border: "border-orange-500/30", size: 1.3, speed: 22 },
];

function OpportunityUniverse() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-32 overflow-hidden z-10">
      <div className="absolute inset-0 flex items-center justify-center opacity-40">
         {/* Orbit Rings */}
         <div className="absolute w-[360px] h-[360px] rounded-full border border-white/5 border-dashed animate-[spin_40s_linear_infinite]" />
         <div className="absolute w-[480px] h-[480px] rounded-full border border-white/5 border-dashed animate-[spin_50s_linear_infinite_reverse]" />
         <div className="absolute w-[560px] h-[560px] rounded-full border border-white/5 border-dashed animate-[spin_60s_linear_infinite]" />
         
         {/* Nodes */}
         {ORBIT_NODES.map((node, i) => (
           <motion.div
             key={node.id}
             className="absolute"
             animate={{ rotate: 360 }}
             transition={{ duration: node.speed, repeat: Infinity, ease: "linear" }}
             style={{
               width: node.radius * 2,
               height: node.radius * 2,
             }}
           >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <motion.div 
                  animate={{ rotate: -360 }}
                  transition={{ duration: node.speed, repeat: Infinity, ease: "linear" }}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-2xl backdrop-blur-md border shadow-2xl",
                    node.bg, node.border
                  )}
                  style={{ transform: `scale(${node.size})` }}
                >
                   <node.icon className={cn("w-5 h-5", node.color)} />
                   <span className="text-white font-medium text-sm whitespace-nowrap hidden sm:block">{node.label}</span>
                </motion.div>
              </div>
           </motion.div>
         ))}
      </div>

      {/* Center Core */}
      <div className="relative z-20 flex flex-col items-center text-center max-w-5xl mx-auto px-4">
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="text-6xl md:text-8xl lg:text-[7.5rem] font-display font-medium tracking-tight text-white leading-[0.95] mb-8"
        >
          Where ambition <br className="hidden md:block"/> meets <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">opportunity.</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          className="text-xl md:text-2xl text-gray-400 font-light max-w-3xl mb-12"
        >
          The premier ecosystem connecting elite student talent with high-growth startups, freelance gigs, and game-changing projects.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center gap-5"
        >
          <Link 
            to="/register" 
            className="h-16 px-10 rounded-full bg-white text-black font-semibold text-lg flex items-center justify-center gap-3 hover:scale-105 transition-transform duration-300 shadow-[0_0_40px_rgba(255,255,255,0.2)] group"
          >
            Enter the Network
            <MoveRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// ----------------------------------------------------------------------
// 3. INTERACTIVE STORYTELLING (Scroll sequence)
// ----------------------------------------------------------------------
const STORY_STAGES = [
  { id: "skill", title: "Showcase Skills", desc: "Build a verified portfolio that proves your capabilities to the world.", icon: Terminal, color: "text-blue-400", bg: "bg-blue-500/10" },
  { id: "match", title: "Discover Opportunities", desc: "Get matched with startups and gigs that need exactly what you can do.", icon: Target, color: "text-purple-400", bg: "bg-purple-500/10" },
  { id: "team", title: "Form Elite Teams", desc: "Combine forces with complementary talent to tackle ambitious projects.", icon: Users, color: "text-orange-400", bg: "bg-orange-500/10" },
  { id: "build", title: "Build & Deliver", desc: "Use integrated workspaces to collaborate, ship code, and exceed expectations.", icon: Rocket, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { id: "grow", title: "Grow Reputation", desc: "Earn verified on-chain credentials and income that compound your career.", icon: Star, color: "text-yellow-400", bg: "bg-yellow-500/10" },
];

function InteractiveStorytelling() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  return (
    <section ref={containerRef} className="py-40 relative z-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-32">
          <h2 className="text-4xl md:text-6xl font-display font-medium text-white mb-6">The Journey to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Impact</span></h2>
          <p className="text-xl text-gray-400 font-light max-w-2xl mx-auto">A seamless pipeline from campus to career.</p>
        </div>

        <div className="relative">
          {/* Connecting Line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent -translate-x-1/2" />
          
          <div className="space-y-32">
            {STORY_STAGES.map((stage, i) => {
              const isEven = i % 2 === 0;
              return (
                <motion.div 
                  key={stage.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-20%" }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={cn(
                    "relative flex flex-col md:flex-row items-center gap-12 md:gap-24",
                    isEven ? "md:flex-row-reverse" : ""
                  )}
                >
                  {/* Timeline Dot */}
                  <div className="absolute left-8 md:left-1/2 w-4 h-4 rounded-full bg-[#07090E] border-2 border-white/40 -translate-x-1/2 z-10" />
                  
                  {/* Content */}
                  <div className={cn("flex-1 pl-20 md:pl-0 text-left", isEven ? "md:text-right" : "md:text-left")}>
                    <div className={cn(
                      "inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 border border-white/10 backdrop-blur-md",
                      stage.bg
                    )}>
                      <stage.icon className={cn("w-8 h-8", stage.color)} />
                    </div>
                    <h3 className="text-3xl md:text-4xl font-display font-medium text-white mb-4">{stage.title}</h3>
                    <p className="text-lg text-gray-400 font-light leading-relaxed max-w-md ml-0 md:inline-block">
                      {stage.desc}
                    </p>
                  </div>
                  
                  {/* Visual Abstract */}
                  <div className="flex-1 hidden md:flex justify-center">
                    <div className="w-full max-w-[320px] aspect-square rounded-full bg-gradient-to-br from-white/5 to-transparent border border-white/10 flex items-center justify-center relative overflow-hidden group">
                       <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                       <stage.icon className="w-24 h-24 text-white/20 group-hover:scale-110 transition-transform duration-700" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// ----------------------------------------------------------------------
// 4. FLOATING PRODUCT SHOWCASE
// ----------------------------------------------------------------------
function ProductShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [200, -200]);
  const y3 = useTransform(scrollYProgress, [0, 1], [50, -50]);

  return (
    <section ref={containerRef} className="py-40 relative z-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-24 relative z-20">
          <h2 className="text-4xl md:text-6xl font-display font-medium text-white mb-6">Designed for <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">deep work.</span></h2>
          <p className="text-xl text-gray-400 font-light max-w-2xl mx-auto">Not just a job board. A complete operating system.</p>
        </div>

        <div className="relative h-[800px] flex items-center justify-center perspective-[2000px]">
          
          {/* Main Workspace Window */}
          <motion.div 
            style={{ y: y1 }}
            className="absolute z-20 w-full max-w-[800px] bg-[#0A0C14]/90 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            {/* Mac Titlebar */}
            <div className="h-12 border-b border-white/10 flex items-center px-4 bg-white/5">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-white/20" />
                <div className="w-3 h-3 rounded-full bg-white/20" />
                <div className="w-3 h-3 rounded-full bg-white/20" />
              </div>
              <div className="mx-auto text-xs text-gray-500 font-medium font-mono">workspace.hustlr.com</div>
            </div>
            {/* Content Mock */}
            <div className="p-6 flex gap-6 h-[400px]">
              <div className="w-48 hidden sm:flex flex-col gap-4 border-r border-white/5 pr-6">
                <div className="h-4 w-24 bg-white/10 rounded" />
                <div className="h-8 w-full bg-blue-500/20 border border-blue-500/30 rounded" />
                <div className="h-8 w-full bg-white/5 rounded" />
                <div className="h-8 w-full bg-white/5 rounded" />
              </div>
              <div className="flex-1 flex flex-col gap-6">
                <div className="flex justify-between items-center">
                  <div className="h-6 w-48 bg-white/10 rounded" />
                  <div className="h-8 w-24 bg-white/10 rounded-full" />
                </div>
                <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-xl p-6 flex flex-col gap-4">
                  <div className="h-3 w-full bg-white/10 rounded" />
                  <div className="h-3 w-5/6 bg-white/10 rounded" />
                  <div className="h-3 w-4/6 bg-white/10 rounded" />
                  
                  <div className="mt-auto flex gap-4">
                     <div className="h-20 flex-1 bg-emerald-500/10 border border-emerald-500/20 rounded-xl" />
                     <div className="h-20 flex-1 bg-purple-500/10 border border-purple-500/20 rounded-xl" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Floating Chat Window */}
          <motion.div 
            style={{ y: y2 }}
            className="absolute z-30 bottom-10 right-4 lg:right-20 w-[320px] bg-[#0A0C14]/90 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden hidden md:block"
          >
            <div className="p-4 border-b border-white/5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-400 to-pink-500" />
              <div>
                <div className="text-sm font-medium text-white">Shruti K.</div>
                <div className="text-xs text-emerald-400">Online</div>
              </div>
            </div>
            <div className="p-4 flex flex-col gap-4">
              <div className="bg-white/5 rounded-2xl rounded-tl-sm p-3 text-sm text-gray-300 self-start max-w-[85%]">
                The designs are ready for handoff! 🚀
              </div>
              <div className="bg-blue-600/30 border border-blue-500/40 rounded-2xl rounded-tr-sm p-3 text-sm text-blue-100 self-end max-w-[85%] shadow-sm">
                Amazing, integrating them now.
              </div>
            </div>
          </motion.div>

          {/* Floating Stats Window */}
          <motion.div 
            style={{ y: y3 }}
            className="absolute z-10 top-20 left-4 lg:left-20 w-[280px] bg-[#0A0C14]/90 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl p-5 hidden lg:block"
          >
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium text-white">Earnings Pipeline</span>
            </div>
            <div className="text-3xl font-display font-medium text-white mb-1">₹42,500</div>
            <div className="text-xs text-gray-400 mb-6">Pending release from escrow</div>
            
            <div className="space-y-3">
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="w-[70%] h-full bg-emerald-500 rounded-full" />
              </div>
              <div className="flex justify-between text-xs font-medium">
                <span className="text-gray-400">Milestone 1</span>
                <span className="text-emerald-400">Completed</span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

// ----------------------------------------------------------------------
// 5. LIVE ACTIVITY TICKER
// ----------------------------------------------------------------------
const ACTIVITIES = [
  "Aarav joined an AI startup",
  "Priya received a freelance offer",
  "Rohan launched a new project",
  "Team formed for EthIndia Hackathon",
  "Sneha earned ₹15,000 for UI Design",
  "Rahul verified 3 new skills",
  "Campus Ride App reached MVP status",
  "Dhruv hired 2 developers"
];

function LiveActivityStream() {
  return (
    <div className="w-full border-y border-white/5 bg-white/[0.01] overflow-hidden py-4 relative z-20">
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#07090E] to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#07090E] to-transparent z-10" />
      
      <motion.div 
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        className="flex whitespace-nowrap gap-12 px-12 items-center"
      >
        {[...ACTIVITIES, ...ACTIVITIES, ...ACTIVITIES].map((text, i) => (
          <div key={i} className="flex items-center gap-3 text-sm text-gray-400">
            <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
            {text}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 6. FINAL ECOSYSTEM CTA
// ----------------------------------------------------------------------
function FinalCTA() {
  return (
    <section className="py-40 relative z-20 overflow-hidden flex flex-col items-center justify-center text-center px-4 min-h-[90vh]">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-blue-900/40 to-purple-900/40 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#07090E_100%)]" />
      </div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-4xl relative z-20 flex flex-col items-center"
      >
        <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 backdrop-blur-md px-5 py-2 text-sm text-white mb-8 font-medium">
            <span className="relative flex h-2 w-2 mr-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            The network is live and active.
        </div>
        <h2 className="text-6xl md:text-[7rem] lg:text-[9rem] font-display font-medium mb-8 text-white tracking-[-0.03em] leading-[0.9]">
          Step into <br/> the arena.
        </h2>
        <p className="text-xl md:text-3xl font-light tracking-wide text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
          Join the most powerful collaboration network built exclusively for ambitious Indian students.
        </p>
        <Link
            to="/register"
            className="inline-flex h-16 items-center justify-center rounded-full bg-white px-12 text-lg font-semibold text-black transition-transform hover:scale-105 shadow-[0_0_60px_rgba(255,255,255,0.2)]"
        >
            Start Building Now
        </Link>
      </motion.div>
    </section>
  );
}

// ----------------------------------------------------------------------
// MAIN EXPORT
// ----------------------------------------------------------------------
export function Home() {
  return (
    <div className="flex flex-col bg-[#07090E] selection:bg-purple-500/30 text-white min-h-screen relative overflow-hidden font-sans">
      <LayeredBackground />
      <OpportunityUniverse />
      <LiveActivityStream />
      <InteractiveStorytelling />
      <ProductShowcase />
      <FinalCTA />
    </div>
  );
}
