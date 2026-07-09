import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, Filter, Sparkles, MapPin, Users, ChevronRight, 
  Bookmark, Briefcase, Zap, ChevronDown, CheckCircle2,
  X, Star, Code, Layout, Brain, LineChart, Trophy, Terminal,
  MessageSquare, UserPlus, ExternalLink, Activity
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Link } from "react-router-dom";

// --- Mock Data ---
interface TalentProfile {
  id: string;
  name: string;
  role: string;
  university: string;
  skills: string[];
  reputation: number;
  projectsCompleted: number;
  availability: 'Available Now' | 'Open to Projects' | 'Internship' | 'Busy';
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  badges: string[];
  matchScore?: number;
  bio: string;
  avatarGradient: string;
  username?: string;
}

export function TalentDirectory() {
  const [talents, setTalents] = useState<TalentProfile[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [filterAvailability, setFilterAvailability] = useState("All");
  const [selectedProfile, setSelectedProfile] = useState<TalentProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchTalents = () => {
    setLoading(true);
    setError("");
    const query = new URLSearchParams();
    if (activeCategory !== "All") query.set("category", activeCategory);
    if (filterRole !== "All") query.set("role", filterRole);
    if (filterAvailability !== "All") query.set("availability", filterAvailability);

    fetch(`/api/profile/talents?${query.toString()}`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) {
          throw new Error(data.error || "Failed to load talents");
        }
        return data;
      })
      .then((data) => {
        if (Array.isArray(data)) {
          const formatted: TalentProfile[] = data.map((t: any) => ({
            id: t.id,
            name: t.name,
            role: t.headline || "Developer",
            university: t.university || "University",
            skills: t.skills || [],
            reputation: t.reputation || 4.9,
            projectsCompleted: t.projectsCount || 5,
            availability: (t.availability === "AVAILABLE_NOW" ? "Available Now" :
                           t.availability === "OPEN_TO_PROJECTS" ? "Open to Projects" :
                           t.availability === "LOOKING_FOR_INTERNSHIP" ? "Internship" : "Busy") as any,
            level: (t.level || "Advanced") as any,
            badges: t.badges || [],
            bio: t.bio || "",
            avatarGradient: t.avatarGradient || "from-blue-600 to-indigo-600",
            username: t.username
          }));
          setTalents(formatted);
        }
      })
      .catch((err: any) => {
        setError(err.message || "Failed to query campus talent directory.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTalents();
  }, [activeCategory, filterAvailability, filterRole]);

  const categories = [
    { name: "All", icon: Users },
    { name: "Developers", icon: Code },
    { name: "Designers", icon: Layout },
    { name: "AI/ML", icon: Brain },
    { name: "Product", icon: LineChart },
  ];

  const featuresStats = [
    { label: "Active Students", value: "10,000+" },
    { label: "Verified Freelancers", value: "2,500+" },
    { label: "Completed Projects", value: "1,000+" },
  ];

  const filteredTalents = talents.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          t.role.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = activeCategory === "All" || 
                           (activeCategory === "Developers" && t.role.includes("Developer")) ||
                           (activeCategory === "Designers" && t.role.includes("Designer")) ||
                           (activeCategory === "AI/ML" && t.role.includes("AI")) ||
                           (activeCategory === "Product" && t.role.includes("Product"));

    const matchesRole = filterRole === "All" || t.role.includes(filterRole);
    const matchesAvailability = filterAvailability === "All" || t.availability === filterAvailability;

    return matchesSearch && matchesCategory && matchesRole && matchesAvailability;
  });

  return (
    <div className="bg-gray-950 min-h-screen text-gray-200">
      
      {/* --- HERO SECTION --- */}
      <section className="relative pt-24 pb-16 px-4 md:pt-32 md:pb-24 border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.03)_0%,transparent_60%)]" />
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center text-center">
          
          <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-emerald-400 mb-6 backdrop-blur-md">
             <Users className="w-3.5 h-3.5 mr-1.5 fill-emerald-400/20" />
             The Premier Campus Talent Network
          </div>

          <h1 className="text-5xl md:text-7xl font-display font-medium text-white mb-6 tracking-tight">
            Find the perfect <br className="hidden md:block"/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">builder for your vision.</span>
          </h1>
          <p className="border-t border-white/10 text-xl md:text-2xl font-light tracking-wide text-gray-400 max-w-2xl mx-auto mb-10 pt-6">
            Discover top-tier developers, designers, and creators from the world's best universities.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mb-12">
            {featuresStats.map((stat, i) => (
              <div key={i} className="flex flex-col items-center">
                <span className="text-3xl font-display font-medium text-white">{stat.value}</span>
                <span className="text-sm text-gray-500 font-light">{stat.label}</span>
              </div>
            ))}
          </div>

          {/* Smart Search */}
          <form onSubmit={(e) => { e.preventDefault(); fetchTalents(); }} className="w-full max-w-3xl mx-auto relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-50" />
            <div className="relative flex items-center bg-gray-900/80 border border-white/10 backdrop-blur-xl rounded-2xl p-2 shadow-2xl">
               <div className="pl-4 pr-2">
                  <Search className="w-6 h-6 text-gray-500" />
               </div>
               <input
                 type="text"
                 placeholder="Search by role, skill, college, or name..."
                 className="flex-1 bg-transparent border-none text-white focus:outline-none placeholder:text-gray-600 text-lg py-3 w-full font-light"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
               />
               <button type="submit" className="bg-white text-black px-8 py-3.5 rounded-xl font-medium transition-transform active:scale-95 hover:bg-gray-100 hidden sm:block">
                 Find Talent
               </button>
            </div>
          </form>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-12 flex flex-col xl:flex-row gap-8">
        
        {/* --- LEFT SIDEBAR: FILTERS --- */}
        <aside className="hidden xl:block w-64 shrink-0 space-y-8">
          <div>
            <h3 className="text-lg font-display font-medium text-white mb-4">Availability</h3>
            <div className="space-y-2">
              {["All", "Available Now", "Open to Projects", "Internship", "Busy"].map(type => (
                <label key={type} className="flex items-center gap-3 group cursor-pointer">
                  <div className={cn(
                    "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                    filterAvailability === type ? "bg-white border-white text-black" : "border-white/20 bg-white/5 group-hover:border-white/40"
                  )}>
                    {filterAvailability === type && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                  <span className={cn("text-sm font-light transition-colors", filterAvailability === type ? "text-white" : "text-gray-400 group-hover:text-gray-300")}>
                    {type}
                  </span>
                  <input type="radio" className="hidden" checked={filterAvailability === type} onChange={() => setFilterAvailability(type)} />
                </label>
              ))}
            </div>
          </div>

          <div>
             <h3 className="text-lg font-display font-medium text-white mb-4">Experience Level</h3>
             <div className="space-y-2">
                {["All", "Beginner", "Intermediate", "Advanced"].map(level => (
                  <label key={level} className="flex items-center gap-3 group cursor-pointer">
                    <div className="w-5 h-5 rounded border border-white/20 bg-white/5 flex items-center justify-center group-hover:border-white/40 transition-colors">
                      {/* Checkbox logic simplified for mockup */}
                    </div>
                    <span className="text-sm font-light text-gray-400 group-hover:text-gray-300">{level}</span>
                  </label>
                ))}
             </div>
          </div>
          
          <div className="p-4 rounded-2xl bg-gradient-to-b from-blue-500/10 to-transparent border border-blue-500/20">
             <div className="flex items-center gap-2 mb-2">
               <Sparkles className="w-4 h-4 text-blue-400" />
               <h4 className="font-medium text-white text-sm">Hiring for a startup?</h4>
             </div>
             <p className="text-xs text-gray-400 font-light mb-3">Let our AI match you with the perfect founding engineer or designer.</p>
             <button className="w-full py-2 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-lg hover:bg-blue-500/30 transition-colors">
               Try AI Match
             </button>
          </div>
        </aside>

        {/* --- MAIN CONTENT --- */}
        <main className="flex-1 min-w-0">
          
          {/* Categories Nav */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide mb-8 border-b border-white/5">
            {categories.map(cat => (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                className={cn(
                  "whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2",
                  activeCategory === cat.name 
                    ? "bg-white text-black" 
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                <cat.icon className="w-4 h-4" />
                {cat.name}
              </button>
            ))}
          </div>

          {/* AI Recommendations Banner (only show if no search/filter to keep it clean) */}
          {searchQuery === "" && activeCategory === "All" && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-10"
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <h3 className="font-display font-medium text-white text-lg">Perfect Matches for You</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {talents.filter(t => t.matchScore).slice(0, 2).map((match) => (
                  <div key={match.id} onClick={() => setSelectedProfile(match)} className="relative group cursor-pointer p-1 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 hover:from-emerald-500/40 hover:to-cyan-500/40 transition-all">
                    <div className="bg-gray-950 rounded-xl p-4 border border-white/10 flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-full bg-gradient-to-tr ${match.avatarGradient} flex items-center justify-center text-white font-display font-bold text-xl`}>
                        {match.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-white truncate">{match.name}</h4>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">{match.matchScore}% Match</span>
                        </div>
                        <p className="text-xs text-gray-400 truncate mb-2">{match.role} • {match.university}</p>
                        <div className="flex gap-1.5">
                          {match.skills.slice(0, 3).map(s => (
                            <span key={s} className="text-[10px] text-gray-300 bg-white/5 px-1.5 py-0.5 rounded border border-white/10">{s}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-medium text-white">
              {searchQuery ? "Search Results" : "Explore Talent"}
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-400">
               <span>Sort by:</span>
               <button className="flex items-center gap-1 font-medium text-white hover:text-gray-300">
                 Reputation <ChevronDown className="w-4 h-4" />
               </button>
            </div>
          </div>

          {/* Talent Grid */}
          {loading ? (
            <div className="py-20 flex justify-center w-full col-span-1 md:col-span-2">
              <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-emerald-400 animate-spin" />
            </div>
          ) : error ? (
            <div className="col-span-1 md:col-span-2 py-16 text-center border border-red-500/20 rounded-3xl bg-red-500/5 p-8 max-w-lg mx-auto w-full">
              <Zap className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-display font-medium text-white mb-2">Failed to load talent</h3>
              <p className="text-gray-400 font-light mb-6">{error}</p>
              <button 
                onClick={fetchTalents} 
                className="px-6 py-2.5 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 transition-colors"
              >
                Retry Query
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatePresence>
                {filteredTalents.map((talent) => (
                  <motion.div
                    key={talent.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => setSelectedProfile(talent)}
                    className="group flex flex-col p-6 rounded-3xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.04] hover:border-white/20 transition-all cursor-pointer relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-4">
                      <button className="text-gray-500 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors" onClick={(e) => { e.stopPropagation(); }}>
                        <Bookmark className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-16 h-16 rounded-full bg-gradient-to-tr ${talent.avatarGradient} flex items-center justify-center text-white font-display font-bold text-2xl shadow-lg`}>
                        {talent.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-lg font-display font-medium text-white group-hover:text-blue-400 transition-colors">
                          {talent.name}
                        </h3>
                        <p className="text-sm font-light text-gray-400 mb-1">{talent.role}</p>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-light">
                          <MapPin className="w-3 h-3" /> {talent.university}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {talent.badges.map(badge => (
                        <span key={badge} className="px-2 py-0.5 rounded-md bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[10px] uppercase font-bold tracking-wider">
                          {badge}
                        </span>
                      ))}
                      <span className={cn(
                        "px-2 py-0.5 rounded-md border text-[10px] uppercase font-bold tracking-wider",
                        talent.availability === 'Available Now' ? "bg-green-500/10 border-green-500/20 text-green-400" :
                        talent.availability === 'Open to Projects' ? "bg-blue-500/10 border-blue-500/20 text-blue-400" :
                        talent.availability === 'Internship' ? "bg-purple-500/10 border-purple-500/20 text-purple-400" :
                        "bg-gray-500/10 border-gray-500/20 text-gray-400"
                      )}>
                        {talent.availability}
                      </span>
                    </div>

                    <p className="text-sm text-gray-400 font-light line-clamp-2 mb-5 flex-1">
                      {talent.bio}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {talent.skills.slice(0, 4).map(skill => (
                        <span key={skill} className="px-2 py-1 rounded-lg bg-white/5 border border-white/5 text-gray-300 text-xs font-light">
                          {skill}
                        </span>
                      ))}
                      {talent.skills.length > 4 && (
                        <span className="px-2 py-1 rounded-lg bg-white/5 border border-white/5 text-gray-500 text-xs font-light">
                          +{talent.skills.length - 4}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                       <div className="flex items-center gap-4">
                         <div className="flex items-center gap-1 text-sm font-medium text-white">
                           <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /> {talent.reputation}
                         </div>
                         <div className="flex items-center gap-1 text-sm text-gray-400 font-light">
                           <Briefcase className="w-4 h-4 text-gray-500" /> {talent.projectsCompleted} Projects
                         </div>
                       </div>
                       <button className="text-sm font-medium text-white hover:text-blue-400 transition-colors">
                         View Profile
                       </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {filteredTalents.length === 0 && (
                <div className="col-span-1 md:col-span-2 text-center py-20 border border-white/10 border-dashed rounded-3xl bg-white/5">
                  <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-display font-medium text-white mb-2">No talent found</h3>
                  <p className="text-gray-500 font-light">Try adjusting your search criteria.</p>
                  <button 
                    onClick={() => { setSearchQuery(""); setFilterRole("All"); setFilterAvailability("All"); setActiveCategory("All"); }}
                    className="mt-6 text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          )}
        </main>

        {/* --- RIGHT SIDEBAR: LEADERBOARD & ACTIVITY --- */}
        <aside className="hidden 2xl:flex flex-col w-80 shrink-0 gap-8">
          
          {/* Top Talent Leaderboard */}
          <div className="p-6 rounded-3xl border border-white/10 bg-white/[0.02]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-medium text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" /> Leaderboard
              </h3>
              <button className="text-xs text-blue-400 hover:text-blue-300">View all</button>
            </div>
            
            <div className="space-y-4">
              {[
                { name: "Sneha R.", role: "AI Engineer", projects: 14, rank: 1 },
                { name: "Rahul V.", role: "Backend Developer", projects: 19, rank: 2 },
                { name: "Karan J.", role: "UI Designer", projects: 22, rank: 3 }
              ].map((t) => (
                <div key={t.rank} className="flex items-center gap-3 group cursor-pointer p-2 rounded-xl hover:bg-white/5 transition-colors">
                   <div className="w-6 text-center font-display font-bold text-gray-500 group-hover:text-white transition-colors">
                     #{t.rank}
                   </div>
                   <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-700 to-gray-800 border border-white/10 flex items-center justify-center shrink-0 text-white font-bold text-sm">
                     {t.name.charAt(0)}
                   </div>
                   <div className="flex-1 min-w-0">
                     <h4 className="text-sm font-medium text-gray-200 truncate group-hover:text-blue-400 transition-colors">{t.name}</h4>
                     <p className="text-xs text-gray-500 font-light truncate">{t.role}</p>
                   </div>
                   <div className="text-xs font-medium text-gray-400">
                     {t.projects} <span className="font-light text-gray-600">prs</span>
                   </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Ecosystem Feed */}
          <div className="p-6 rounded-3xl border border-white/10 bg-white/[0.02]">
            <div className="flex items-center gap-2 mb-6">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </div>
              <h3 className="font-display font-medium text-white">Live Activity</h3>
            </div>

            <div className="space-y-5 relative before:absolute before:inset-y-0 before:left-2.5 before:w-px before:bg-white/10">
              {[
                { time: "Just now", text: "Priya joined a new startup project", icon: Users, color: "text-blue-400", bg: "bg-blue-500/20" },
                { time: "15m ago", text: "Dhruv updated his portfolio", icon: Layout, color: "text-purple-400", bg: "bg-purple-500/20" },
                { time: "2h ago", text: "Sneha received a 5-star review", icon: Star, color: "text-yellow-400", bg: "bg-yellow-500/20" }
              ].map((activity, i) => (
                <div key={i} className="flex gap-4 relative z-10">
                  <div className={cn("w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-gray-950 shrink-0 border border-white/20", activity.bg)}>
                    <activity.icon className={cn("w-3 h-3", activity.color)} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-300 font-light leading-snug">{activity.text}</p>
                    <span className="text-xs text-gray-500 mt-1 block">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* --- PROFILE PREVIEW DRAWER --- */}
      <AnimatePresence>
        {selectedProfile && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" 
              onClick={() => setSelectedProfile(null)}
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-lg bg-gray-900 z-[70] border-l border-white/5 shadow-2xl overflow-y-auto flex flex-col"
            >
              <div className="sticky top-0 bg-gray-900/80 backdrop-blur-xl border-b border-white/5 p-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <button onClick={() => setSelectedProfile(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                  <span className="font-medium text-white">Profile Preview</span>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                    <Bookmark className="w-5 h-5" />
                  </button>
                  <Link 
                    to={`/profile/${selectedProfile.username || 'dhruv'}`}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </Link>
                </div>
              </div>

              <div className="p-8">
                <div className="flex flex-col items-center text-center mb-8 pb-8 border-b border-white/5">
                  <div className={`w-28 h-28 rounded-full bg-gradient-to-tr ${selectedProfile.avatarGradient} flex items-center justify-center text-white font-display font-bold text-4xl shadow-xl shadow-black/50 mb-4 border-4 border-gray-900`}>
                    {selectedProfile.name.charAt(0)}
                  </div>
                  <h2 className="text-3xl font-display font-medium text-white mb-1">{selectedProfile.name}</h2>
                  <p className="text-lg text-blue-400 font-medium mb-2">{selectedProfile.role}</p>
                  <p className="text-gray-400 font-light flex items-center justify-center gap-1.5 mb-6">
                    <MapPin className="w-4 h-4" /> {selectedProfile.university}
                  </p>
                  
                  <div className="flex gap-3 w-full">
                    <button className="flex-1 flex items-center justify-center h-12 rounded-xl bg-white text-black font-medium hover:bg-gray-100 transition-colors shadow-lg active:scale-95">
                      <MessageSquare className="w-4 h-4 mr-2" /> Message
                    </button>
                    <button className="flex-1 flex items-center justify-center h-12 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors border border-white/5 active:scale-95">
                      <UserPlus className="w-4 h-4 mr-2" /> Invite to Team
                    </button>
                  </div>
                </div>

                <div className="space-y-8">
                  <section>
                    <h3 className="text-lg font-display font-medium text-white mb-3">About</h3>
                    <p className="text-gray-400 font-light leading-relaxed">{selectedProfile.bio}</p>
                  </section>

                  <section>
                    <h3 className="text-lg font-display font-medium text-white mb-3">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                       {selectedProfile.skills.map(skill => (
                          <span key={skill} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-200 text-sm font-medium">
                             {skill}
                          </span>
                       ))}
                    </div>
                  </section>

                  <section>
                     <h3 className="text-lg font-display font-medium text-white mb-3">Metrics</h3>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                           <div className="text-xs text-gray-500 font-light mb-1">Reputation</div>
                           <div className="text-2xl font-medium text-white flex items-center gap-2">
                             {selectedProfile.reputation} <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                           </div>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                           <div className="text-xs text-gray-500 font-light mb-1">Projects</div>
                           <div className="text-2xl font-medium text-white flex items-center gap-2">
                             {selectedProfile.projectsCompleted}
                           </div>
                        </div>
                     </div>
                  </section>
                  
                  <section>
                    <h3 className="text-lg font-display font-medium text-white mb-3 flex justify-between items-center">
                      Recent Portfolio
                      <a href="#" className="text-xs text-blue-400 font-medium">View all</a>
                    </h3>
                    <div className="space-y-3">
                       {[1, 2].map((i) => (
                         <div key={i} className="flex gap-4 p-3 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors cursor-pointer">
                           <div className="w-16 h-16 rounded-lg bg-gray-800 border border-white/10 shrink-0"></div>
                           <div className="flex-1 min-w-0 flex flex-col justify-center">
                             <h4 className="text-sm font-medium text-white truncate">Campus Delivery App V2</h4>
                             <p className="text-xs text-gray-500">React Native • Firebase</p>
                           </div>
                         </div>
                       ))}
                    </div>
                  </section>

                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
