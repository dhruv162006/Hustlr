import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import { 
  Users, Activity, ShieldAlert, BarChart3, DollarSign, Settings,
  AlertTriangle, CheckCircle2, ChevronRight, Search, 
  Terminal, Shield, FileText, Globe, Key, Zap, Bell, Database, Server, CreditCard, Flag, UserX, UserCheck
} from "lucide-react";
import { cn } from "@/src/lib/utils";

import { useAuth } from "../context/AuthContext";

export function Admin() {
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState("Overview");
  const [analytics, setAnalytics] = useState<any>({
    students: 0,
    founders: 0,
    recruiters: 0,
    activeGigs: 0,
    pendingReports: 0,
    pendingVerifications: 0,
    volumeGMV: "₹12.4 Lakhs"
  });
  const [reports, setReports] = useState<any[]>([]);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchAdminData = () => {
    if (!token) return;
    setLoading(true);
    setError("");

    const p1 = fetch("/api/admin/analytics", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
    const p2 = fetch("/api/admin/reports", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
    const p3 = fetch("/api/admin/verifications", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());

    Promise.all([p1, p2, p3])
      .then(([analyticsData, reportsData, verificationsData]) => {
        if (analyticsData && !analyticsData.error) setAnalytics(analyticsData);
        if (Array.isArray(reportsData)) setReports(reportsData);
        if (Array.isArray(verificationsData)) setVerifications(verificationsData);
      })
      .catch((err) => {
        setError(err.message || "Failed to load admin workspace logs.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleApproveVerification = async (id: string) => {
    if (!token) return;
    try {
      const response = await fetch(`/api/admin/verifications/${id}/approve`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Failed to approve verification");
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || "Approve failed");
    }
  };

  const handleResolveReport = async (id: string, actionStatus: "RESOLVED" | "DISMISSED") => {
    if (!token) return;
    try {
      const response = await fetch(`/api/admin/reports/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: actionStatus })
      });
      if (!response.ok) throw new Error("Failed to resolve report");
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || "Action failed");
    }
  };

  useEffect(() => {
    if (token && user?.role === "ADMIN") {
      fetchAdminData();
    }
  }, [token, user]);

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="bg-[#07090E] min-h-screen text-gray-200 flex flex-col items-center justify-center p-6 text-center font-sans w-full">
        <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-6">
          <ShieldAlert className="w-10 h-10 text-rose-500 animate-pulse" />
        </div>
        <h2 className="text-3xl font-display font-medium text-white mb-2">Restricted Security Portal</h2>
        <p className="text-gray-400 font-light mb-8 max-w-md">Your user account does not possess the ADMIN credentials required to access the Platform Command Center.</p>
        <Link 
          to="/dashboard" 
          className="px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 transition-all active:scale-95 shadow-lg"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const menuItems = [
    { title: "Overview", icon: BarChart3, id: "Overview" },
    { title: "Student Verifications", icon: UserCheck, id: "Verifications" },
    { title: "Platform Health", icon: Activity, id: "Health" },
    { title: "Moderation Queue", icon: ShieldAlert, id: "Moderation" },
  ];

  return (
    <div className="flex h-screen bg-[#07090E] text-gray-200 overflow-hidden font-sans selection:bg-purple-500/30">
      
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-white/5 bg-[#0B0F19] hidden md:flex flex-col shrink-0 z-20">
         <div className="h-16 flex items-center px-6 border-b border-white/5 bg-gray-950/50">
           <Link to="/dashboard" className="flex items-center gap-2 text-white font-display font-medium hover:text-purple-400 transition-colors">
              <div className="w-6 h-6 bg-gradient-to-tr from-purple-600 to-rose-600 rounded flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Terminal className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-lg">HUSTLR <span className="text-xs font-mono text-purple-400 ml-1">ADMIN</span></span>
           </Link>
         </div>
         
         <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 scrollbar-hide">
             <div className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 shadow-sm">Command Center</div>
             {menuItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors group",
                    activeTab === item.id 
                       ? "bg-purple-500/10 text-purple-400" 
                       : "text-gray-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <item.icon className={cn("w-4 h-4", activeTab === item.id ? "text-purple-400" : "text-gray-500 group-hover:text-gray-300")} />
                  {item.title}
                  {item.id === "Moderation" && <span className="ml-auto bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-md font-bold">12</span>}
                  {item.id === "Alerts" && <span className="ml-auto bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-md font-bold">3</span>}
                </button>
             ))}

             <div className="mt-8 px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 shadow-sm">Settings</div>
             <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                 <Settings className="w-4 h-4 text-gray-500" /> Platform Config
             </button>
         </div>

         <div className="p-4 border-t border-white/5 bg-gray-950/30">
             <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors border border-white/5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center font-bold text-sm text-purple-400">
                   <Key className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">Super Admin</p>
                  <p className="text-xs text-purple-400 truncate">System Access</p>
                </div>
             </div>
         </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 relative z-10">
         
         {/* HEADER */}
         <header className="h-16 shrink-0 border-b border-white/5 px-6 flex items-center justify-between bg-[#0B0F19]/80 backdrop-blur-md z-20">
            <div className="flex items-center gap-4">
              <h1 className="font-display font-medium text-white text-lg">
                {menuItems.find(i => i.id === activeTab)?.title}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-medium text-emerald-400">All Systems Operational</span>
              </div>
              <div className="w-px h-6 bg-white/10 hidden md:block" />
              <button className="relative w-9 h-9 rounded-xl hover:bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                <Bell className="w-4 h-4" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 border border-black" />
              </button>
            </div>
         </header>

         {/* CONTENT SCROLL AREA */}
         <div className="flex-1 overflow-auto bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.03)_0%,transparent_80%)] relative">
            <div className="p-6 md:p-8 max-w-[1600px] mx-auto">
              
              {/* --- OVERVIEW TAB --- */}
              {activeTab === "Overview" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                  
                  {/* Topline Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: "Total Students", value: String(analytics.students), trend: "+12.5%", trendUp: true, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
                      { label: "Total Founders", value: String(analytics.founders), trend: "+8.2%", trendUp: true, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
                      { label: "Active Opportunities", value: String(analytics.activeGigs), trend: "+15.1%", trendUp: true, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
                      { label: "Pending Verifications", value: String(analytics.pendingVerifications), trend: "+4.2%", trendUp: true, color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20" }
                    ].map((stat, i) => (
                      <div key={i} className="rounded-2xl border border-white/5 bg-white/[0.01] p-5 relative overflow-hidden">
                        <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} blur-[40px] rounded-full -mr-12 -mt-12 pointer-events-none`} />
                        <p className="text-sm font-medium text-gray-400 mb-2">{stat.label}</p>
                        <div className="flex items-end justify-between">
                          <p className="text-3xl font-display font-medium text-white">{stat.value}</p>
                          <span className={cn("text-xs font-semibold px-2 py-1 rounded-md text-emerald-400 bg-emerald-500/10")}>
                            {stat.trend}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Platform Health & AI Assistant */}
                    <div className="lg:col-span-2 space-y-8">
                       
                       {/* AI Admin Assistant */}
                       <div className="rounded-3xl border border-purple-500/20 bg-gradient-to-r from-purple-900/20 to-black p-6 relative overflow-hidden">
                           <div className="flex items-center gap-3 mb-4">
                              <Zap className="w-5 h-5 text-purple-400 relative z-10" />
                              <h3 className="font-display font-medium text-white relative z-10">AI Security & Growth Insights</h3>
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                              <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                                 <div className="flex justify-between items-start mb-2">
                                   <span className="text-xs font-semibold text-rose-400 bg-rose-500/10 px-2 py-1 rounded">Fraud Risk Alert</span>
                                   <span className="text-[10px] text-gray-500">2m ago</span>
                                 </div>
                                 <p className="text-sm text-gray-300">Detected 45 newly registered accounts from a single IP subnet attempting to publish duplicate UI/UX gigs. Auto-flagged for review.</p>
                                 <button className="mt-3 text-xs font-medium text-purple-400 hover:text-purple-300">Review Batch &rarr;</button>
                              </div>
                              <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                                 <div className="flex justify-between items-start mb-2">
                                   <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">Growth Signal</span>
                                   <span className="text-[10px] text-gray-500">1h ago</span>
                                 </div>
                                 <p className="text-sm text-gray-300">Surge in "React Native" search queries (+400% week-over-week). Consider pinning standard React Native opportunity templates.</p>
                              </div>
                           </div>
                       </div>

                       {/* Recent Audit Logs */}
                       <div className="rounded-2xl border border-white/5 bg-white/[0.01]">
                          <div className="p-5 border-b border-white/5 flex items-center justify-between">
                            <h3 className="font-medium text-white">Audit Log</h3>
                            <button className="text-xs font-medium text-purple-400">View Full Log</button>
                          </div>
                          <div className="p-0">
                            <table className="w-full text-left text-sm">
                              <thead className="bg-white/[0.02] text-gray-400 text-xs uppercase tracking-wider">
                                <tr>
                                  <th className="px-5 py-3 font-medium">Action</th>
                                  <th className="px-5 py-3 font-medium">Target</th>
                                  <th className="px-5 py-3 font-medium">Admin</th>
                                  <th className="px-5 py-3 font-medium">Time</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5">
                                {[
                                  { action: "User Banned", target: "u_94821", admin: "Super Admin", time: "10m ago" },
                                  { action: "Gig Approved", target: "g_11029", admin: "Mod_Priya", time: "25m ago" },
                                  { action: "Refund Issued", target: "txn_0091", admin: "Fin_Rahul", time: "1h ago" },
                                  { action: "System Update", target: "Core API", admin: "System", time: "3h ago" },
                                ].map((log, i) => (
                                  <tr key={i} className="hover:bg-white/[0.02]">
                                    <td className="px-5 py-3 text-gray-200">{log.action}</td>
                                    <td className="px-5 py-3 text-gray-400 font-mono text-xs">{log.target}</td>
                                    <td className="px-5 py-3 text-gray-400">{log.admin}</td>
                                    <td className="px-5 py-3 text-gray-500">{log.time}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                       </div>

                    </div>

                    {/* Pending Verification & Status */}
                    <div className="space-y-8">
                       <div className="rounded-2xl border border-white/5 bg-white/[0.01]">
                         <div className="p-5 border-b border-white/5 flex items-center justify-between">
                            <h3 className="font-medium text-white">Pending Verifications</h3>
                            <span className="bg-white/10 text-white text-xs px-2 py-0.5 rounded-full">{verifications.length} Pending</span>
                         </div>
                         <div className="divide-y divide-white/5">
                            {verifications.slice(0, 3).map((req, i) => (
                              <div key={i} className="p-4 flex items-center justify-between hover:bg-white/[0.02]">
                                <div>
                                  <p className="text-sm font-medium text-gray-200">{req.name}</p>
                                  <p className="text-xs text-gray-500">{req.university}</p>
                                </div>
                                <div className="text-right">
                                  <button 
                                    onClick={() => handleApproveVerification(req.id)}
                                    className="text-xs text-purple-400 font-medium hover:text-purple-300 mt-1 cursor-pointer"
                                  >
                                    Approve
                                  </button>
                                </div>
                              </div>
                            ))}
                            {verifications.length === 0 && (
                              <div className="p-4 text-center text-xs text-gray-500">No requests</div>
                            )}
                         </div>
                       </div>
                       
                       <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-5">
                         <h3 className="font-medium text-white mb-4">Live Infrastructure</h3>
                         <div className="space-y-4">
                           <div>
                             <div className="flex justify-between text-xs text-gray-400 mb-1">
                               <span>Database Load</span>
                               <span className="text-emerald-400">24%</span>
                             </div>
                             <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                               <div className="h-full w-[24%] bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                             </div>
                           </div>
                           <div>
                             <div className="flex justify-between text-xs text-gray-400 mb-1">
                               <span>API Gateway</span>
                               <span className="text-emerald-400">12ms latency</span>
                             </div>
                             <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                               <div className="h-full w-[15%] bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                             </div>
                           </div>
                           <div>
                             <div className="flex justify-between text-xs text-gray-400 mb-1">
                               <span>WebSocket Conn.</span>
                               <span className="text-yellow-400">82% Cap</span>
                             </div>
                             <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                               <div className="h-full w-[82%] bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
                             </div>
                           </div>
                         </div>
                       </div>
                    </div>
                  </div>
                </motion.div>
              )}


              {/* --- VERIFICATIONS TAB --- */}
              {activeTab === "Verifications" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-4 justify-between">
                    <h2 className="text-xl font-display font-medium text-white">Pending Student Verifications</h2>
                  </div>

                  <div className="rounded-2xl border border-white/5 bg-white/[0.01] overflow-hidden">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                       <thead className="bg-white/[0.02] text-gray-400 text-xs uppercase tracking-wider border-b border-white/5">
                         <tr>
                           <th className="px-6 py-4 font-medium text-gray-300">Student Name</th>
                           <th className="px-6 py-4 font-medium text-gray-300">Email</th>
                           <th className="px-6 py-4 font-medium text-gray-300">University / College</th>
                           <th className="px-6 py-4 font-medium text-gray-300">Graduation Year</th>
                           <th className="px-6 py-4 font-medium text-gray-300 text-right">Actions</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-white/5">
                         {verifications.map((req) => (
                           <tr key={req.id} className="hover:bg-white/[0.02] transition-colors">
                             <td className="px-6 py-4">
                               <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center font-bold text-xs text-white border border-white/10">
                                   {req.name.charAt(0)}
                                 </div>
                                 <span className="font-medium text-white">{req.name}</span>
                               </div>
                             </td>
                             <td className="px-6 py-4 text-gray-400 font-mono text-xs">{req.email}</td>
                             <td className="px-6 py-4 text-gray-300">{req.university}</td>
                             <td className="px-6 py-4 text-gray-400">{req.gradYear}</td>
                             <td className="px-6 py-4 text-right">
                               <div className="flex items-center justify-end gap-2">
                                 <button 
                                   onClick={() => handleApproveVerification(req.id)}
                                   className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                                 >
                                    Verify Profile
                                 </button>
                               </div>
                             </td>
                           </tr>
                         ))}
                         {verifications.length === 0 && (
                           <tr>
                             <td colSpan={5} className="text-center py-10 text-gray-500 font-light">No pending verification requests found.</td>
                           </tr>
                         )}
                       </tbody>
                    </table>
                  </div>
                </motion.div>
              )}


              {/* --- MODERATION TAB --- */}
              {activeTab === "Moderation" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <div className="p-5 bg-rose-500/5 border border-rose-500/20 rounded-2xl">
                         <AlertTriangle className="w-6 h-6 text-rose-400 mb-3" />
                         <h3 className="text-2xl font-display font-medium text-white mb-1">
                           {reports.filter(r => r.status === "PENDING").length}
                         </h3>
                         <p className="text-sm text-gray-400">Pending Flags</p>
                      </div>
                      <div className="p-5 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl">
                         <Flag className="w-6 h-6 text-yellow-400 mb-3" />
                         <h3 className="text-2xl font-display font-medium text-white mb-1">
                           {reports.length}
                         </h3>
                         <p className="text-sm text-gray-400">Total System Logs</p>
                      </div>
                      <div className="p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                         <CheckCircle2 className="w-6 h-6 text-emerald-400 mb-3" />
                         <h3 className="text-2xl font-display font-medium text-white mb-1">
                           {reports.filter(r => r.status === "RESOLVED").length}
                         </h3>
                         <p className="text-sm text-gray-400">Resolved Reports</p>
                      </div>
                    </div>

                    <h3 className="text-lg font-display font-medium text-white mb-4">Active Reports Desk</h3>
                    <div className="space-y-4">
                       {reports.map((report) => (
                         <div key={report.id} className="p-6 rounded-2xl bg-white/[0.01] border border-white/5 flex flex-col md:flex-row gap-6 justify-between">
                            <div className="flex-1 space-y-3">
                              <div className="flex items-center gap-3">
                                 <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider", report.status === 'PENDING' ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20")}>
                                   {report.status}
                                 </span>
                                 <span className="text-sm font-medium text-gray-300">Reporter: {report.reporter}</span>
                                 <span className="text-xs text-gray-500 border-l border-white/10 pl-3">Date: {report.date}</span>
                              </div>
                              <h4 className="text-base font-medium text-white font-mono">{report.reportedTarget}</h4>
                              <p className="text-sm text-gray-400 leading-relaxed max-w-3xl">{report.reason}</p>
                            </div>
                            {report.status === "PENDING" && (
                              <div className="flex flex-col gap-2 shrink-0 md:w-48">
                                <button 
                                  onClick={() => handleResolveReport(report.id, "RESOLVED")}
                                  className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer"
                                >
                                  Resolve Flag
                                </button>
                                <button 
                                  onClick={() => handleResolveReport(report.id, "DISMISSED")}
                                  className="w-full py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer"
                                >
                                  Dismiss Report
                                </button>
                              </div>
                            )}
                         </div>
                       ))}
                       {reports.length === 0 && (
                         <div className="text-center py-10 text-gray-500 font-light">No reported items found.</div>
                       )}
                    </div>
                </motion.div>
              )}


              {/* Placeholder for other tabs */}
              {!["Overview", "Verifications", "Moderation"].includes(activeTab) && (
                <div className="h-[60vh] flex flex-col items-center justify-center text-center p-8">
                   <div className="w-24 h-24 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-center mb-6 shadow-2xl">
                     <Shield className="w-10 h-10 text-gray-600" />
                   </div>
                   <h2 className="text-3xl font-display font-medium text-white mb-3">Admin {activeTab} Module</h2>
                   <p className="text-gray-400 font-light max-w-lg mx-auto text-lg leading-relaxed">
                     This highly-sensitive command interface is used for managing platform {activeTab.toLowerCase()}. Access is strictly audited.
                   </p>
                </div>
              )}

            </div>
         </div>
      </main>
    </div>
  );
}
