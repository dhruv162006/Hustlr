import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, Filter, Sparkles, Clock, CircleDollarSign, 
  MapPin, Users, ChevronRight, Bookmark, ArrowUpRight, 
  Briefcase, Zap, TrendingUp, ChevronDown, CheckCircle2,
  MoreHorizontal, Ghost
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Gig } from "@/src/types";

// Helper for formatting relative time
const timeAgo = (dateStr: string) => {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHrs < 1) return "Just now";
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return `${Math.floor(diffHrs / 24)}d ago`;
};

import { useAuth } from "../context/AuthContext";

export function Marketplace() {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [filterType, setFilterType] = useState("All Types");
  const [aiRecs, setAiRecs] = useState<any[]>([]);

  const mockUserProfile = {
    name: user?.name || "Dhruv K.",
    major: "Computer Science",
    skills: ["React", "TypeScript", "Node.js"]
  };

  const fetchGigs = () => {
    setLoading(true);
    setError("");
    
    // Map human filters to DB Enums
    let typeParam = "";
    if (filterType === "Freelance Gig") typeParam = "FREELANCE_GIG";
    else if (filterType === "Startup Project") typeParam = "STARTUP_PROJECT";
    else if (filterType === "Campus Job") typeParam = "CAMPUS_JOB";

    const catParam = activeCategory === "All" ? "" : activeCategory;

    const query = new URLSearchParams();
    if (searchQuery) query.append("search", searchQuery);
    if (catParam) query.append("category", catParam);
    if (typeParam) query.append("type", typeParam);

    fetch(`/api/opportunities?${query.toString()}`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) {
          throw new Error(data.error || "Failed to fetch opportunities");
        }
        return data;
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setGigs(data);
        }
      })
      .catch((err: any) => {
        setError(err.message || "Something went wrong while fetching the marketplace. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Trigger on filters/search
  useEffect(() => {
    fetchGigs();
  }, [activeCategory, filterType]);

  // Fetch AI Match Recommendation
  useEffect(() => {
    if (!token) return;
    fetch("/api/dashboard/ai/recommend", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ type: "gigs" }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAiRecs(data);
        }
      })
      .catch((e) => console.error("Error fetching AI recommendations", e));
  }, [token]);

  const categories = ["All", "Development", "Design", "AI/ML", "Marketing", "Content"];
  const trendingSearches = ["React Native", "Figma UI", "Python Scraper", "Social Media", "Video Editor"];

  const filteredGigs = gigs.filter(g => {
    const matchesSearch = g.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          g.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Add real category filtering logic based on tags here in a real app
    const matchesCategory = activeCategory === "All" || g.tags.some(t => t.includes(activeCategory) || activeCategory === "Development" && t === "React Native");
    
    const matchesType = filterType === "All Types" || g.projectType === filterType;

    return matchesSearch && matchesCategory && matchesType;
  });

  return (
    <div className="bg-gray-950 min-h-screen text-gray-200">
      
      {/* --- HERO SECTION --- */}
      <section className="relative pt-24 pb-16 px-4 md:pt-32 md:pb-24 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.05)_0%,transparent_50%)]" />
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center text-center">
          
          <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-blue-400 mb-6 backdrop-blur-md">
             <Zap className="w-3.5 h-3.5 mr-1.5 fill-blue-400/20" />
             2,300+ Active Opportunities
          </div>

          <h1 className="text-5xl md:text-7xl font-display font-medium text-white mb-6 tracking-tight">
            Discover your next <br className="hidden md:block"/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">big opportunity.</span>
          </h1>
          <p className="border-t border-white/10 text-xl md:text-2xl font-light tracking-wide text-gray-400 max-w-2xl mx-auto mb-12">
            The premium marketplace for student developers, designers, and campus founders.
          </p>

          {/* Smart Search Bar */}
          <form onSubmit={(e) => { e.preventDefault(); fetchGigs(); }} className="w-full max-w-3xl mx-auto relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-50" />
            <div className="relative flex items-center bg-gray-900/80 border border-white/10 backdrop-blur-xl rounded-2xl p-2 shadow-2xl">
               <div className="pl-4 pr-2">
                  <Search className="w-6 h-6 text-gray-500" />
               </div>
               <input
                 type="text"
                 placeholder="Search for 'React Developer', 'Startup Co-founder', 'UI Design'..."
                 className="flex-1 bg-transparent border-none text-white focus:outline-none placeholder:text-gray-600 text-lg py-3 w-full font-light"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
               />
               <button type="submit" className="bg-white text-black px-8 py-3.5 rounded-xl font-medium transition-transform active:scale-95 hover:bg-gray-100 hidden sm:block">
                 Search
               </button>
            </div>
          </form>
          
          {/* Trending Searches */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            <span className="text-sm text-gray-500 font-medium">Trending:</span>
            {trendingSearches.map(term => (
              <button 
                key={term} 
                onClick={() => setSearchQuery(term)}
                className="text-xs font-medium px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                {term}
              </button>
            ))}
          </div>

        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-12 flex flex-col xl:flex-row gap-8">
        
        {/* --- LEFT SIDEBAR: FILTERS --- */}
        <aside className="hidden xl:block w-64 shrink-0 space-y-8">
          <div>
            <h3 className="text-lg font-display font-medium text-white mb-4">Opportunity Type</h3>
            <div className="space-y-2">
              {["All Types", "Freelance Gig", "Startup Project", "Internship", "Hackathon"].map(type => (
                <label key={type} className="flex items-center gap-3 group cursor-pointer">
                  <div className={cn(
                    "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                    filterType === type ? "bg-white border-white text-black" : "border-white/20 bg-white/5 group-hover:border-white/40"
                  )}>
                    {filterType === type && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                  <span className={cn("text-sm font-light transition-colors", filterType === type ? "text-white" : "text-gray-400 group-hover:text-gray-300")}>
                    {type}
                  </span>
                  <input type="radio" className="hidden" checked={filterType === type} onChange={() => setFilterType(type)} />
                </label>
              ))}
            </div>
          </div>

          <div>
             <h3 className="text-lg font-display font-medium text-white mb-4">Budget</h3>
             <div className="space-y-4">
               <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-2">
                    <span>Paid Projects</span>
                    <span>Free/Equity</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                     <div className="w-2/3 h-full bg-white rounded-full" />
                  </div>
               </div>
               <div className="flex gap-2">
                 {["Free", "₹5k+", "₹20k+", "₹100k+"].map(b => (
                    <button key={b} className="flex-1 py-2 text-xs font-medium rounded-lg border border-white/10 bg-white/5 text-gray-400 hover:text-white hover:border-white/30 transition-colors">
                      {b}
                    </button>
                 ))}
               </div>
             </div>
          </div>

          <div className="pt-6 border-t border-white/10">
            <h3 className="font-medium text-white mb-3">AI Match Accuracy</h3>
            <div className="p-4 rounded-xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white">Strict Matching</span>
                <div className="w-8 h-4 bg-white/20 rounded-full relative">
                  <div className="w-3 h-3 bg-white rounded-full absolute right-0.5 top-0.5" />
                </div>
              </div>
              <p className="text-xs text-gray-500 font-light">Only shows results matching your skills exactly.</p>
            </div>
          </div>
        </aside>

        {/* --- MAIN FEED --- */}
        <main className="flex-1 min-w-0">
          
          {/* Categories Nav */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide mb-6 border-b border-white/5">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all",
                  activeCategory === cat 
                    ? "bg-white text-black" 
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* AI Recommendation Banner */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-1 rounded-2xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-transparent"
          >
            <div className="p-6 rounded-[14px] bg-gray-950/80 backdrop-blur-xl border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-blue-400" />
                  <h3 className="font-display font-medium text-white text-lg">Recommended for you</h3>
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-blue-500/20 text-blue-400 ml-2">92% Match</span>
                </div>
                <p className="text-sm text-gray-400 font-light">Based on your skills in <strong className="font-medium text-gray-200">React, TypeScript</strong>.</p>
              </div>
              
              {/* Highlight Card */}
              {gigs[0] && (
                <div className="w-full md:w-auto flex-1 md:max-w-md bg-white/5 border border-white/10 rounded-xl p-4 flex gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center shrink-0">
                     <span className="font-display font-bold text-white text-xl">{gigs[0].client.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white truncate text-base">{gigs[0].title}</h4>
                    <p className="text-sm text-blue-400 mb-2">{gigs[0].budget}</p>
                    <button className="text-xs font-medium bg-white text-black px-4 py-1.5 rounded-full hover:bg-gray-200 transition-colors">
                      Quick Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-display font-medium text-white">
              {searchQuery ? "Search Results" : activeCategory === "All" ? "Latest Opportunities" : `${activeCategory} Opportunities`}
            </h2>
            <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
               <button className="xl:hidden flex items-center gap-2 text-sm font-medium text-white bg-white/5 border border-white/10 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors">
                 <Filter className="w-4 h-4" /> Filters
               </button>
               <div className="flex items-center gap-2 text-sm text-gray-400">
                 <span>Sort by:</span>
                 <button className="flex items-center gap-1 font-medium text-white hover:text-gray-300">
                   Newest <ChevronDown className="w-4 h-4" />
                 </button>
               </div>
            </div>
          </div>

          {loading ? (
            <div className="py-20 flex justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
            </div>
          ) : error ? (
            <div className="py-16 text-center border border-red-500/20 rounded-2xl bg-red-500/5 p-8 max-w-lg mx-auto">
              <Zap className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-display font-medium text-white mb-2">Failed to load opportunities</h3>
              <p className="text-gray-400 font-light mb-6">{error}</p>
              <button 
                onClick={fetchGigs} 
                className="px-6 py-2.5 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 transition-colors"
              >
                Retry Search
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <AnimatePresence>
                {filteredGigs.map((gig) => (
                  <motion.div
                    key={gig.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => navigate(`/opportunity/${gig.id}`)}
                    className="group flex flex-col lg:flex-row gap-6 p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.04] hover:border-white/20 transition-all cursor-pointer relative"
                  >
                    {/* Hover Glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/[0.03] to-white/0 opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000 ease-in-out pointer-events-none" />
                    
                    {/* Meta Left */}
                    <div className="hidden lg:flex flex-col items-center shrink-0 w-24 border-r border-white/10 pr-6">
                      <div className="w-14 h-14 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center mb-3">
                         <Briefcase className="w-6 h-6 text-gray-400" />
                      </div>
                      <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider text-center">{gig.projectType.split(" ")[0]}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="text-xl font-display font-medium text-white group-hover:text-blue-400 transition-colors leading-tight">
                          {gig.title}
                        </h3>
                        <button className="text-gray-500 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors" onClick={(e) => { e.stopPropagation(); }}>
                          <Bookmark className="w-5 h-5" />
                        </button>
                      </div>

                      <p className="text-gray-400 text-sm font-light leading-relaxed mb-4 line-clamp-2">
                        {gig.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 mb-5">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-medium border border-green-500/20">
                          <CircleDollarSign className="w-3.5 h-3.5" />
                          {gig.budget}
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 text-gray-400 text-xs font-medium border border-white/5">
                          <Clock className="w-3.5 h-3.5" />
                          {gig.duration}
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 text-gray-400 text-xs font-medium border border-white/5">
                          <MapPin className="w-3.5 h-3.5" />
                          {gig.workMode}
                        </div>
                         <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 text-gray-400 text-xs font-medium border border-white/5">
                          <Users className="w-3.5 h-3.5" />
                          {gig.applicants} applicants
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center border border-white/10 text-xs font-medium text-white">
                            {gig.client.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-200">{gig.client}</p>
                            <p className="text-[11px] text-gray-500 font-light flex items-center gap-1">
                              Reputation: <span className="text-white font-medium">{gig.clientReputation} <Sparkles className="w-3 h-3 inline text-yellow-500"/></span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-xs text-gray-500 font-light hidden sm:block">Posted {timeAgo(gig.date)}</span>
                          <button className="flex items-center justify-center rounded-full bg-white text-black px-5 py-2 text-sm font-medium transition-transform group-hover:scale-105 active:scale-95">
                            Details <ArrowUpRight className="w-4 h-4 ml-1 opacity-50" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {filteredGigs.length === 0 && (
                <div className="text-center py-20 border border-white/10 border-dashed rounded-2xl bg-white/5">
                  <Ghost className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-display font-medium text-white mb-2">No opportunities found</h3>
                  <p className="text-gray-500 font-light">Try adjusting your search or filters.</p>
                  <button 
                    onClick={() => { setSearchQuery(""); setFilterType("All Types"); setActiveCategory("All"); }}
                    className="mt-6 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          )}
        </main>

        {/* --- RIGHT SIDEBAR: TALENT & ACTIVITY --- */}
        <aside className="hidden 2xl:flex flex-col w-80 shrink-0 gap-8">
          
          {/* Talent Discovery */}
          <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-medium text-white">Talent Radar</h3>
              <button className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              {[
                { name: "Sneha R.", role: "Data Scientist", acc: "98% Match" },
                { name: "Karan J.", role: "UI Designer", acc: "New" }
              ].map((t, i) => (
                <div key={i} className="flex gap-3 group cursor-pointer">
                   <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-700 to-gray-800 border border-white/10 flex items-center justify-center shrink-0">
                     {t.name.charAt(0)}
                   </div>
                   <div className="flex-1 min-w-0">
                     <h4 className="text-sm font-medium text-gray-200 truncate group-hover:text-blue-400 transition-colors">{t.name}</h4>
                     <p className="text-xs text-gray-500 font-light truncate">{t.role}</p>
                   </div>
                   <div className="shrink-0 text-right">
                     <span className="text-[10px] uppercase font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-sm">{t.acc}</span>
                   </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Activity Feed */}
          <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
            <div className="flex items-center gap-2 mb-6">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </div>
              <h3 className="font-display font-medium text-white">Live Activity</h3>
            </div>

            <div className="space-y-5 relative before:absolute before:inset-y-0 before:left-2.5 before:w-px before:bg-white/10">
              {[
                { time: "2m ago", text: "New gig posted by StartupX", icon: Briefcase, color: "text-blue-400", bg: "bg-blue-500/20" },
                { time: "15m ago", text: "Team formed for HackMIT", icon: Users, color: "text-purple-400", bg: "bg-purple-500/20" },
                { time: "1h ago", text: "Dhruv K. earned Top Builder", icon: TrendingUp, color: "text-green-400", bg: "bg-green-500/20" }
              ].map((activity, i) => (
                <div key={i} className="flex gap-4 relative z-10">
                  <div className={cn("w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-gray-950 shrink-0", activity.bg)}>
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
    </div>
  );
}
