import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  BadgeCheck, MapPin, GraduationCap, Briefcase, Star, 
  Share2, MessageSquare, UserPlus, Link as LinkIcon,
  Github, Twitter, Mail, Award, History, Download,
  TrendingUp, Eye, Activity, Target, ExternalLink, Code2, Layers, CheckCircle2,
  Calendar, ChevronRight
} from "lucide-react";
import { cn } from "@/src/lib/utils";

import { useAuth } from "../context/AuthContext";

export function UserProfile() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("Portfolio");

  // Edit Profile form states
  const [showEditModal, setShowEditModal] = useState(false);
  const [bio, setBio] = useState("");
  const [headline, setHeadline] = useState("");
  const [availability, setAvailability] = useState("");
  const [github, setGithub] = useState("");
  const [twitter, setTwitter] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  const fetchProfile = () => {
    setLoading(true);
    setError("");
    const targetUsername = username?.startsWith("@") ? username : `@${username}`;
    fetch(`/api/profile/${targetUsername}`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) {
          throw new Error(data.error || "Profile not found");
        }
        return data;
      })
      .then((data) => {
        setProfile(data);
        setBio(data.bio || "");
        setHeadline(data.headline || "");
        setAvailability(data.availability || "AVAILABLE_NOW");
        setGithub(data.github || "");
        setTwitter(data.twitter || "");
        setPortfolioUrl(data.portfolioUrl || "");
      })
      .catch((err: any) => {
        setError(err.message || "Failed to load profile.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setEditLoading(true);
    try {
      const response = await fetch("/api/profile/update", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          bio,
          headline,
          availability,
          github,
          twitter,
          portfolioUrl
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile");
      }
      setProfile(prev => ({
        ...prev,
        ...data
      }));
      setShowEditModal(false);
    } catch (err: any) {
      alert(err.message || "Failed to update profile");
    } finally {
      setEditLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProfile();
  }, [username]);  const getAvailabilityLabel = (avail: string) => {
    switch (avail) {
      case "AVAILABLE_NOW": return "Available Now";
      case "AVAILABLE_FOR_FREELANCE": return "Available for Freelance";
      case "OPEN_TO_PROJECTS": return "Open to Projects";
      case "LOOKING_FOR_INTERNSHIP": return "Looking for Internship";
      case "BUSY": return "Busy";
      default: return "Available Now";
    }
  };

  const handleConnectChat = async () => {
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      const response = await fetch("/api/messages/chats/direct", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ targetUserId: profile.userId })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      navigate("/messages");
    } catch (e: any) {
      console.error(e);
      navigate("/messages");
    }
  };

  if (error) {
    return (
      <div className="bg-gray-950 min-h-screen text-gray-200 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
          <Award className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-2xl font-display font-medium text-white mb-2">Failed to load profile</h2>
        <p className="text-gray-400 font-light mb-8 max-w-md">{error}</p>
        <button 
          onClick={fetchProfile} 
          className="px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (loading || !profile) {
    return (
      <div className="bg-gray-950 min-h-screen text-gray-200 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
      </div>
    );
  }

  const isOwner = user && (user.username === profile.username || user.email === profile.email);

  return (
    <div className="bg-gray-950 min-h-screen text-gray-200 pb-20">
      
      {/* --- BANNER --- */}
      <div className={`h-64 md:h-80 w-full bg-gradient-to-br ${profile.bannerGradient || "from-slate-900 via-blue-900/40 to-slate-900"} relative border-b border-white/10 flex items-end`}>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/20 to-transparent animate-pulse"></div>
        
        {/* Customization Button for owner */}
        {isOwner && (
          <button 
            onClick={() => setShowEditModal(true)}
            className="absolute top-24 right-4 md:right-8 lg:right-auto lg:left-1/2 lg:translate-x-[500px] z-10 px-4 py-2 bg-black/50 hover:bg-black/80 backdrop-blur-md border border-white/10 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer"
          >
            Edit Profile
          </button>
        )}
      </div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        
        {/* --- HERO PROFILE HEADER --- */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 -mt-20 sm:-mt-24 mb-12">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className={`w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-gradient-to-tr ${profile.avatarGradient || "from-blue-600 to-indigo-600"} p-1 shadow-2xl animate-fade-in`}>
              <div className="w-full h-full bg-gray-900 rounded-[22px] flex items-center justify-center overflow-hidden border border-white/10 relative">
                <span className="text-5xl font-display font-medium text-white">{profile.name.charAt(0)}</span>
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent"></div>
              </div>
            </div>
            {profile.isVerified && (
              <div className="absolute -bottom-2 -right-2 bg-gray-900 rounded-full p-1 border border-white/10 shadow-xl">
                 <div className="bg-blue-500 rounded-full p-1.5 flex items-center justify-center animate-bounce">
                   <BadgeCheck className="w-5 h-5 text-white" />
                 </div>
              </div>
            )}
          </div>

          <div className="flex-1 pt-2 sm:pt-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl sm:text-4xl font-display font-medium text-white tracking-tight">{profile.name}</h1>
                <span className="text-blue-400 font-medium text-sm bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">{profile.username}</span>
              </div>
              <h2 className="text-lg text-gray-300 font-light mb-3">{profile.headline || "Hustlr Builder"}</h2>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 font-light mb-4">
                <span className="flex items-center"><GraduationCap className="w-4 h-4 mr-1.5" /> {profile.university || "University"} • {profile.gradYear || "2026"}</span>
                <span className="hidden sm:inline w-1 h-1 rounded-full bg-gray-700"></span>
                <span className="flex items-center text-emerald-400"><Activity className="w-4 h-4 mr-1.5" /> {getAvailabilityLabel(profile.availability)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
               {!isOwner && (
                 <>
                   <button 
                     onClick={handleConnectChat}
                     className="flex-1 md:flex-none h-11 px-6 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center justify-center cursor-pointer"
                   >
                     <MessageSquare className="w-4 h-4 mr-2" /> Connect
                   </button>
                   <button className="flex-1 md:flex-none h-11 px-4 bg-white/5 border border-white/10 text-white font-medium rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center cursor-pointer">
                     <UserPlus className="w-4 h-4 mr-2" /> Invite to Team
                   </button>
                 </>
               )}
               <button className="h-11 w-11 bg-white/5 border border-white/10 text-gray-400 rounded-xl hover:bg-white/10 hover:text-white transition-colors flex items-center justify-center shrink-0 cursor-pointer">
                 <Share2 className="w-4 h-4" />
               </button>
            </div>
          </div>
        </div>

        {/* --- STATS ROW --- */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-12">
           {[
             { label: "Reputation", value: profile.reputation, sub: "/ 5.0", icon: Star, color: "text-yellow-400" },
             { label: "Projects", value: profile.portfolio?.length || 0, sub: "Completed", icon: CheckCircle2, color: "text-emerald-400" },
             { label: "Collab Score", value: profile.collabScore, sub: "Top 2%", icon: Target, color: "text-blue-400" },
             { label: "Teams", value: profile.teamsJoined || 2, sub: "Joined", icon: Layers, color: "text-purple-400" },
             { label: "Reviews", value: profile.reviews?.length || 0, sub: "Received", icon: MessageSquare, color: "text-gray-300" },
             { label: "Profile Views", value: profile.profileViews >= 1000 ? `${(profile.profileViews/1000).toFixed(1)}k` : profile.profileViews.toString(), sub: "This month", icon: Eye, color: "text-gray-300" }
           ].map((stat, i) => (
             <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.05 }}
               key={stat.label} 
               className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex flex-col justify-center relative overflow-hidden group hover:border-white/10 transition-colors"
             >
               <div className="flex justify-between items-start mb-2 relative z-10">
                 <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.label}</span>
                 <stat.icon className={`w-4 h-4 ${stat.color} opacity-80`} />
               </div>
               <div className="flex items-baseline gap-1 relative z-10">
                 <span className="text-2xl font-display font-semibold text-white">{stat.value}</span>
                 {stat.sub && <span className="text-[10px] text-gray-500 font-medium">{stat.sub}</span>}
               </div>
               {/* Hover Glow */}
               <div className={`absolute -bottom-4 -right-4 w-12 h-12 bg-white/5 rounded-full blur-xl group-hover:bg-white/10 transition-colors pointer-events-none`}></div>
             </motion.div>
           ))}
        </div>

        {/* --- MAIN LAYOUT --- */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Main Column */}
          <div className="flex-1 w-full min-w-0 space-y-10">
            
            {/* About */}
            <section className="bg-white/[0.02] rounded-3xl border border-white/5 p-6 sm:p-8">
              <h3 className="text-xl font-display font-medium text-white mb-4">About</h3>
              <p className="text-gray-400 font-light leading-relaxed whitespace-pre-line text-sm sm:text-base">
                {profile.bio || "No biography provided yet."}
              </p>
            </section>

            {/* Nav Tabs */}
            <div className="flex items-center gap-6 overflow-x-auto border-b border-white/5 scrollbar-hide">
              {["Portfolio", "Experience", "Education", "Reviews"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "pb-3 text-sm font-medium transition-colors relative whitespace-nowrap",
                    activeTab === tab ? "text-white" : "text-gray-500 hover:text-gray-300"
                  )}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-t-full" layoutId="profileTab" />
                  )}
                </button>
              ))}
            </div>

            {/* Portfolio Section */}
            {activeTab === "Portfolio" && (
              <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                 {profile.portfolio && profile.portfolio.length > 0 ? (
                   profile.portfolio.map((proj: any) => (
                     <div key={proj.id} className="group rounded-3xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/10 transition-all p-6 sm:p-8 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[80px] rounded-full pointer-events-none group-hover:bg-blue-500/10 transition-colors" />
                        
                        <div className="flex flex-col md:flex-row gap-6 relative z-10">
                           <div className="w-full md:w-48 h-32 rounded-2xl bg-gray-900 border border-white/5 shrink-0 flex items-center justify-center">
                             <Code2 className="w-8 h-8 text-gray-700" />
                           </div>
                           <div className="flex-1 min-w-0">
                             <div className="flex items-center justify-between mb-2">
                               <div className="flex items-center gap-3">
                                 <h4 className="text-xl font-display font-medium text-white">{proj.title}</h4>
                                 <span className="px-2 py-0.5 rounded border border-white/10 bg-white/5 text-[10px] text-gray-400 uppercase tracking-wider">{proj.type}</span>
                               </div>
                               {proj.link && (
                                 <a 
                                   href={proj.link.startsWith("http") ? proj.link : `https://${proj.link}`}
                                   target="_blank"
                                   rel="noreferrer"
                                   className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                                 >
                                   <ExternalLink className="w-4 h-4" />
                                 </a>
                               )}
                             </div>
                             <p className="text-sm font-light text-gray-400 mb-4 line-clamp-2">{proj.description}</p>
                             
                             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                               <div className="flex flex-wrap gap-2">
                                 {proj.tech?.map((t: string) => (
                                   <span key={t} className="px-2 py-1 rounded bg-black/50 border border-white/5 text-gray-300 text-xs font-light">{t}</span>
                                 ))}
                               </div>
                               {proj.metrics && (
                                 <div className="flex items-center text-emerald-400 text-xs font-medium bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 w-fit">
                                   <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
                                   {proj.metrics}
                                 </div>
                               )}
                             </div>
                           </div>
                        </div>
                     </div>
                   ))
                 ) : (
                   <div className="text-center py-12 border border-white/5 rounded-3xl bg-white/[0.01]">
                     <p className="text-sm text-gray-500 font-light">No projects added yet.</p>
                   </div>
                 )}
              </motion.section>
            )}

            {/* Experience Section */}
            {activeTab === "Experience" && (
              <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                 <div className="relative border-l border-white/10 ml-4 space-y-10 py-4">
                   {profile.experience && profile.experience.length > 0 ? (
                     profile.experience.map((exp: any, i: number) => (
                       <div key={i} className="relative pl-8">
                         <div className="absolute -left-[5px] top-1.5 w-[9px] h-[9px] rounded-full bg-blue-500 ring-4 ring-gray-950"></div>
                         <h4 className="text-lg font-medium text-white mb-0.5">{exp.role}</h4>
                         <div className="flex items-center gap-2 text-sm mb-3">
                           <span className="text-blue-400 font-medium">{exp.company}</span>
                           <span className="text-gray-600">•</span>
                           <span className="text-gray-500 font-light">{exp.date}</span>
                         </div>
                         <p className="text-sm text-gray-400 font-light leading-relaxed">{exp.description}</p>
                       </div>
                     ))
                   ) : (
                     <div className="text-center py-12">
                       <p className="text-sm text-gray-500 font-light">No professional experience listed yet.</p>
                     </div>
                   )}
                 </div>
              </motion.section>
            )}

            {/* Education Section */}
            {activeTab === "Education" && (
              <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                 <div className="p-6 rounded-3xl border border-white/5 bg-white/[0.01] flex items-start gap-4">
                   <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-red-800 p-0.5 shrink-0">
                     <div className="w-full h-full bg-gray-950 rounded-[10px] flex items-center justify-center">
                       <span className="text-lg font-display font-bold text-white">S</span>
                     </div>
                   </div>
                   <div>
                     <h4 className="text-lg font-medium text-white">{profile.university || "University"}</h4>
                     <p className="text-blue-400 text-sm mb-1">{profile.degree || "Degree Studies"}</p>
                     <p className="text-gray-500 font-light text-sm mb-4">Class of {profile.gradYear || "2026"}</p>
                   </div>
                 </div>
              </motion.section>
            )}

            {/* Reviews Section */}
            {activeTab === "Reviews" && (
              <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {profile.reviews && profile.reviews.length > 0 ? (
                   profile.reviews.map((rev: any, i: number) => (
                     <div key={i} className="p-6 rounded-3xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors">
                       <div className="flex gap-1 mb-3">
                         {[...Array(5)].map((_, j) => (
                           <Star key={j} className={`w-4 h-4 ${j < rev.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-700 font-light"}`} />
                         ))}
                       </div>
                       <p className="text-sm text-gray-300 font-light italic leading-relaxed mb-6">"{rev.text}"</p>
                       <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-xs font-bold text-white">{rev.author?.charAt(0) || "U"}</div>
                         <div>
                           <div className="text-sm font-medium text-white">{rev.author}</div>
                           <div className="text-xs text-gray-500 capitalize">{rev.role.toLowerCase()}</div>
                         </div>
                       </div>
                     </div>
                   ))
                 ) : (
                   <div className="col-span-2 text-center py-12 border border-white/5 rounded-3xl bg-white/[0.01]">
                     <p className="text-sm text-gray-500 font-light">No endorsements or reviews received yet.</p>
                   </div>
                 )}
              </motion.section>
            )}

          </div>

          {/* Right Sidebar */}
          <aside className="w-full lg:w-80 shrink-0 space-y-6">
            
            {/* Social Links */}
            <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6">
              <h3 className="font-display font-medium text-white mb-4">Links</h3>
              <div className="space-y-3">
                {profile.github && (
                  <a href={profile.github.startsWith("http") ? profile.github : `https://${profile.github}`} target="_blank" rel="noreferrer" className="flex items-center text-sm text-gray-400 hover:text-white transition-colors group">
                    <Github className="w-4 h-4 mr-3 text-gray-500 group-hover:text-white transition-colors" /> {profile.github.replace("github.com/", "")}
                  </a>
                )}
                {profile.twitter && (
                  <a href={profile.twitter.startsWith("http") ? profile.twitter : `https://${profile.twitter}`} target="_blank" rel="noreferrer" className="flex items-center text-sm text-gray-400 hover:text-white transition-colors group">
                    <Twitter className="w-4 h-4 mr-3 text-blue-400 opacity-80 group-hover:opacity-100 transition-colors" /> {profile.twitter.replace("twitter.com/", "")}
                  </a>
                )}
                {profile.portfolioUrl && (
                  <a href={profile.portfolioUrl.startsWith("http") ? profile.portfolioUrl : `https://${profile.portfolioUrl}`} target="_blank" rel="noreferrer" className="flex items-center text-sm text-gray-400 hover:text-white transition-colors group">
                    <LinkIcon className="w-4 h-4 mr-3 text-gray-500 group-hover:text-white transition-colors" /> {profile.portfolioUrl}
                  </a>
                )}
              </div>
            </div>

            {/* Badges / Achievements */}
            {profile.badges && profile.badges.length > 0 && (
              <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6">
                <h3 className="font-display font-medium text-white mb-4 flex items-center gap-2">
                  <Award className="w-4 h-4 text-yellow-500" /> Achievements
                </h3>
                <div className="flex flex-wrap gap-2">
                   {profile.badges.map((badge: string) => (
                     <div key={badge} className="px-3 py-1.5 rounded-lg border border-yellow-500/20 bg-yellow-500/10 flex items-center gap-2 text-sm text-yellow-500 font-medium">
                       <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                       {badge}
                     </div>
                   ))}
                </div>
              </div>
            )}

            {/* Skills */}
            <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6">
              <h3 className="font-display font-medium text-white mb-4">Top Skills</h3>
              <div className="space-y-4">
                 {profile.skills && profile.skills.length > 0 ? (
                   profile.skills.map((skill: any) => (
                     <div key={skill.name} className="group">
                       <div className="flex items-center justify-between mb-1.5">
                         <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">{skill.name}</span>
                         <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded font-medium">{skill.endorsements || 0} ✓</span>
                       </div>
                       <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                         <div className="h-full bg-blue-500 rounded-full" style={{ width: skill.level === 'ADVANCED' || skill.level === 'Advanced' ? '95%' : skill.level === 'INTERMEDIATE' || skill.level === 'Intermediate' ? '65%' : '35%' }} />
                       </div>
                       <div className="text-[10px] text-gray-500 mt-1 capitalize">{skill.level.toLowerCase()}</div>
                     </div>
                   ))
                 ) : (
                   <p className="text-xs text-gray-500">No skills added yet.</p>
                 )}
              </div>
              {isOwner && (
                <button className="w-full mt-4 py-2 border border-white/10 text-xs font-medium text-gray-400 rounded-xl hover:bg-white/5 hover:text-white transition-colors">
                  Manage Skills
                </button>
              )}
            </div>

            {/* Resume / AI Insights (Private View Mock) */}
            <div className="rounded-3xl border border-blue-500/20 bg-gradient-to-b from-blue-500/10 to-transparent p-6 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[40px] pointer-events-none" />
               <div className="flex items-center gap-2 mb-2 relative z-10">
                 <Activity className="w-4 h-4 text-blue-400" />
                 <h3 className="font-medium text-white text-sm">HUSTLR AI Insight</h3>
               </div>
               <p className="text-xs font-light text-gray-400 mb-4 leading-relaxed relative z-10">
                 Your reputation score is in the top 5% of student developers. We recommend adding Python to your skills to match 42 new active opportunities.
               </p>
               <button className="w-full py-2 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-lg hover:bg-blue-500/30 transition-colors">
                 View Matches
               </button>
            </div>

          </aside>

        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="relative w-full max-w-xl bg-gray-900 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />
            
            <div className="mb-6">
              <h3 className="text-2xl font-display font-medium text-white mb-2">Edit Profile Details</h3>
              <p className="text-gray-400 font-light text-sm">Update your public card values and links.</p>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Headline / Role</label>
                <input
                  type="text"
                  required
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-blue-500/50 focus:bg-blue-500/5 transition-all font-light"
                  placeholder="e.g. Full Stack Developer & Hackathon Lead"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Biography</label>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-blue-500/50 focus:bg-blue-500/5 transition-all resize-none font-light"
                  placeholder="Share a short summary about your skills, passion, and what you are building..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Availability Status</label>
                <select
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  className="w-full bg-gray-950 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-blue-500/50 focus:bg-blue-500/5 transition-all font-light"
                >
                  <option value="AVAILABLE_NOW">Available Now</option>
                  <option value="AVAILABLE_FOR_FREELANCE">Available for Freelance</option>
                  <option value="OPEN_TO_PROJECTS">Open to Projects</option>
                  <option value="LOOKING_FOR_INTERNSHIP">Looking for Internship</option>
                  <option value="BUSY">Busy</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">GitHub Username / Link</label>
                <input
                  type="text"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-blue-500/50 focus:bg-blue-500/5 transition-all font-light"
                  placeholder="github.com/username"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Twitter Link</label>
                <input
                  type="text"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-blue-500/50 focus:bg-blue-500/5 transition-all font-light"
                  placeholder="twitter.com/username"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Portfolio Website URL</label>
                <input
                  type="text"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-blue-500/50 focus:bg-blue-500/5 transition-all font-light"
                  placeholder="username.dev"
                />
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 h-12 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex-1 h-12 rounded-xl bg-white text-black font-semibold text-sm hover:bg-gray-100 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center cursor-pointer"
                >
                  {editLoading ? (
                    <div className="w-5 h-5 rounded-full border-2 border-black/20 border-t-black animate-spin" />
                  ) : (
                    "Save Changes"
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
