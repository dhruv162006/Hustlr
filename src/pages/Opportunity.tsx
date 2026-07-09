import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { 
  ArrowLeft, BadgeCheck, Sparkles, Clock, CircleDollarSign, 
  MapPin, Users, Share, Bookmark, Flag, UploadCloud,
  ChevronDown, MessageSquare, Anchor, FileText, CheckCircle2,
  Calendar, Briefcase, Zap, Eye
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Gig } from "@/src/types";

import { useAuth } from "../context/AuthContext";

export function Opportunity() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [opportunity, setOpportunity] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("Details");

  // Application States
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [proposal, setProposal] = useState("");
  const [githubLink, setGithubLink] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const fetchOpportunityDetails = () => {
    setLoading(true);
    setError("");
    fetch(`/api/opportunities/${id}`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) {
          throw new Error(data.error || "Failed to load opportunity details");
        }
        return data;
      })
      .then((data) => {
        setOpportunity(data);
      })
      .catch((err: any) => {
        setError(err.message || "Failed to load opportunity details.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      navigate("/login");
      return;
    }
    setSubmitLoading(true);
    setSubmitError("");
    try {
      const formData = new FormData();
      formData.append("proposal", proposal);
      formData.append("githubLink", githubLink);
      if (resumeFile) {
        formData.append("resume", resumeFile);
      }

      const response = await fetch(`/api/opportunities/${id}/apply`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to apply");
      }
      setSubmitSuccess(true);
      setTimeout(() => {
        setShowApplyModal(false);
        setSubmitSuccess(false);
        setProposal("");
        setGithubLink("");
        setResumeFile(null);
      }, 2000);
    } catch (err: any) {
      setSubmitError(err.message || "Failed to submit application");
    } finally {
      setSubmitLoading(false);
    }
  };

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
    fetchOpportunityDetails();
  }, [id]);

  if (error) {
    return (
      <div className="bg-gray-950 min-h-screen text-gray-200 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
          <Zap className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-2xl font-display font-medium text-white mb-2">Error Loading Details</h2>
        <p className="text-gray-400 font-light mb-8 max-w-md">{error}</p>
        <button 
          onClick={fetchOpportunityDetails} 
          className="px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (loading || !opportunity) {
    return (
      <div className="bg-gray-950 min-h-screen text-gray-200 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
      </div>
    );
  }

  // Format date helper
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  const timeAgo = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHrs / 24);
    if (diffHrs < 1) return "Just now";
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="bg-gray-950 min-h-screen text-gray-200 pb-20">
      
      {/* --- HERO BANNER --- */}
      <div className="relative border-b border-white/5 bg-gradient-to-b from-blue-900/10 to-transparent pt-32 pb-16 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.03)_0%,transparent_70%)] pointer-events-none" />
        <div className="max-w-[1200px] mx-auto relative z-10">
          <Link to="/marketplace" className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-white transition-colors mb-8 group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Marketplace
          </Link>
          
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-semibold uppercase tracking-wider">
                  {opportunity.projectType.toUpperCase()}
                </span>
                <span className="flex items-center text-xs font-medium text-green-400 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                  <BadgeCheck className="w-3.5 h-3.5 mr-1" /> Verified Creator
                </span>
                <span className="text-sm font-light text-gray-500 flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1.5" /> Posted {timeAgo(opportunity.date)}
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-medium text-white tracking-tight mb-6 leading-tight max-w-4xl">
                {opportunity.title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 text-sm font-light text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-[10px] font-bold text-white border border-white/10">
                    {opportunity.client.charAt(0)}
                  </div>
                  <span className="font-medium text-gray-200">{opportunity.client}</span>
                </div>
                <div className="w-1 h-1 bg-white/20 rounded-full" />
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  {opportunity.workMode}
                </div>
                <div className="w-1 h-1 bg-white/20 rounded-full" />
                <div className="flex items-center gap-1.5 text-blue-400 font-medium bg-blue-500/10 px-2 py-0.5 rounded-md">
                  <Users className="w-4 h-4" />
                  {opportunity.applicants} Applicants
                </div>
                <div className="flex items-center gap-1.5 text-gray-500">
                  <Eye className="w-4 h-4" />
                  342 Views
                </div>
              </div>
            </div>
            
            {/* Desktop Action Buttons Top */}
            <div className="hidden lg:flex items-center gap-3 shrink-0">
               <button className="w-12 h-12 rounded-full border border-white/10 bg-white/[0.02] hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                  <Bookmark className="w-5 h-5" />
               </button>
               <button className="w-12 h-12 rounded-full border border-white/10 bg-white/[0.02] hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                  <Share className="w-5 h-5" />
               </button>
               <button 
                  onClick={() => {
                    if (!token) navigate("/login");
                    else setShowApplyModal(true);
                  }}
                  className="h-12 px-8 rounded-full bg-white text-black font-medium hover:bg-gray-100 hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(255,255,255,0.15)] ml-2"
                >
                  Apply Now
                </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 py-12 flex flex-col lg:flex-row gap-12 relative">
        
        {/* --- MAIN COLUMN --- */}
        <div className="flex-1 min-w-0">
          
          {/* Tabs Nav */}
          <div className="flex gap-8 border-b border-white/10 overflow-x-auto scrollbar-hide mb-10">
            {["Details", "FAQ", "Community Q&A"].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "pb-4 text-sm font-medium transition-colors relative whitespace-nowrap",
                  activeTab === tab ? "text-white" : "text-gray-500 hover:text-gray-300"
                )}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400" />
                )}
              </button>
            ))}
          </div>

          <div className="space-y-16">
            {activeTab === "Details" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-16">
                {/* Overview */}
                <section>
                  <h2 className="text-2xl font-display font-medium text-white mb-6">Project Overview</h2>
                  <div className="prose prose-invert prose-p:text-gray-400 prose-p:font-light prose-p:leading-relaxed prose-p:mb-6 max-w-none">
                    <p>
                      {opportunity.description}
                    </p>
                    <p>
                      We are looking for an ambitious builder to join us in executing the next phase of our product roadmap. 
                      This is not just another gig; it's an opportunity to build core features from the ground up, influence technical architecture, and ship code directly to real users.
                    </p>
                    <p>
                      Our goal is to launch the MVP by the end of next month. You will work directly with the founder and a senior designer to ensure we hit our milestones with exceptional quality.
                    </p>
                  </div>
                </section>

                {/* Deliverables */}
                <section>
                  <h2 className="text-xl font-display font-medium text-white mb-6">Expected Deliverables</h2>
                  <ul className="space-y-4">
                    {[
                      "Develop and deploy the core frontend features according to Figma designs.",
                      "Integrate secure authentication and data syncing.",
                      "Optimize application performance for a perfect Lighthouse score.",
                      "Set up robust error tracking and analytics."
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                        </div>
                        <span className="text-gray-300 font-light leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                {/* Skills */}
                <section>
                  <h2 className="text-xl font-display font-medium text-white mb-6">Skills Required</h2>
                  <div className="flex flex-wrap gap-2 mb-8">
                    {opportunity.tags.map(t => (
                      <span key={t} className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-gray-200 text-sm font-medium">
                        {t}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-widest mb-4">Preferred But Not Required</h3>
                  <div className="flex flex-wrap gap-2">
                    {["GraphQL", "Zustand", "Framer Motion"].map(t => (
                      <span key={t} className="px-3 py-1.5 rounded-lg border border-white/5 bg-transparent text-gray-400 text-sm font-light">
                        {t}
                      </span>
                    ))}
                  </div>
                </section>

                {/* Attachments */}
                <section>
                  <h2 className="text-xl font-display font-medium text-white mb-6">Project Attachments</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="group flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors cursor-pointer">
                      <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0 border border-red-500/20">
                        <FileText className="w-6 h-6 text-red-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-white text-sm truncate group-hover:text-red-400 transition-colors">Product_Brief_v2.pdf</h4>
                        <p className="text-xs text-gray-500 mt-0.5">2.4 MB • PDF Document</p>
                      </div>
                    </div>
                    <div className="group flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors cursor-pointer">
                      <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0 border border-orange-500/20">
                        <Briefcase className="w-6 h-6 text-orange-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-white text-sm truncate group-hover:text-orange-400 transition-colors">Design_System_Notes.md</h4>
                        <p className="text-xs text-gray-500 mt-0.5">14 KB • Markdown</p>
                      </div>
                    </div>
                  </div>
                </section>
                
                {/* Team */}
                <section>
                  <h2 className="text-xl font-display font-medium text-white mb-6">Meet the Team</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-4 p-5 rounded-2xl border border-white/10 bg-white/[0.02]">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shrink-0">
                          <span className="font-display font-bold text-white text-lg">A</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-white">Rahul V. <BadgeCheck className="w-3 h-3 inline text-blue-400 ml-1"/></h4>
                          <p className="text-sm font-light text-gray-400">Founder & PM</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-5 rounded-2xl border border-white/10 border-dashed bg-white/[0.01]">
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                          <span className="text-gray-500 font-medium">?</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-white">This could be you</h4>
                          <p className="text-sm font-light text-blue-400">{opportunity.title}</p>
                        </div>
                    </div>
                  </div>
                </section>
              </motion.div>
            )}

            {/* FAQ Section */}
            {activeTab === "FAQ" && (
              <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 border-t border-white/5 pt-12">
                <h2 className="text-xl font-display font-medium text-white mb-6">Frequently Asked Questions</h2>
                <div className="space-y-4">
                  {[
                    { q: "Is prior experience required?", a: "While we prefer someone with side project experience, a strong portfolio and demonstrating you can learn quickly is more important than formal experience." },
                    { q: "Is this fully remote?", a: "Yes, our entire student team works remotely, mostly asynchronously, with 2 sync meetings per week via Google Meet." },
                    { q: "How are payments handled?", a: "Payments are placed in escrow through the HUSTLR platform when the contract begins and are released upon milestone completion." },
                    { q: "What is the interview process?", a: "We typically do a 30-min intro call, send a small paid trial task, and then make a final decision." }
                  ].map((faq, i) => (
                    <div key={i} className="p-5 rounded-2xl border border-white/10 bg-white/[0.02] cursor-pointer hover:bg-white/[0.04] transition-colors">
                      <h4 className="font-medium text-white mb-2 flex justify-between items-center text-sm">{faq.q} <ChevronDown className="w-4 h-4 text-gray-500" /></h4>
                      <p className="text-sm text-gray-400 font-light leading-relaxed">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Community Q&A */}
            {activeTab === "Community Q&A" && (
              <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 border-t border-white/5 pt-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-display font-medium text-white">Community Questions</h2>
                  <button className="text-sm font-medium bg-white/5 text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-colors border border-white/5">
                    Ask a Question
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
                     <div className="flex items-start gap-4 mb-4">
                       <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-xs font-bold text-white shrink-0">K</div>
                       <div className="flex-1">
                         <div className="flex items-center justify-between">
                           <h4 className="font-medium text-white text-sm">Karan J.</h4>
                           <span className="text-xs text-gray-500 font-light">2 days ago</span>
                         </div>
                         <p className="text-sm text-gray-300 font-light mt-1">Are you open to someone who only has experience with vanilla React, but is willing to learn React Native quickly?</p>
                       </div>
                     </div>
                     <div className="ml-14 pl-4 border-l-2 border-white/10">
                       <div className="flex items-start gap-3">
                         <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-[10px] font-bold text-white shrink-0">{opportunity.client.charAt(0)}</div>
                         <div className="flex-1 bg-white/5 p-3 rounded-xl rounded-tl-none border border-white/5">
                           <div className="flex items-center justify-between mb-1">
                             <div className="flex items-center gap-1.5 text-xs text-white bg-blue-500/20 px-2 py-0.5 rounded border border-blue-500/10">Creator</div>
                           </div>
                           <p className="text-sm text-gray-300 font-light">Yes, absolutely! As long as you have strong fundamentals in React hooks and component lifecycle, React Native is easy to pick up. We can give you a couple of days to ramp up.</p>
                         </div>
                       </div>
                     </div>
                  </div>
                </div>
              </motion.section>
            )}

          </div>
        </div>

        {/* --- RIGHT COLUMN (STICKY) --- */}
        <aside className="w-full lg:w-96 shrink-0 relative">
          <div className="sticky top-28 space-y-6">
            
            {/* Primary Action Card */}
            <div className="p-6 rounded-3xl bg-gray-900 border border-white/10 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full" />
               
               <div className="flex items-end justify-between mb-8">
                 <div>
                   <p className="text-sm font-medium text-gray-400 mb-1">Project Budget</p>
                   <h3 className="text-3xl font-display font-medium text-white">{opportunity.budget}</h3>
                 </div>
                 <div className="text-right">
                   <p className="text-sm font-medium text-gray-400 mb-1">Duration</p>
                   <h4 className="text-lg font-medium text-white">{opportunity.duration}</h4>
                 </div>
               </div>

               <div className="space-y-4 mb-8">
                 <div className="flex items-center justify-between text-sm">
                   <span className="text-gray-400 font-light flex items-center"><Calendar className="w-4 h-4 mr-2 text-gray-500"/> Start Date</span>
                   <span className="text-white font-medium">Immediate</span>
                 </div>
                 <div className="flex items-center justify-between text-sm">
                   <span className="text-gray-400 font-light flex items-center"><Clock className="w-4 h-4 mr-2 text-gray-500"/> Commitment</span>
                   <span className="text-white font-medium">~15 hrs/week</span>
                 </div>
                 <div className="flex items-center justify-between text-sm">
                   <span className="text-gray-400 font-light flex items-center"><Users className="w-4 h-4 mr-2 text-gray-500"/> Team Needed</span>
                   <span className="text-white font-medium">{opportunity.teamSizeNeeded} Builder</span>
                 </div>
                 <div className="flex items-center justify-between text-sm">
                   <span className="text-gray-400 font-light flex items-center"><Flag className="w-4 h-4 mr-2 text-gray-500"/> Deadline</span>
                   <span className="text-red-400 font-medium">{formatDate(opportunity.deadline)}</span>
                 </div>
               </div>

                <button 
                  onClick={() => {
                    if (!token) navigate("/login");
                    else setShowApplyModal(true);
                  }}
                  className="w-full h-14 rounded-xl bg-white text-black font-semibold text-lg hover:bg-gray-100 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] mb-4 flex items-center justify-center group relative overflow-hidden"
                >
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-50 -translate-x-full group-hover:animate-[shimmer_1s_infinite] pointer-events-none" />
                  Apply for this Role
                </button>
               
               <div className="flex items-center gap-3">
                 <button className="flex-1 h-12 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-sm font-medium transition-colors flex items-center justify-center">
                   <Bookmark className="w-4 h-4 mr-2" /> Save
                 </button>
                 <button className="flex-1 h-12 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-sm font-medium transition-colors flex items-center justify-center">
                   <Share className="w-4 h-4 mr-2" /> Share
                 </button>
               </div>
            </div>

            {/* Application Requirements */}
            <div className="p-6 rounded-3xl border border-white/10 bg-white/[0.02]">
              <h3 className="font-display font-medium text-white mb-4">Application Requirements</h3>
              <ul className="space-y-3 text-sm font-light text-gray-400 mb-6">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-gray-500"/> Short proposal message</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-gray-500"/> Resume / CV (PDF)</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-gray-500"/> Links to past projects</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-gray-500"/> GitHub profile</li>
              </ul>
              
              <div className="border border-white/10 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center bg-white/[0.01]">
                 <UploadCloud className="w-6 h-6 text-gray-500 mb-2" />
                 <p className="text-xs text-gray-400 font-light">Have an updated application ready?</p>
              </div>
            </div>

            {/* Trust & Creator */}
            <div className="p-6 rounded-3xl border border-white/10 bg-white/[0.02]">
              <div className="flex items-start justify-between mb-4">
                 <div className="w-12 h-12 rounded-full border border-white/10 bg-gradient-to-b from-gray-700 to-gray-800 flex items-center justify-center text-lg font-bold text-white shrink-0">
                    {opportunity.client.charAt(0)}
                 </div>
                 <div className="flex flex-col items-end">
                    <span className="text-xs font-medium bg-white/10 text-white px-2 py-1 rounded-md border border-white/10 mb-1 line-clamp-1 truncate w-[140px] text-right">
                       Startup Founder
                    </span>
                 </div>
              </div>
              <h3 className="font-medium text-white text-lg flex items-center">{opportunity.client} <BadgeCheck className="w-4 h-4 ml-1 text-blue-400" /></h3>
              <p className="text-sm font-light text-gray-400 mb-4 mt-1">Has hired 4 students previously. Fast responder.</p>
              
              <div className="grid grid-cols-2 gap-2 mb-6">
                 <div className="p-3 rounded-lg bg-white/5 border border-white/5 text-center">
                    <div className="text-lg font-medium text-white flex items-center justify-center">4.8 <Sparkles className="w-3.5 h-3.5 text-yellow-500 ml-1" /></div>
                    <div className="text-[10px] uppercase tracking-wider text-gray-500 mt-0.5">Rating</div>
                 </div>
                 <div className="p-3 rounded-lg bg-white/5 border border-white/5 text-center">
                    <div className="text-lg font-medium text-white">92%</div>
                    <div className="text-[10px] uppercase tracking-wider text-gray-500 mt-0.5">Hire Rate</div>
                 </div>
              </div>

              <button className="w-full py-2.5 text-sm font-medium text-gray-300 hover:text-white border border-white/10 rounded-xl hover:bg-white/5 transition-colors">
                Contact Creator
              </button>
            </div>

            {/* Report */}
            <button className="flex items-center text-xs font-medium text-gray-600 hover:text-gray-400 transition-colors mx-auto mt-6">
               <Flag className="w-3 h-3 mr-1.5" /> Report this opportunity
            </button>
          </div>
        </aside>

      </div>

      {/* --- SIMILAR OPPORTUNITIES --- */}
      <div className="max-w-[1200px] mx-auto px-4 mt-20 border-t border-white/5 pt-20">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl font-display font-medium text-white">Similar Opportunities</h2>
          <Link to="/marketplace" className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors">
            View all
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* We would fetch similar gigs here. For now rendering mock cards matching the new marketplace style */}
          {[1, 2, 3].map((item) => (
            <div key={item} className="group relative p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.04] hover:border-white/20 transition-all cursor-pointer">
              <div className="flex items-center justify-between gap-4 mb-4">
                 <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center shrink-0 border border-white/10 text-white font-bold text-sm">
                   {['S', 'V', 'M'][item - 1]}
                 </div>
                 <button className="text-gray-500 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors">
                   <Bookmark className="w-4 h-4" />
                 </button>
              </div>

              <h3 className="text-lg font-display font-medium text-white group-hover:text-blue-400 transition-colors leading-tight mb-2 line-clamp-2">
                {['Full Stack Developer for EdTech', 'UI Designer for Fintech Tool', 'React Native Mobile MVP'][item - 1]}
              </h3>

              <div className="flex flex-wrap items-center gap-2 mb-6">
                 <span className="px-2 py-1 bg-green-500/10 text-green-400 text-[10px] font-medium rounded-md border border-green-500/20">
                    {['₹1,00,000+', '₹50,000+', 'Equity'][item - 1]}
                 </span>
                 <span className="px-2 py-1 bg-white/5 text-gray-400 text-[10px] font-medium rounded-md border border-white/5">
                    {['Remote', 'Hybrid', 'Remote'][item - 1]}
                 </span>
                 <span className="px-2 py-1 bg-white/5 text-gray-400 text-[10px] font-medium rounded-md border border-white/5">
                    {['1-3 months', '2 weeks', 'Long term'][item - 1]}
                 </span>
              </div>

              <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                 <div className="text-xs text-gray-500 font-light flex items-center">
                   <Users className="w-3.5 h-3.5 mr-1" /> {['12', '4', '28'][item - 1]} applicants
                 </div>
                 <span className="text-[11px] font-medium text-gray-400 group-hover:text-white transition-colors">View details &rarr;</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Application Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-55 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-gray-900 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />
            
            <div className="mb-6">
              <h3 className="text-2xl font-display font-medium text-white mb-2">Apply for this Role</h3>
              <p className="text-gray-400 font-light text-sm">Submit your proposal directly to the founder.</p>
            </div>

            {submitSuccess ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-8 h-8 text-green-400" />
                </div>
                <h4 className="text-xl font-display font-medium text-white mb-2">Application Submitted!</h4>
                <p className="text-gray-400 font-light text-sm">Your proposal and details have been sent to {opportunity.client}.</p>
              </div>
            ) : (
              <form onSubmit={handleApply} className="space-y-5">
                {submitError && (
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-light">
                    {submitError}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Proposal Message</label>
                  <textarea
                    required
                    rows={4}
                    value={proposal}
                    onChange={(e) => setProposal(e.target.value)}
                    className="w-full bg-white/[0.02] border border-white/10 rounded-xl p-4 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:bg-blue-500/5 transition-all resize-none font-light"
                    placeholder="Tell the founder why you're a great fit, what skills you bring, and your availability..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">GitHub Profile Link</label>
                  <input
                    type="url"
                    required
                    value={githubLink}
                    onChange={(e) => setGithubLink(e.target.value)}
                    className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3 px-4 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:bg-blue-500/5 transition-all font-light"
                    placeholder="https://github.com/username"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Upload Resume (PDF only, max 5MB)</label>
                  <div className="border border-white/10 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center bg-white/[0.01] hover:bg-white/[0.03] transition-colors relative cursor-pointer">
                    <input
                      type="file"
                      required
                      accept=".pdf"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setResumeFile(e.target.files[0]);
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <UploadCloud className="w-6 h-6 text-gray-500 mb-2" />
                    <p className="text-xs text-gray-300 font-medium">
                      {resumeFile ? resumeFile.name : "Select PDF Document"}
                    </p>
                    <p className="text-[10px] text-gray-500 font-light mt-1">PDF format up to 5MB</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowApplyModal(false)}
                    className="flex-1 h-12 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="flex-1 h-12 rounded-xl bg-white text-black font-semibold text-sm hover:bg-gray-100 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center"
                  >
                    {submitLoading ? (
                      <div className="w-5 h-5 rounded-full border-2 border-black/20 border-t-black animate-spin" />
                    ) : (
                      "Submit Application"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
