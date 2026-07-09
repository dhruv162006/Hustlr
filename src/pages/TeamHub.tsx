import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, Code, Search, Sparkles, Filter, Rocket, 
  Terminal, LineChart, Target, Trophy, Clock, BadgeCheck,
  ChevronRight, ArrowRight, UserPlus, Flag, Plus, FileText,
  MapPin, CheckCircle2, LayoutTemplate, Briefcase, MessagesSquare
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Link, useNavigate } from "react-router-dom";

// --- Mock Data ---
interface Team {
  id: string;
  name: string;
  type: string;
  stage: string;
  leader: string;
  description: string;
  membersCount: number;
  maxMembers: number;
  rolesNeeded: string[];
  matchScore?: number;
  reputation: number;
  tags: string[];
}

import { useAuth } from "../context/AuthContext";

export function TeamHub() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Discover");
  const [teams, setTeams] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Create Team modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamDesc, setNewTeamDesc] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  const fetchTeams = () => {
    if (!token) return;
    setLoading(true);
    setError("");
    fetch("/api/teams", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) {
          throw new Error(data.error || "Failed to load teams");
        }
        return data;
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setTeams(data.map((t: any) => ({
            id: t.id,
            name: t.name,
            type: "Startup Build",
            stage: t.status === "RECRUITING" ? "Forming" : "Active Builder",
            leader: t.lead?.name || "Founder",
            description: t.description || "",
            membersCount: t.membersCount || 1,
            maxMembers: 5,
            rolesNeeded: ["Builder"],
            reputation: 4.8,
            tags: ["Co-founder", "MVP"],
          })));
        }
      })
      .catch((err: any) => {
        setError(err.message || "Failed to load collaboration teams.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setCreateLoading(true);
    try {
      const response = await fetch("/api/teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newTeamName,
          description: newTeamDesc
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to create team");
      }
      fetchTeams();
      setShowCreateModal(false);
      setNewTeamName("");
      setNewTeamDesc("");
    } catch (err: any) {
      alert(err.message || "Failed to create team");
    } finally {
      setCreateLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTeams();
    }
  }, [token]);

  const stats = [
    { label: "Active Teams", value: "842" },
    { label: "Startups Founded", value: "156" },
    { label: "Hackathon Teams", value: "320" },
    { label: "Collabs", value: "2,400+" }
  ];

  const categories = [
    { id: "Discover", name: "Discover Teams", icon: Users },
    { id: "Startups", name: "Startup Builder", icon: Rocket },
    { id: "Hackathons", name: "Hackathons", icon: Terminal },
    { id: "Roles", name: "Open Roles", icon: Target },
    { id: "Workspace", name: "Workspace Preview", icon: LayoutTemplate }
  ];

  return (
    <div className="bg-gray-950 min-h-screen text-gray-200 pb-20">
      
      {/* --- HERO SECTION --- */}
      <section className="relative pt-24 pb-16 px-4 md:pt-32 md:pb-24 border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,100,255,0.05)_0%,transparent_60%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center text-center">
          
          <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-blue-400 mb-6 backdrop-blur-md">
             <Sparkles className="w-3.5 h-3.5 mr-1.5" />
             The Ultimate Collaboration Hub
          </div>

          <h1 className="text-5xl md:text-7xl font-display font-medium text-white mb-6 tracking-tight">
            Build your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">dream team.</span>
          </h1>
          <p className="text-xl md:text-2xl font-light tracking-wide text-gray-400 max-w-2xl mx-auto mb-10">
            Find co-founders, join hackathons, and ship projects with the most talented students globally.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-16">
             <button 
                onClick={() => {
                  if (!token) navigate("/login");
                  else setShowCreateModal(true);
                }}
                className="h-12 px-8 rounded-xl bg-white text-black font-semibold hover:bg-gray-100 hover:scale-105 active:scale-95 transition-all flex items-center shadow-[0_0_40px_rgba(255,255,255,0.15)]"
              >
               <Plus className="w-5 h-5 mr-2" /> Create Team
             </button>
             <button className="h-12 px-8 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors flex items-center">
               <Search className="w-5 h-5 mr-2" /> Join A Team
             </button>
          </div>

          {/* Stats Grid */}
          <div className="w-full max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
             {stats.map((stat, i) => (
               <div key={i} className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col items-center justify-center">
                 <span className="text-3xl font-display font-medium text-white mb-1">{stat.value}</span>
                 <span className="text-xs font-medium uppercase tracking-wider text-gray-500">{stat.label}</span>
               </div>
             ))}
          </div>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-12">
        
        {/* Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide mb-10 border-b border-white/5">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={cn(
                "whitespace-nowrap px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2",
                activeTab === cat.id 
                  ? "bg-white text-black" 
                  : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10"
              )}
            >
              <cat.icon className="w-4 h-4" />
              {cat.name}
            </button>
          ))}
        </div>

        {/* --- DISCOVER TEAMS (DEFAULT) --- */}
        {activeTab === "Discover" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
            
            {/* Search & Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input 
                  type="text" 
                  placeholder="Search by project name, tech stack, or required roles..."
                  className="w-full bg-white/[0.02] border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button className="px-6 py-3.5 bg-white/[0.02] border border-white/10 text-white rounded-xl flex items-center justify-center font-medium hover:bg-white/5 transition-colors shrink-0">
                <Filter className="w-4 h-4 mr-2" /> Filters
              </button>
            </div>

            {/* AI Matches Banner */}
            <div className="p-1 rounded-2xl bg-gradient-to-r from-blue-500/20 to-indigo-500/20">
               <div className="bg-gray-900 rounded-xl p-6 border border-white/10">
                 <div className="flex items-center justify-between mb-4">
                   <h3 className="font-display font-medium text-white flex items-center gap-2 text-lg">
                     <Sparkles className="w-5 h-5 text-blue-400" /> AI Recommended Matches
                   </h3>
                 </div>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {teams.filter(t => t.matchScore).slice(0, 2).map((team) => (
                      <div key={team.id} className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 flex items-start gap-4 hover:border-blue-500/40 transition-colors cursor-pointer">
                         <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-lg">
                           {team.name.charAt(0)}
                         </div>
                         <div className="flex-1 min-w-0">
                           <div className="flex items-center justify-between mb-1">
                             <h4 className="font-medium text-white truncate">{team.name}</h4>
                             <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold">{team.matchScore}% Match</span>
                           </div>
                           <p className="text-xs text-blue-300 font-light truncate mb-2">Looking for: {team.rolesNeeded.join(", ")}</p>
                           <p className="text-sm text-gray-400 font-light line-clamp-1">{team.description}</p>
                         </div>
                      </div>
                    ))}
                 </div>
               </div>
            </div>

            {/* General Teams Grid */}
            <div>
              <h3 className="text-xl font-display font-medium text-white mb-6">Explore Open Teams</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {teams.length > 0 ? (
                  teams.map(team => (
                    <div key={team.id} className="group flex flex-col p-6 rounded-3xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.04] transition-colors relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4">
                         <span className={cn(
                           "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border",
                           team.type === 'Startup Idea' || team.type === 'Startup' ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                           team.type === 'Hackathon' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                           "bg-purple-500/10 text-purple-400 border-purple-500/20"
                         )}>
                           {team.type}
                         </span>
                      </div>

                      <div className="flex items-start gap-3 mb-4 pr-20">
                        <div className="w-10 h-10 rounded-xl bg-gray-800 border border-white/10 flex items-center justify-center text-white font-bold shrink-0">
                          {team.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-lg font-display font-medium text-white group-hover:text-blue-400 transition-colors">{team.name}</h3>
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            Led by {team.leader} <BadgeCheck className="w-3 h-3 text-blue-400" />
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-gray-400 font-light line-clamp-3 mb-6 flex-1">
                        {team.description}
                      </p>

                      <div className="space-y-4 mb-6">
                        <div>
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                            <span>Team Size: {team.membersCount}/{team.maxMembers}</span>
                            <span className="font-medium text-emerald-400">{team.maxMembers - team.membersCount} Spots left</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(team.membersCount/team.maxMembers)*100}%` }} />
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-[10px] uppercase font-medium tracking-wider text-gray-500 block mb-2">Roles Needed</span>
                          <div className="flex flex-wrap gap-1.5">
                            {team.rolesNeeded.map(role => (
                              <span key={role} className="px-2 py-1 rounded bg-white/5 border border-white/5 text-gray-300 text-xs">
                                {role}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                         <div className="flex items-center gap-1 text-sm font-medium text-white">
                           <Trophy className="w-4 h-4 text-yellow-500" /> Rep {team.reputation}
                         </div>
                         <Link to={`/workspace/${team.id}`} className="text-sm font-medium bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors active:scale-95">
                           View Workspace
                         </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-16 flex flex-col items-center justify-center text-center p-6 border border-white/5 bg-white/[0.01] rounded-3xl">
                    <Users className="w-12 h-12 text-gray-600 mb-4" />
                    <h4 className="text-lg font-medium text-white mb-2">No active teams found</h4>
                    <p className="text-sm text-gray-400 font-light max-w-sm mb-6 font-display">Create your own team workspace to collaborate and invite other builders from the platform!</p>
                    <button
                      onClick={() => {
                        if (!token) navigate("/login");
                        else setShowCreateModal(true);
                      }}
                      className="px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      Create A Team
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* --- STARTUP BUILDER --- */}
        {activeTab === "Startups" && (
           <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <div className="lg:col-span-2 space-y-6">
                 <div className="flex items-center justify-between mb-4">
                   <h2 className="text-2xl font-display font-medium text-white">Startup Incubator</h2>
                 </div>
                 
                 <div className="p-8 rounded-3xl border border-white/10 bg-white/[0.02] relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 blur-[80px] rounded-full pointer-events-none" />
                   <h3 className="text-3xl font-display font-medium text-white mb-4 relative z-10">Got a unicorn idea?</h3>
                   <p className="text-gray-400 font-light mb-8 max-w-lg relative z-10 text-lg">
                     Post your idea, validate it with the community, and recruit top student engineers and designers to build your MVP.
                   </p>
                   <button className="bg-white text-black px-6 py-3 rounded-xl font-medium hover:bg-gray-100 transition-colors shadow-lg relative z-10 flex items-center">
                     <Rocket className="w-5 h-5 mr-2" /> Launch a Startup
                   </button>
                 </div>

                 <h3 className="text-xl font-display font-medium text-white pt-6">Trending Startups Hiring Open Roles</h3>
                 <div className="space-y-4">
                    {teams.filter(t => t.type.includes('Startup')).map(team => (
                      <div key={team.id} className="p-6 rounded-2xl border border-white/10 bg-white/[0.01] hover:bg-white/[0.03] transition-colors flex flex-col md:flex-row gap-6 items-start md:items-center cursor-pointer">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-500 to-rose-600 flex items-center justify-center text-white font-bold text-2xl shrink-0 shadow-lg">
                          {team.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-medium text-white flex items-center gap-2">
                             {team.name}
                             <span className="px-2 py-0.5 rounded border border-orange-500/20 bg-orange-500/10 text-[10px] text-orange-400 uppercase tracking-wider">{team.stage}</span>
                          </h4>
                          <p className="text-sm text-gray-400 font-light my-1 max-w-2xl truncate">{team.description}</p>
                          <div className="flex items-center gap-4 text-xs font-light mt-3">
                             <span className="text-emerald-400 font-medium">Looking for: {team.rolesNeeded.join(", ")}</span>
                             <span className="text-gray-500 flex items-center"><Users className="w-3.5 h-3.5 mr-1"/> {team.membersCount} Cofounders</span>
                          </div>
                        </div>
                        <button className="shrink-0 w-full md:w-auto px-6 py-2 border border-white/10 text-white rounded-xl hover:bg-white/5 transition-colors text-sm font-medium">
                          Apply
                        </button>
                      </div>
                    ))}
                 </div>
               </div>

               <div className="space-y-6">
                 {/* Stages card */}
                 <div className="p-6 rounded-3xl border border-white/10 bg-white/[0.02]">
                   <h3 className="font-display font-medium text-white mb-6">Build Stages</h3>
                   <div className="space-y-6 relative before:absolute before:inset-y-2 before:left-[11px] before:w-px before:bg-white/10">
                     {[
                       { stage: "Ideation", sub: "Validate & plan", active: true },
                       { stage: "MVP Builder", sub: "Recruit & code", active: false },
                       { stage: "Launch", sub: "Ship to users", active: false },
                       { stage: "Growth", sub: "Scale & iterate", active: false }
                     ].map((s, i) => (
                       <div key={i} className="flex gap-4 relative z-10">
                         <div className={cn("w-6 h-6 rounded-full flex items-center justify-center border-2 shrink-0 bg-gray-950", s.active ? "border-orange-500" : "border-white/10")}>
                           {s.active && <div className="w-2 h-2 bg-orange-500 rounded-full" />}
                         </div>
                         <div className="-mt-1">
                           <p className={cn("font-medium text-sm", s.active ? "text-orange-400" : "text-gray-400")}>{s.stage}</p>
                           <p className="text-xs text-gray-500 font-light">{s.sub}</p>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
               </div>
             </div>
           </motion.div>
        )}

        {/* --- WORKSPACE PREVIEW --- */}
        {activeTab === "Workspace" && (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
             <div className="text-center mb-12">
               <h2 className="text-3xl font-display font-medium text-white mb-4">Inside the Team Workspace</h2>
               <p className="text-gray-400 font-light max-w-2xl mx-auto">Once your team is formed, you unlock a powerful suite of collaboration tools designed specifically for student builders.</p>
             </div>

             {/* Mock Dashboard */}
             <div className="rounded-2xl border border-white/10 bg-gray-900 shadow-2xl overflow-hidden flex flex-col md:flex-row h-[600px]">
               {/* Sidebar */}
               <div className="w-64 border-r border-white/10 bg-black/20 p-4 hidden md:block">
                 <div className="flex items-center gap-3 mb-8 px-2">
                   <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold">N</div>
                   <span className="font-medium text-white">Nexus AI</span>
                 </div>
                 <div className="space-y-1 text-sm font-medium">
                   <div className="px-3 py-2 rounded-lg bg-white/10 text-white flex items-center"><Target className="w-4 h-4 mr-3 text-blue-400"/> Dashboard</div>
                   <div className="px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 flex items-center"><CheckCircle2 className="w-4 h-4 mr-3"/> Tasks & Board</div>
                   <div className="px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 flex items-center"><MessagesSquare className="w-4 h-4 mr-3"/> Chat & Sync</div>
                   <div className="px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 flex items-center"><FileText className="w-4 h-4 mr-3"/> Files & Docs</div>
                   <div className="px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 flex items-center"><LineChart className="w-4 h-4 mr-3"/> Roadmap</div>
                 </div>
               </div>
               {/* Content */}
               <div className="flex-1 p-8 bg-gray-950/50 flex flex-col">
                 <div className="flex justify-between items-center mb-8">
                   <h3 className="text-xl font-medium text-white">Project Overview</h3>
                   <div className="flex -space-x-2">
                     <div className="w-8 h-8 rounded-full border-2 border-gray-900 bg-emerald-500"></div>
                     <div className="w-8 h-8 rounded-full border-2 border-gray-900 bg-blue-500"></div>
                     <div className="w-8 h-8 rounded-full border-2 border-gray-900 bg-purple-500 shrink-0 flex items-center justify-center text-xs">3</div>
                   </div>
                 </div>
                 <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                      <p className="text-sm text-gray-400 mb-1">MVP Progress</p>
                      <p className="text-2xl font-medium text-white">68%</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                      <p className="text-sm text-gray-400 mb-1">Tasks Done</p>
                      <p className="text-2xl font-medium text-white">24</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                      <p className="text-sm text-gray-400 mb-1">Next Milestone</p>
                      <p className="text-xl font-medium text-white">Auth API</p>
                    </div>
                 </div>
                 <div className="flex-1 rounded-xl border border-white/5 bg-black/40 overflow-hidden flex flex-col">
                   <div className="border-b border-white/5 p-4 flex items-center justify-between bg-white/[0.02]">
                     <span className="font-medium text-sm text-white">Kanban Board</span>
                     <button className="text-xs bg-white text-black px-3 py-1.5 rounded-md font-medium">New Task</button>
                   </div>
                   <div className="flex-1 p-4 flex gap-4 overflow-x-auto">
                     {/* Cols */}
                     {["To Do", "In Progress", "Done"].map((col, idx) => (
                       <div key={idx} className="flex-1 min-w-[200px] bg-white/[0.02] rounded-lg p-3">
                         <div className="text-xs font-medium text-gray-400 mb-3 ml-1">{col}</div>
                         {idx === 1 && (
                           <div className="bg-gray-800 p-3 rounded border border-white/10 shadow-sm mb-2">
                             <p className="text-sm font-medium text-white mb-2">Integrate Supabase</p>
                             <div className="flex items-center justify-between">
                               <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                               <span className="text-[10px] text-gray-500">Due tomorrow</span>
                             </div>
                           </div>
                         )}
                         {idx === 0 && (
                           <div className="bg-gray-800 p-3 rounded border border-white/10 shadow-sm mb-2">
                             <p className="text-sm font-medium text-white mb-2">Design UI Kit</p>
                             <div className="flex items-center justify-between">
                               <div className="w-4 h-4 rounded-full bg-emerald-500"></div>
                             </div>
                           </div>
                         )}
                       </div>
                     ))}
                   </div>
                 </div>
               </div>
             </div>
          </motion.div>
        )}
        
        {/* Placeholder for other tabs */}
        {(activeTab === "Hackathons" || activeTab === "Roles") && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-32 text-center">
            <LayoutTemplate className="w-16 h-16 text-gray-700 mb-6" />
            <h3 className="text-2xl font-display font-medium text-white mb-2">Coming Soon</h3>
            <p className="text-gray-400 max-w-md font-light">We are finalizing the exact workflows for the {activeTab} section. Check back later to form your ultimate specialized teams.</p>
          </motion.div>
        )}

      </div>

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-gray-900 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />
            
            <div className="mb-6">
              <h3 className="text-2xl font-display font-medium text-white mb-2">Create a New Team</h3>
              <p className="text-gray-400 font-light text-sm">Start a startup workspace, hackathon team, or builder group.</p>
            </div>

            <form onSubmit={handleCreateTeam} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Team / Startup Name</label>
                <input
                  type="text"
                  required
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-blue-500/50 focus:bg-blue-500/5 transition-all font-light"
                  placeholder="e.g. Nexus AI, Campus Commute"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Team Description</label>
                <textarea
                  required
                  rows={4}
                  value={newTeamDesc}
                  onChange={(e) => setNewTeamDesc(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-blue-500/50 focus:bg-blue-500/5 transition-all resize-none font-light"
                  placeholder="Describe your vision, target milestones, and what roles you want to fill..."
                />
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 h-12 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="flex-1 h-12 rounded-xl bg-white text-black font-semibold text-sm hover:bg-gray-100 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center cursor-pointer"
                >
                  {createLoading ? (
                    <div className="w-5 h-5 rounded-full border-2 border-black/20 border-t-black animate-spin" />
                  ) : (
                    "Create Workspace"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
