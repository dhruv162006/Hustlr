import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  CheckCircle2, Clock, IndianRupee, Star, TrendingUp, ArrowRight,
  Briefcase, MessageSquare, Bell, Zap, Calendar, Activity,
  Target, Award, Search, Hash, ChevronRight, UserPlus, FileText,
  MapPin, GraduationCap, X, Plus, ShieldAlert
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/src/lib/utils";
import { useAuth } from "../context/AuthContext";

export function Dashboard() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState({
    activeProjects: 0,
    activeTeams: 0,
    pendingApps: 0,
    earnings: "₹0",
    reputation: 5.00,
    profileViews: 0,
    unreadMessages: 0,
  });
  const [todayFocus, setTodayFocus] = useState<any[]>([]);
  const [activeProjects, setActiveProjects] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    // Fetch Stats
    fetch("/api/dashboard/stats", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (data && !data.error) {
          setStats(data);
        }
      })
      .catch(err => console.error("Error fetching stats", err));

    // Fetch Today's Focus
    fetch("/api/dashboard/today-focus", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTodayFocus(data);
        }
      })
      .catch(err => console.error("Error fetching focus tasks", err));

    // Fetch Active Projects from /api/teams
    fetch("/api/teams", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setActiveProjects(data.map(t => ({
            name: t.name,
            progress: t.status === "completed" ? 100 : t.status === "in progress" ? 65 : 15,
            team: t.membersCount,
            role: t.role,
          })));
        }
      })
      .catch(err => console.error("Error fetching teams", err));

    // Fetch Application Pipeline
    fetch("/api/opportunities/pipeline", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setApplications(data.map(app => {
            const statusMap: any = {
              APPLIED: { status: "Applied", color: "text-gray-400", bg: "bg-white/5", border: "border-white/10" },
              SHORTLISTED: { status: "Shortlisted", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
              INTERVIEWING: { status: "Interviewing", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
              ACCEPTED: { status: "Accepted", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
              REJECTED: { status: "Rejected", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
            };
            const meta = statusMap[app.status] || statusMap.APPLIED;
            return {
              role: app.title,
              company: app.clientName,
              status: meta.status,
              color: meta.color,
              bg: meta.bg,
              border: meta.border,
            };
          }));
        }
      })
      .catch(err => console.error("Error fetching pipeline", err));

    // Fetch Chats for Messages list
    fetch("/api/messages/chats", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setRecentMessages(data.slice(0, 3).map(chat => ({
            name: chat.name,
            text: chat.lastMessage,
            time: chat.lastMessageTime || "now",
            unread: chat.unread > 0,
          })));
        }
      })
      .catch(err => console.error("Error fetching chats", err))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="bg-gray-950 min-h-screen text-gray-200 pb-20 pt-24">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* --- TOP HEADER SECTON --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl md:text-4xl font-display font-medium text-white tracking-tight">
                Good evening, {user ? user.name.split(" ")[0] : "Builder"}.
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Available for Freelance
              </span>
            </div>
            <p className="text-gray-400 font-light flex items-center gap-2">
              You have <span className="text-white font-medium">{stats.activeProjects} active projects</span>, <span className="text-white font-medium">{stats.pendingApps} pending applications</span>, and <span className="text-white font-medium">{stats.unreadMessages} unread messages</span>.
            </p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
             {user?.role === "ADMIN" && (
               <Link to="/admin" className="hidden lg:flex h-11 px-5 bg-purple-500/10 border border-purple-500/20 text-purple-400 font-semibold rounded-xl hover:bg-purple-500/20 transition-colors flex items-center justify-center">
                 <ShieldAlert className="w-4 h-4 mr-2" /> Admin Root
               </Link>
             )}
             <button className="flex-1 md:flex-none h-11 px-5 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 transition-colors shadow-lg shadow-white/5 flex items-center justify-center">
               <Plus className="w-4 h-4 mr-2" /> Quick Action
             </button>
             <button className="h-11 w-11 bg-white/[0.02] border border-white/10 text-gray-400 rounded-xl hover:bg-white/10 hover:text-white transition-colors flex items-center justify-center shrink-0 relative">
               <Bell className="w-5 h-5" />
               {stats.unreadMessages > 0 && (
                 <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-blue-500 border-2 border-gray-900" />
               )}
             </button>
          </div>
        </div>

        {/* --- COMMAND CENTER METRICS OVERVIEW --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-10">
           {[
             { label: "Active Projects", value: stats.activeProjects.toString(), icon: Briefcase, color: "text-blue-400", bg: "bg-blue-500/10" },
             { label: "Active Teams", value: stats.activeTeams.toString(), icon: Hash, color: "text-purple-400", bg: "bg-purple-500/10" },
             { label: "Pending Apps", value: stats.pendingApps.toString(), icon: FileText, color: "text-orange-400", bg: "bg-orange-500/10" },
             { label: "Earnings", value: stats.earnings, icon: IndianRupee, color: "text-emerald-400", bg: "bg-emerald-500/10" },
             { label: "Reputation", value: stats.reputation.toFixed(2), icon: Star, color: "text-yellow-400", bg: "bg-yellow-500/10" },
             { label: "Profile Views", value: stats.profileViews >= 1000 ? `${(stats.profileViews/1000).toFixed(1)}k` : stats.profileViews.toString(), icon: Activity, color: "text-rose-400", bg: "bg-rose-500/10" }
           ].map((stat, i) => (
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
               key={stat.label} 
               className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors flex flex-col justify-center"
             >
               <div className="flex items-center justify-between pl-1 mb-3">
                 <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", stat.bg)}>
                   <stat.icon className={cn("w-4 h-4", stat.color)} />
                 </div>
               </div>
               <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider pl-1 mb-0.5">{stat.label}</p>
               <p className="text-2xl font-display font-medium text-white pl-1">{stat.value}</p>
             </motion.div>
           ))}
        </div>

        {/* ONBOARDING CHECKLIST */}
        <div className="bg-gradient-to-r from-blue-900/10 via-indigo-900/10 to-purple-900/10 rounded-3xl border border-white/5 p-6 mb-8 flex flex-col lg:flex-row items-center gap-6 justify-between">
          <div className="flex-1">
            <h3 className="text-white font-display font-medium text-lg mb-1">Welcome to your Command Center</h3>
            <p className="text-gray-400 text-sm font-light">Complete these steps to unlock your full potential and increase your visibility to premium clients and top-tier startup teams.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
             {[
                { title: "Complete Profile", done: true },
                { title: "Add Skills", done: true },
                { title: "Upload Projects", done: false },
                { title: "Join Team", done: false },
                { title: "Apply to Gig", done: false }
             ].map((step, i) => (
               <div key={i} className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border", step.done ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-white/5 border-white/10 text-gray-400")}>
                  {step.done ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 rounded-full border border-gray-500" />}
                  {step.title}
               </div>
             ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: 8 cols */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* TODAY'S FOCUS */}
            <div className="bg-white/[0.01] rounded-3xl border border-white/5 overflow-hidden">
               <div className="p-6 border-b border-white/5 flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                     <Target className="w-4 h-4 text-orange-500" />
                   </div>
                   <h2 className="font-display font-medium text-white text-lg">Today's Focus</h2>
                 </div>
                 <button className="text-xs font-medium text-gray-400 hover:text-white">View Calendar</button>
               </div>
               <div className="p-2 space-y-1">
                 {todayFocus.length > 0 ? (
                   todayFocus.map((item, i) => (
                     <div key={i} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-white/[0.02] transition-colors cursor-pointer group">
                        <div className="mt-0.5 shrink-0">
                          {item.type === 'task' ? <div className="w-5 h-5 rounded border-2 border-white/20 group-hover:border-blue-500 transition-colors" /> :
                           item.type === 'meeting' ? <Calendar className="w-5 h-5 text-blue-400" /> :
                           <Zap className="w-5 h-5 text-yellow-500" />}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                          <div>
                            <p className="text-sm font-medium text-gray-200">{item.title}</p>
                            <p className="text-xs text-gray-500 font-light mt-0.5">{item.context}</p>
                          </div>
                          <span className={cn(
                            "px-2.5 py-1 rounded border text-[10px] font-medium whitespace-nowrap w-fit",
                            item.time.includes("Today") || item.type === "meeting" ? "bg-red-500/10 border-red-500/20 text-red-400" :
                            item.time.includes("Suggest") ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400" :
                            "bg-white/5 border-white/10 text-gray-400"
                          )}>
                            {item.time}
                          </span>
                        </div>
                     </div>
                   ))
                 ) : (
                   <div className="py-12 flex flex-col items-center justify-center text-center p-4">
                     <CheckCircle2 className="w-8 h-8 text-emerald-500/20 mb-2" />
                     <p className="text-xs text-gray-400 font-light">All caught up for today!</p>
                   </div>
                 )}
               </div>
            </div>

            {/* AI ASSISTANT BANNER */}
            <div className="rounded-3xl border border-blue-500/20 bg-gradient-to-r from-blue-900/20 to-[#0B0F19] p-6 sm:p-8 relative overflow-hidden flex flex-col md:flex-row items-center gap-6">
              <div className="absolute -left-32 -top-32 w-64 h-64 bg-blue-500/20 blur-[100px] pointer-events-none rounded-full" />
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1 min-w-0 text-center md:text-left z-10">
                <h3 className="text-lg font-display font-medium text-white mb-1">AI Career Assistant</h3>
                <p className="text-sm text-gray-400 font-light leading-relaxed mb-4 max-w-xl">
                  Based on your recent activity with React and Node.js, you have an 88% match for a new <strong className="text-gray-300 font-medium">Senior Frontend Gig</strong> posted 2 hours ago.
                </p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20">
                    Review Match
                  </button>
                  <button className="px-4 py-2 bg-white/5 border border-white/10 text-white text-sm font-medium rounded-xl hover:bg-white/10 transition-colors">
                    View More Insights
                  </button>
                </div>
              </div>
            </div>

            {/* ANALYTICS SECTION */}
            <div className="bg-white/[0.01] rounded-3xl border border-white/5 overflow-hidden">
               <div className="p-6 border-b border-white/5 flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <Activity className="w-4 h-4 text-emerald-400" />
                   <h2 className="font-display font-medium text-white text-lg">Performance Insights</h2>
                 </div>
                 <div className="flex items-center gap-2 text-xs font-medium bg-white/5 rounded-lg p-1">
                   <button className="px-3 py-1.5 rounded-md bg-white/10 text-white">This Week</button>
                   <button className="px-3 py-1.5 rounded-md text-gray-400 hover:text-white">This Month</button>
                 </div>
               </div>
               <div className="p-6">
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                   {[
                     { label: "Profile Views", value: "342", trend: "+12%" },
                     { label: "Search Appearances", value: "89", trend: "+5%" },
                     { label: "Invite Rate", value: "12%", trend: "+2%" },
                     { label: "Portfolio Clicks", value: "45", trend: "-1%" }
                   ].map((stat, i) => (
                     <div key={i}>
                       <p className="text-[10px] uppercase tracking-wider text-gray-500 font-medium mb-1">{stat.label}</p>
                       <div className="flex items-end gap-2">
                         <span className="text-2xl font-display font-medium text-white">{stat.value}</span>
                         <span className={cn("text-xs font-medium mb-1", stat.trend.startsWith('+') ? "text-emerald-400" : "text-rose-400")}>
                           {stat.trend}
                         </span>
                       </div>
                     </div>
                   ))}
                 </div>
                 <div className="h-40 w-full flex items-end justify-between gap-2 border-b border-white/5 pb-2">
                   {[40, 25, 60, 30, 85, 45, 90].map((h, i) => (
                     <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                       <div className="w-full relative flex items-end justify-center h-full">
                         <div className="w-full bg-blue-500/20 rounded-t-sm group-hover:bg-blue-500/40 transition-colors" style={{ height: `${h}%` }}>
                           <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500 rounded-t-sm" />
                         </div>
                       </div>
                       <span className="text-[10px] text-gray-500 uppercase">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</span>
                     </div>
                   ))}
                 </div>
               </div>
            </div>

            {/* TWO COLUMNS FOR PROJECTS & OPPORTUNITIES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               
               {/* Active Projects */}
               <div className="bg-white/[0.01] rounded-3xl border border-white/5 overflow-hidden flex flex-col">
                 <div className="p-6 border-b border-white/5 flex items-center justify-between">
                   <h3 className="font-display font-medium text-white">Active Projects</h3>
                   <Link to="/workspace/nexus" className="text-xs font-medium text-blue-400 hover:text-blue-300">View Board</Link>
                 </div>
                 <div className="p-4 flex-1 space-y-3">
                    {activeProjects.length > 0 ? (
                      activeProjects.map((p, i) => (
                        <Link to={`/workspace/${p.id || '1'}`} key={i} className="block p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-colors cursor-pointer">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="text-sm font-medium text-white mb-1 group-hover:text-blue-400 transition-colors">{p.name}</h4>
                              <span className="text-[10px] text-gray-400 uppercase tracking-wider">{p.role}</span>
                            </div>
                            <div className="flex -space-x-2">
                              {[...Array(p.team || 2)].map((_, j) => (
                                <div key={j} className="w-6 h-6 rounded-full border border-gray-900 bg-gray-600 flex items-center justify-center text-[8px] font-bold text-white">U</div>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                            <span>Progress</span>
                            <span className="text-emerald-400 font-medium">{p.progress}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${p.progress}%` }} />
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="py-10 flex flex-col items-center justify-center text-center p-4">
                        <Briefcase className="w-8 h-8 text-gray-600 mb-2" />
                        <p className="text-xs text-gray-400 font-light">No active project teams.</p>
                        <Link to="/team-hub" className="text-xs text-blue-400 mt-2 hover:underline">Form a Team</Link>
                      </div>
                    )}
                  </div>
                </div>

                {/* Opportunity Tracker */}
                <div className="bg-white/[0.01] rounded-3xl border border-white/5 overflow-hidden flex flex-col">
                  <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <h3 className="font-display font-medium text-white">Application Pipeline</h3>
                    <Link to="/marketplace" className="text-xs font-medium text-blue-400 hover:text-blue-300">Browse</Link>
                  </div>
                  <div className="p-4 flex-1 space-y-3">
                    {applications.length > 0 ? (
                      applications.map((opp, i) => (
                        <div key={i} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                           <div>
                             <h4 className="text-sm font-medium text-white mb-1 truncate max-w-[140px] sm:max-w-xs">{opp.role}</h4>
                             <p className="text-xs text-gray-500">{opp.company}</p>
                           </div>
                           <span className={cn("px-2 py-1 rounded border text-[10px] font-medium shrink-0", opp.bg, opp.color, opp.border)}>
                             {opp.status}
                           </span>
                        </div>
                      ))
                    ) : (
                      <div className="py-10 flex flex-col items-center justify-center text-center p-4">
                        <FileText className="w-8 h-8 text-gray-600 mb-2" />
                        <p className="text-xs text-gray-400 font-light">No opportunities applied to yet.</p>
                        <Link to="/marketplace" className="text-xs text-blue-400 mt-2 hover:underline">Apply to Gigs</Link>
                      </div>
                    )}
                  </div>
                </div>

             </div>
           </div>

           {/* RIGHT COLUMN: 4 cols */}
           <div className="lg:col-span-4 space-y-8">
              
              {/* REPUTATION CENTER */}
              <div className="rounded-3xl border border-yellow-500/20 bg-gradient-to-b from-yellow-500/5 to-transparent overflow-hidden">
                <div className="p-6 flex flex-col items-center">
                  <div className="w-16 h-16 flex items-center justify-center mb-4">
                    <Award className="w-12 h-12 text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
                  </div>
                  <div className="text-3xl font-display font-medium text-white mb-1">{stats.reputation.toFixed(2)}</div>
                  <div className="flex items-center gap-1.5 text-xs text-yellow-500 font-medium mb-6 bg-yellow-500/10 px-3 py-1 rounded-full">
                    <TrendingUp className="w-3.5 h-3.5" /> Top 2% of freelancers
                  </div>
                  
                  <div className="w-full space-y-3">
                    <div>
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Reliability</span>
                        <span className="text-gray-200">98%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full"><div className="h-full bg-yellow-500 rounded-full w-[98%]" /></div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Communication</span>
                        <span className="text-gray-200">100%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full"><div className="h-full bg-yellow-500 rounded-full w-[100%]" /></div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Skill Match</span>
                        <span className="text-gray-200">92%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full"><div className="h-full bg-yellow-500 rounded-full w-[92%]" /></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* UNREAD MESSAGES */}
              <div className="bg-white/[0.01] rounded-3xl border border-white/5 overflow-hidden">
                <div className="p-5 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-gray-400" />
                    <h3 className="font-display font-medium text-white">Recent Messages</h3>
                  </div>
                  <Link to="/messages" className="text-xs font-medium text-blue-400 hover:text-blue-300">Open App</Link>
                </div>
                <div className="p-2">
                   {recentMessages.length > 0 ? (
                     recentMessages.map((msg, i) => (
                      <Link to="/messages" key={i} className="flex flex-col gap-1 p-3 rounded-2xl hover:bg-white/[0.03] transition-colors group">
                        <div className="flex justify-between items-center">
                          <span className={cn("text-sm max-w-[150px] truncate", msg.unread ? "font-medium text-white" : "font-light text-gray-300")}>{msg.name}</span>
                          <span className="text-[10px] text-gray-500">{msg.time}</span>
                        </div>
                        <p className={cn("text-xs truncate font-light", msg.unread ? "text-gray-300" : "text-gray-500")}>
                          {msg.text}
                        </p>
                      </Link>
                    ))
                   ) : (
                     <div className="py-8 flex flex-col items-center justify-center text-center p-4">
                       <MessageSquare className="w-8 h-8 text-gray-600 mb-2" />
                       <p className="text-xs text-gray-500 font-light">No recent messages.</p>
                     </div>
                   )}
                 </div>
             </div>

             {/* ACTIVITY TIMELINE */}
             <div className="bg-white/[0.01] rounded-3xl border border-white/5 overflow-hidden p-6 hidden md:block">
               <h3 className="font-display font-medium text-white mb-6">Activity Timeline</h3>
               <div className="space-y-6 relative before:absolute before:inset-y-2 before:left-[11px] before:w-px before:bg-white/10">
                 {[
                   { title: "Gig Accepted", desc: "FinTech Dashboard Analytics", time: "2 hours ago", color: "bg-blue-500" },
                   { title: "Review Received", desc: "5 stars from Priya Patel", time: "Yesterday", color: "bg-yellow-500" },
                   { title: "Team Joined", desc: "Nexus AI Startup", time: "3 days ago", color: "bg-purple-500" }
                 ].map((activity, i) => (
                   <div key={i} className="flex gap-4 relative z-10">
                     <div className={cn("w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-gray-950 border-4 border-gray-950 ring-1 ring-white/10", activity.color)} />
                     <div className="-mt-1">
                       <p className="font-medium text-sm text-gray-200">{activity.title}</p>
                       <p className="text-xs text-gray-500 font-light mt-0.5 mb-1">{activity.desc}</p>
                       <span className="text-[10px] text-gray-600 font-medium uppercase tracking-wider">{activity.time}</span>
                     </div>
                   </div>
                 ))}
               </div>
             </div>

             {/* GOALS & MILESTONES */}
             <div className="bg-white/[0.01] rounded-3xl border border-white/5 overflow-hidden">
               <div className="p-5 border-b border-white/5 flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <Target className="w-4 h-4 text-gray-400" />
                   <h3 className="font-display font-medium text-white">Goals</h3>
                 </div>
                 <button className="text-xs font-medium text-blue-400 hover:text-blue-300">Edit</button>
               </div>
               <div className="p-5 space-y-5">
                 {[
                   { title: "Earn ₹1,00,000 this month", current: 42000, target: 100000, prefix: "₹" },
                   { title: "Complete 10 projects", current: 7, target: 10, prefix: "" }
                 ].map((goal, i) => {
                   const percentage = Math.min(100, Math.round((goal.current / goal.target) * 100));
                   return (
                     <div key={i}>
                       <div className="flex justify-between text-sm mb-1.5">
                         <span className="text-white font-medium">{goal.title}</span>
                         <span className="text-gray-400 font-light text-xs">
                           {goal.prefix}{goal.current} / {goal.prefix}{goal.target}
                         </span>
                       </div>
                       <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                         <div className="h-full bg-blue-500 rounded-full relative" style={{ width: `${percentage}%` }}>
                           <div className="absolute top-0 right-0 bottom-0 w-4 bg-gradient-to-l from-white/20 to-transparent" />
                         </div>
                       </div>
                     </div>
                   );
                 })}
               </div>
             </div>

             {/* EARNINGS SUMMARY */}
             <div className="bg-white/[0.01] rounded-3xl border border-white/5 overflow-hidden p-6 hidden lg:block">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-emerald-400" />
                    <h3 className="font-display font-medium text-white">Earnings</h3>
                  </div>
                  <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">+12%</span>
                </div>
                <div className="flex items-baseline gap-2 mb-6">
                   <h2 className="text-4xl font-display font-medium text-white">₹42,500</h2>
                   <span className="text-sm text-gray-500">this month</span>
                </div>
                <div className="space-y-4">
                   <div className="flex justify-between items-center">
                     <span className="text-sm font-light text-gray-400">Available</span>
                     <span className="text-sm font-medium text-white">₹12,500</span>
                   </div>
                   <div className="flex justify-between items-center">
                     <span className="text-sm font-light text-gray-400">Pending</span>
                     <span className="text-sm font-medium text-white">₹8,000</span>
                   </div>
                   <div className="flex justify-between items-center">
                     <span className="text-sm font-light text-gray-400">Withdrawn</span>
                     <span className="text-sm font-medium text-white">₹22,000</span>
                   </div>
                </div>
                <div className="mt-6 pt-6 border-t border-white/5">
                   <button className="w-full h-10 rounded-xl bg-white/5 text-sm font-medium text-white hover:bg-white/10 transition-colors">
                     Withdraw Funds
                   </button>
                </div>
             </div>

          </div>
        </div>

      </div>
    </div>
  );
}
