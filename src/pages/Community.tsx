import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, Plus, Users, MessageSquare, Heart, Share2, Bookmark, 
  Flame, Zap, Trophy, Rocket, Code, Layout, Lightbulb, 
  MapPin, Hash, Target, Calendar, UserPlus, Image as ImageIcon, 
  Briefcase, Award, TrendingUp, ChevronRight, Play, Globe, CheckCircle2,
  FileText
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Link } from "react-router-dom";

type Tab = "Feed" | "Spaces" | "Events" | "Mentorship" | "Leaderboards" | "Launchpad";

import { useAuth } from "../context/AuthContext";

export function Community() {
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("Feed");
  const [newPostContent, setNewPostContent] = useState("");
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [postLoading, setPostLoading] = useState(false);

  const fetchPosts = () => {
    setLoading(true);
    setError("");
    fetch("/api/community/posts")
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "Failed to load posts");
        return data;
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setPosts(data.map((p: any) => ({
            id: p.id,
            author: {
              name: p.author.name,
              role: p.author.role,
              avatar: p.author.name.charAt(0),
              avatarGradient: p.author.profile?.avatarGradient,
              verified: p.author.isVerified || false
            },
            time: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "Just now",
            space: p.spaceName || "General",
            content: p.content,
            stats: {
              likes: p.likes?.length || 0,
              comments: p.comments?.length || 0,
              shares: 2
            },
            hasLiked: p.likes?.some((lk: any) => lk.userId === user?.id) || false
          })));
        }
      })
      .catch((err) => {
        setError(err.message || "Failed to load feed.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim() || !token) return;
    setPostLoading(true);
    try {
      const response = await fetch("/api/community/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          content: newPostContent,
          spaceName: "General"
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to submit post");
      }
      setNewPostContent("");
      fetchPosts();
    } catch (err: any) {
      alert(err.message || "Failed to create post");
    } finally {
      setPostLoading(false);
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!token) return;
    // Optimistic toggle
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          hasLiked: !p.hasLiked,
          stats: {
            ...p.stats,
            likes: p.hasLiked ? p.stats.likes - 1 : p.stats.likes + 1
          }
        };
      }
      return p;
    }));

    try {
      const response = await fetch(`/api/community/posts/${postId}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error("Failed to like post");
      }
    } catch (err) {
      console.error(err);
      fetchPosts(); // Rollback to actual state
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [user]);

  const navigation = [
    { name: "Feed", icon: Zap },
    { name: "Spaces", icon: Hash },
    { name: "Launchpad", icon: Rocket },
    { name: "Events", icon: Calendar },
    { name: "Mentorship", icon: Users },
    { name: "Leaderboards", icon: Trophy },
  ];

  const spaces = [
    { name: "Development", count: "12.4k", icon: Code, color: "text-blue-400", bg: "bg-blue-500/10" },
    { name: "AI & ML", count: "8.2k", icon: Globe, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { name: "Startups", count: "15.1k", icon: Rocket, color: "text-purple-400", bg: "bg-purple-500/10" },
    { name: "Design", count: "5.6k", icon: Layout, color: "text-rose-400", bg: "bg-rose-500/10" },
    { name: "Freelancing", count: "10.2k", icon: Briefcase, color: "text-orange-400", bg: "bg-orange-500/10" },
  ];

  const trendingPosts = [
    {
      id: "p1",
      author: { name: "Dhruv C.", role: "Full Stack Developer", avatar: "D", verified: true },
      time: "2h ago",
      space: "Startups",
      content: "Just launched the MVP for Campus Delivery! 🚀 Built with React Native, Supabase, and Tailwind. We got 50 signups in the first hour. What should we focus on next?",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop",
      stats: { likes: 124, comments: 32, shares: 5 },
      hasLiked: true
    },
    {
      id: "p2",
      author: { name: "Sneha R.", role: "UI/UX Designer", avatar: "S" },
      time: "5h ago",
      space: "Design",
      content: "Sharing my latest case study on optimizing FinTech dashboards for mobile users. The key is progressive disclosure of information. Let me know what you think!",
      stats: { likes: 89, comments: 14, shares: 12 }
    },
    {
      id: "p3",
      author: { name: "Karan J.", role: "AI Researcher", avatar: "K", verified: true },
      time: "1d ago",
      space: "AI & ML",
      content: "Does anyone want to team up for the SIH Hackathon next weekend? I'm looking for a frontend developer to pair with my backend/AI skills. We're building a smart study assistant.",
      stats: { likes: 45, comments: 28, shares: 2 }
    }
  ];

  const featuredBuilders = [
    { name: "Priya Patel", role: "10x Projects Shipped", rep: "4.9", avatar: "P" },
    { name: "Rahul Verma", role: "Top Designer", rep: "4.8", avatar: "R" },
    { name: "Ananya Desai", role: "PeakXV Founder", rep: "5.0", avatar: "A" },
  ];

  return (
    <div className="min-h-screen bg-[#07090E] text-gray-200 pt-16 flex justify-center font-sans">
       <div className="w-full max-w-[1400px] flex gap-6 px-4 md:px-8 py-8 relative">
          
          {/* LEFT SIDEBAR - NAVIGATION */}
          <aside className="w-64 shrink-0 hidden lg:block sticky top-24 h-[calc(100vh-120px)] space-y-8">
             <div className="space-y-1">
               {navigation.map((item) => (
                 <button
                   key={item.name}
                   onClick={() => setActiveTab(item.name as Tab)}
                   className={cn(
                     "w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-[15px] font-medium transition-all group",
                     activeTab === item.name 
                        ? "bg-blue-500/10 text-blue-400" 
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                   )}
                 >
                   <item.icon className={cn("w-5 h-5", activeTab === item.name ? "text-blue-400" : "text-gray-500 group-hover:text-gray-300 transition-colors")} />
                   {item.name}
                 </button>
               ))}
             </div>

             <div>
                <div className="flex items-center justify-between mb-3 px-2">
                   <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Your Spaces</h3>
                   <button className="p-1 text-gray-500 hover:text-white transition-colors"><Plus className="w-4 h-4" /></button>
                </div>
                <div className="space-y-1">
                  {spaces.slice(0, 3).map((space) => (
                    <button key={space.name} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors group">
                       <div className={cn("w-6 h-6 rounded-md flex items-center justify-center shrink-0", space.bg, space.color)}>
                         <space.icon className="w-3.5 h-3.5" />
                       </div>
                       <span className="truncate">{space.name}</span>
                    </button>
                  ))}
                </div>
             </div>
             
             <div className="rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent p-5 text-center">
                <Target className="w-8 h-8 text-emerald-400 mx-auto mb-3 opacity-80" />
                <h4 className="text-sm font-medium text-white mb-2">Build Your Presence</h4>
                <p className="text-xs text-gray-400 mb-4 leading-relaxed">Share your progress and connect with top builders.</p>
                <button className="w-full py-2 bg-white text-black text-sm font-medium rounded-xl hover:bg-gray-100 transition-colors shadow-lg shadow-white/5">
                  Complete Profile
                </button>
             </div>
          </aside>

          {/* MAIN CONTENT AREA */}
          <main className="flex-1 min-w-0 flex flex-col space-y-6">
             
             {/* Header */}
             <div className="flex items-center justify-between bg-white/[0.01] border border-white/5 rounded-3xl p-4 sm:p-6 backdrop-blur-sm sticky top-20 z-10">
                <div className="flex items-center gap-3">
                   <h1 className="text-2xl font-display font-medium text-white tracking-tight">{activeTab}</h1>
                </div>
                <div className="flex items-center gap-3">
                   <div className="relative hidden sm:block w-64">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                     <input type="text" placeholder={`Search ${activeTab.toLowerCase()}...`} className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-white/20 transition-colors" />
                   </div>
                   <button className="p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20 sm:hidden">
                     <Search className="w-4 h-4" />
                   </button>
                </div>
             </div>

             {/* Tab Content */}
             {activeTab === "Feed" && (
               <AnimatePresence mode="wait">
                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                    {/* Create Post */}
                    <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-5">
                       <div className="flex gap-4">
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shrink-0 border border-white/10 ${user?.avatarGradient || "bg-gray-800"}`}>
                           {user?.name?.charAt(0) || "D"}
                         </div>
                         <div className="flex-1 space-y-3">
                            <textarea 
                              placeholder="Share an update, ask a question, or launch a project..." 
                              className="w-full bg-transparent border-none resize-none focus:outline-none text-white text-[15px] placeholder:text-gray-500 leading-relaxed font-light"
                              rows={2}
                              value={newPostContent}
                              onChange={(e) => setNewPostContent(e.target.value)}
                            />
                            <div className="flex items-center justify-between pt-3 border-t border-white/5">
                               <div className="flex items-center gap-1">
                                 <button className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                                   <ImageIcon className="w-4 h-4" />
                                 </button>
                                 <button className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                                   <Code className="w-4 h-4" />
                                 </button>
                                 <button className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                                   <FileText className="w-4 h-4" />
                                 </button>
                               </div>
                               <button 
                                 onClick={handleCreatePost}
                                 disabled={!newPostContent.trim() || postLoading}
                                 className="px-5 py-2 bg-white text-black text-sm font-semibold rounded-full disabled:opacity-50 disabled:bg-gray-800 disabled:text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
                               >
                                 {postLoading ? "Posting..." : "Post"}
                               </button>
                            </div>
                         </div>
                       </div>
                    </div>

                    {/* Feed List */}
                    {loading ? (
                      <div className="py-20 flex justify-center w-full">
                        <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-blue-500 animate-spin" />
                      </div>
                    ) : error ? (
                      <div className="py-16 text-center border border-red-500/20 rounded-3xl bg-red-500/5 p-8 max-w-lg mx-auto w-full">
                        <h3 className="text-lg font-display font-medium text-white mb-2">Failed to load feed</h3>
                        <p className="text-gray-400 font-light mb-6">{error}</p>
                        <button 
                          onClick={fetchPosts} 
                          className="px-6 py-2.5 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                          Retry Feed
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {posts.map((post) => (
                          <div key={post.id} className="bg-white/[0.02] border border-white/5 rounded-3xl p-5 sm:p-6 transition-colors hover:border-white/10 hover:bg-white/[0.03]">
                             <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shrink-0 border border-white/10 relative ${post.author.avatarGradient || "bg-gray-850"}`}>
                                    {post.author.avatar}
                                    {post.author.verified && <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 absolute -bottom-1 -right-1 bg-[#07090E] rounded-full" />}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-medium text-white text-[15px]">{post.author.name}</h4>
                                      <span className="text-[10px] font-medium text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">{post.space}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 font-light mt-0.5">{post.author.role || "Builder"} • {post.time}</p>
                                  </div>
                                </div>
                                <button className="p-1.5 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors"><Plus className="w-4 h-4" /></button>
                             </div>
                             
                             <p className="text-gray-300 text-[15px] font-light leading-relaxed mb-4 whitespace-pre-wrap">{post.content}</p>
                             
                             {post.image && (
                               <div className="w-full h-64 sm:h-80 rounded-2xl overflow-hidden border border-white/5 mb-4">
                                  <img src={post.image} alt="Post content" className="w-full h-full object-cover" />
                               </div>
                             )}

                             <div className="flex items-center gap-6 pt-4 border-t border-white/5">
                                <button 
                                  onClick={() => handleLikePost(post.id)}
                                  className={cn("flex items-center gap-2 text-sm font-medium transition-colors cursor-pointer", post.hasLiked ? "text-rose-500" : "text-gray-400 hover:text-rose-400")}
                                >
                                  <Heart className={cn("w-4 h-4", post.hasLiked && "fill-rose-500")} /> {post.stats.likes}
                                </button>
                                <button className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors cursor-pointer">
                                  <MessageSquare className="w-4 h-4" /> {post.stats.comments}
                                </button>
                                <button className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors cursor-pointer">
                                  <Share2 className="w-4 h-4" /> {post.stats.shares}
                                </button>
                                <button className="ml-auto flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors cursor-pointer">
                                  <Bookmark className="w-4 h-4" />
                                </button>
                             </div>
                          </div>
                        ))}
                      </div>
                    )}     
                 </motion.div>
               </AnimatePresence>
             )}


             {/* Other Tabs Placeholders */}
             {activeTab !== "Feed" && (
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex items-center justify-center min-h-[400px] border border-white/5 rounded-3xl bg-white/[0.01]">
                   <div className="text-center p-8">
                     <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        {activeTab === 'Spaces' && <Hash className="w-8 h-8 text-gray-400" />}
                        {activeTab === 'Events' && <Calendar className="w-8 h-8 text-gray-400" />}
                        {activeTab === 'Mentorship' && <Users className="w-8 h-8 text-gray-400" />}
                        {activeTab === 'Leaderboards' && <Trophy className="w-8 h-8 text-gray-400" />}
                        {activeTab === 'Launchpad' && <Rocket className="w-8 h-8 text-gray-400" />}
                     </div>
                     <h2 className="text-2xl font-display font-medium text-white mb-3">Explore {activeTab}</h2>
                     <p className="text-gray-400 font-light max-w-md mx-auto text-[15px] leading-relaxed">
                        Discover new opportunities, join discussions, and connect with other ambitious students in the HUSTLR ecosystem.
                     </p>
                     <button className="mt-8 px-6 py-2.5 bg-white/5 border border-white/10 text-white font-medium rounded-xl hover:bg-white/10 transition-colors">
                        Browse Modules
                     </button>
                   </div>
                </motion.div>
             )}

          </main>

          {/* RIGHT SIDEBAR - HIGHLIGHTS */}
          <aside className="w-80 shrink-0 hidden xl:block sticky top-24 h-[calc(100vh-120px)] space-y-6 overflow-y-auto scrollbar-hide pb-10">
             
             {/* Trending Now */}
             <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-5">
               <div className="flex items-center gap-2 mb-4">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <h3 className="font-display font-medium text-white">Trending Now</h3>
               </div>
               <div className="space-y-4">
                  {[
                    { title: "#BuildForIndia", posts: "2.4k posts" },
                    { title: "React Native vs Flutter", posts: "1.2k posts" },
                    { title: "Summer Internships", posts: "850 posts" },
                    { title: "UI/UX Portfolios", posts: "420 posts" }
                  ].map((tag, i) => (
                    <div key={i} className="group cursor-pointer">
                      <p className="text-sm font-medium text-gray-300 group-hover:text-blue-400 transition-colors">{tag.title}</p>
                      <p className="text-xs text-gray-500 font-light mt-0.5">{tag.posts}</p>
                    </div>
                  ))}
               </div>
             </div>

             {/* Featured Builders */}
             <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-5">
               <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-yellow-500" />
                    <h3 className="font-display font-medium text-white">Featured Builders</h3>
                 </div>
               </div>
               <div className="space-y-4">
                  {featuredBuilders.map((builder, i) => (
                    <div key={i} className="flex items-center gap-3 group cursor-pointer">
                       <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center font-bold text-white border border-white/10 relative">
                         {builder.avatar}
                         <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full border-2 border-[#0B0F19] flex items-center justify-center">
                           <Star className="w-2.5 h-2.5 fill-black text-black" />
                         </div>
                       </div>
                       <div className="flex-1 min-w-0">
                         <p className="text-sm font-medium text-white truncate group-hover:text-blue-400 transition-colors">{builder.name}</p>
                         <p className="text-[10px] text-gray-400 font-light truncate">{builder.role}</p>
                       </div>
                       <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors shrink-0">
                         <UserPlus className="w-4 h-4" />
                       </button>
                    </div>
                  ))}
               </div>
               <button className="w-full mt-5 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors">
                 View Leaderboards &rarr;
               </button>
             </div>

             {/* Upcoming Event */}
             <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-b from-emerald-900/20 to-black p-5 relative overflow-hidden group cursor-pointer">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 blur-[30px] rounded-full pointer-events-none" />
                <div className="flex items-center gap-2 mb-3 relative z-10">
                   <Calendar className="w-4 h-4 text-emerald-400" />
                   <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Upcoming Event</h3>
                </div>
                <h4 className="text-lg font-display font-medium text-white mb-2 relative z-10 group-hover:text-emerald-300 transition-colors">Smart India Hackathon 2026</h4>
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-4 relative z-10">
                   <MapPin className="w-3.5 h-3.5" /> Virtual • 48 Hours
                </div>
                <button className="w-full py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium rounded-xl group-hover:bg-emerald-500/20 transition-colors relative z-10">
                  Register Now
                </button>
             </div>

          </aside>
       </div>
    </div>
  );
}

function Star(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}
