import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  CheckCircle2, Clock, DollarSign, Star, TrendingUp, ArrowRight,
  Briefcase, MessageSquare, Bell, Zap, Calendar, Activity,
  Target, Award, Search, Hash, ChevronRight, UserPlus, FileText,
  MapPin, GraduationCap, X, Plus, LayoutTemplate, Layers, GitPullRequest,
  Box, Users, Settings, Filter, MoreHorizontal, Circle, Flag, Folder, Video, Sparkles
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";

type Status = "Backlog" | "Todo" | "In Progress" | "Review" | "Completed";

interface Task {
  id: string;
  title: string;
  desc: string;
  status: Status;
  priority: "High" | "Medium" | "Low";
  assignees: string[];
}

export function Workspace() {
  const { id: teamId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  
  const [activeTab, setActiveTab] = useState("Overview");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const socketRef = useRef<any>(null);
  
  const [team, setTeam] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // New task form states
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskPriority, setTaskPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const [taskAssignee, setTaskAssignee] = useState("");
  const [taskLoading, setTaskLoading] = useState(false);

  const mapDbStatusToFrontend = (status: string): Status => {
    switch (status) {
      case "BACKLOG": return "Backlog";
      case "TODO": return "Todo";
      case "IN_PROGRESS": return "In Progress";
      case "REVIEW": return "Review";
      case "COMPLETED": return "Completed";
      default: return "Todo";
    }
  };

  const mapDbPriorityToFrontend = (priority: string): "High" | "Medium" | "Low" => {
    switch (priority) {
      case "HIGH": return "High";
      case "MEDIUM": return "Medium";
      case "LOW": return "Low";
      default: return "Medium";
    }
  };

  const fetchWorkspace = () => {
    if (!token || !teamId) return;
    setLoading(true);
    setError("");
    fetch(`/api/teams/${teamId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "Failed to load workspace");
        return data;
      })
      .then((data) => {
        setTeam(data);
        if (data.tasks) {
          setTasks(data.tasks.map((t: any) => ({
            id: t.id,
            title: t.title,
            desc: t.description || "",
            status: mapDbStatusToFrontend(t.status),
            priority: mapDbPriorityToFrontend(t.priority),
            assignees: t.assignee ? [t.assignee.name.charAt(0)] : ["U"]
          })));
        }
      })
      .catch((err: any) => {
        setError(err.message || "Failed to load workspace.");
      })
      .finally(() => {
        setLoading(false);
      });
    };

  const handleDragStart = (id: string) => {
    setDraggedTaskId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (status: Status) => {
    if (draggedTaskId && token) {
      const prevDraggedId = draggedTaskId;
      
      // Optimistic Update
      setTasks(prev => prev.map(t => t.id === prevDraggedId ? { ...t, status } : t));
      setDraggedTaskId(null);

      try {
        const response = await fetch(`/api/teams/tasks/${prevDraggedId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ status: status.toUpperCase().replace(/ /g, "_") })
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to update status");
        }
        if (socketRef.current) {
          socketRef.current.emit("move_task", {
            teamId,
            taskId: prevDraggedId,
            status: status.toUpperCase().replace(/ /g, "_")
          });
        }
      } catch (err: any) {
        console.error("Failed to update status:", err);
        fetchWorkspace();
      }
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !teamId) return;
    setTaskLoading(true);
    try {
      const response = await fetch(`/api/teams/${teamId}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: taskTitle,
          description: taskDesc,
          dueDate: null,
          assigneeId: taskAssignee || null
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to create task");
      }
      fetchWorkspace();
      setShowTaskModal(false);
      setTaskTitle("");
      setTaskDesc("");
      setTaskAssignee("");
    } catch (err: any) {
      alert(err.message || "Failed to create task");
    } finally {
      setTaskLoading(false);
    }
  };

  useEffect(() => {
    if (!token || !teamId) return;
    fetchWorkspace();

    const socket = io({
      auth: { token }
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join_team", teamId);
    });

    socket.on("task_moved", (data: { taskId: string; status: string }) => {
      setTasks(prev => prev.map(t => t.id === data.taskId ? { ...t, status: mapDbStatusToFrontend(data.status) } : t));
    });

    return () => {
      socket.emit("leave_team", teamId);
      socket.disconnect();
    };
  }, [token, teamId]);

  const stats = [
    { label: "Completion Goal", value: team?.tasks?.length ? `${Math.round((team.tasks.filter((t: any) => t.status === "COMPLETED").length / team.tasks.length) * 100)}%` : "0%", icon: Target, color: "text-blue-400" },
    { label: "Total Tasks", value: team?.tasks?.length ? String(team.tasks.length) : "0", icon: Activity, color: "text-emerald-400" },
    { label: "Done Tasks", value: team?.tasks?.length ? String(team.tasks.filter((t: any) => t.status === "COMPLETED").length) : "0", icon: CheckCircle2, color: "text-purple-400" },
  ];

  const columns: { title: Status; color: string }[] = [
    { title: "Backlog", color: "bg-gray-500/10 text-gray-400 border-gray-500/20" },
    { title: "Todo", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
    { title: "In Progress", color: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
    { title: "Review", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
    { title: "Completed", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  ];

  return (
    <div className="flex h-screen bg-gray-950 text-gray-200 overflow-hidden font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-white/5 bg-[#0B0F19] hidden md:flex flex-col shrink-0 z-20">
         <div className="h-16 flex items-center px-6 border-b border-white/5">
           <Link to="/dashboard" className="flex items-center gap-2 text-white font-display font-medium hover:text-blue-400 transition-colors">
              <div className="w-6 h-6 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded flex items-center justify-center shadow-lg">
                <Box className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg">HUSTLR</span>
           </Link>
         </div>
         
         <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 scrollbar-hide">
            
            <div className="space-y-1">
              <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Workspace</div>
              {[
                { name: "Overview", icon: LayoutTemplate },
                { name: "Tasks", icon: CheckCircle2 },
                { name: "Roadmap", icon: Activity },
                { name: "Discussions", icon: MessageSquare },
                { name: "Files", icon: Folder },
              ].map(item => (
                <button
                  key={item.name}
                  onClick={() => setActiveTab(item.name)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors",
                    activeTab === item.name ? "bg-white/10 text-white shadow-sm" : "text-gray-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <item.icon className={cn("w-4 h-4", activeTab === item.name ? "text-blue-400" : "text-gray-500")} />
                  {item.name}
                  {item.name === "Tasks" && <span className="ml-auto bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{tasks.filter(t => t.status !== 'Completed').length}</span>}
                </button>
              ))}
            </div>

            <div className="space-y-1">
              <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Team</div>
              {[
                { name: "Members", icon: Users },
                { name: "Calendar", icon: Calendar },
                { name: "Settings", icon: Settings },
              ].map(item => (
                <button
                  key={item.name}
                  onClick={() => setActiveTab(item.name)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors",
                    activeTab === item.name ? "bg-white/10 text-white shadow-sm" : "text-gray-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <item.icon className="w-4 h-4 text-gray-500" />
                  {item.name}
                </button>
              ))}
            </div>
         </div>

          <div className="p-4 border-t border-white/5">
              <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors">
                 <div className={`w-8 h-8 rounded flex items-center justify-center font-bold text-sm border border-white/10 ${user?.avatarGradient || "bg-gray-800 text-white"}`}>
                   {user?.name?.charAt(0) || "U"}
                 </div>
                 <div className="flex-1 min-w-0">
                   <p className="text-sm font-medium text-white truncate">{user?.name || "User"}</p>
                   <p className="text-xs text-gray-500 truncate">{user?.role || "Developer"}</p>
                 </div>
              </div>
          </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0B0F19] relative z-10 shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
         
         {/* HEADER */}
         <header className="h-16 shrink-0 border-b border-white/5 px-6 flex items-center justify-between bg-gray-950/80 backdrop-blur-md z-20">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">
                {team?.name?.charAt(0) || "N"}
              </div>
              <div>
                <h1 className="font-display font-medium text-white text-lg leading-tight flex items-center gap-2">
                  {team?.name || "Nexus AI"} <span className="px-1.5 py-0.5 rounded border border-orange-500/20 bg-orange-500/10 text-[9px] uppercase tracking-wider text-orange-400">Workspace</span>
                </h1>
                <p className="text-xs font-light text-gray-400 truncate max-w-[200px] sm:max-w-md">{team?.description || "Collaboration Workspace"} • {team?.members?.length || 1} Members</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden lg:flex -space-x-2 mr-4">
                  {team?.members?.map((m: any, i: number) => (
                    <div key={i} title={`${m.user?.name} - ${m.role}`} className="w-8 h-8 rounded-full border-2 border-gray-950 bg-gray-800 flex items-center justify-center text-xs font-medium text-white ring-1 ring-white/10 relative z-10 hover:z-20 transition-transform hover:scale-110 cursor-pointer">
                      {m.user?.name?.charAt(0) || "M"}
                    </div>
                  ))}
                  <div className="w-8 h-8 rounded-full border-2 border-gray-950 bg-white/5 flex items-center justify-center text-xs font-medium text-gray-400 ring-1 ring-white/10 relative z-0 hover:bg-white/10 cursor-pointer border-dashed">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
              </div>

              <button className="h-9 px-4 rounded-lg bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors flex items-center text-sm">
                 <Video className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Meet</span>
              </button>
              <button 
                onClick={() => setShowTaskModal(true)}
                className="h-9 px-4 rounded-lg bg-white text-black font-semibold hover:bg-gray-100 active:scale-95 transition-all flex items-center text-sm shadow-[0_0_15px_rgba(255,255,255,0.1)] cursor-pointer"
              >
                 <Plus className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">New Task</span>
              </button>
            </div>
         </header>

         {/* CONTENT AREA */}
         <div className="flex-1 overflow-auto bg-[radial-gradient(ellipse_at_top,rgba(0,100,255,0.03)_0%,transparent_80%)]">
            <div className="h-full">
              
              {/* --- OVERVIEW TAB --- */}
              {activeTab === "Overview" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {stats.map((stat, i) => (
                      <div key={i} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-4">
                        <div className={cn("w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0")}>
                          <stat.icon className={cn("w-6 h-6", stat.color)} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-400">{stat.label}</p>
                          <p className="text-2xl font-display font-medium text-white">{stat.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                     
                     {/* Left Content */}
                     <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white/[0.01] rounded-3xl border border-white/5 p-8">
                           <h2 className="text-xl font-display font-medium text-white mb-4">Project Mission</h2>
                           <p className="text-gray-400 font-light leading-relaxed mb-6">
                             We are building an AI-powered study assistant that helps university students summarize lectures, generate flashcards, and prep for exams in half the time. The MVP is targeting CS 101 students.
                           </p>
                           <h3 className="text-sm font-medium text-white mb-3">Current Milestones</h3>
                           <div className="space-y-4 relative before:absolute before:inset-y-0 before:left-2.5 before:w-px before:bg-white/10">
                              {[
                                { title: "Idea Validation & User Research", status: "completed" },
                                { title: "Core Features MVP (React + Node)", status: "current" },
                                { title: "Beta Launch at Stanford", status: "upcoming" },
                                { title: "500 Weekly Active Users", status: "upcoming" }
                              ].map((m, i) => (
                                <div key={i} className="flex gap-4 relative z-10 items-center">
                                  <div className={cn(
                                    "w-5 h-5 rounded-full flex items-center justify-center shrink-0 border-2 bg-gray-950",
                                    m.status === 'completed' ? "border-emerald-500" : m.status === 'current' ? "border-blue-500" : "border-white/20"
                                  )}>
                                    {m.status === 'completed' && <div className="w-2 h-2 bg-emerald-500 rounded-full" />}
                                    {m.status === 'current' && <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />}
                                  </div>
                                  <span className={cn("text-sm", m.status === 'upcoming' ? "text-gray-500 font-light" : "text-gray-200 font-medium")}>{m.title}</span>
                                </div>
                              ))}
                           </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white/[0.01] rounded-3xl border border-white/5 p-6">
                           <h2 className="text-lg font-display font-medium text-white mb-5">Recent Activity</h2>
                           <div className="space-y-5">
                             {[
                               { action: "Priya completed task", target: "Design Landing Page", time: "2h ago", icon: CheckCircle2, color: "text-emerald-400" },
                               { action: "Dhruv uploaded file", target: "auth_diagram.pdf", time: "5h ago", icon: FileText, color: "text-blue-400" },
                               { action: "Karan joined the team", target: "as Backend Engineer", time: "1d ago", icon: UserPlus, color: "text-purple-400" }
                             ].map((act, i) => (
                               <div key={i} className="flex gap-4 items-start">
                                 <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mt-0.5">
                                   <act.icon className={cn("w-4 h-4", act.color)} />
                                 </div>
                                 <div>
                                   <p className="text-sm text-gray-200">
                                     <span className="font-medium">{act.action}</span> <span className="text-gray-400">{act.target}</span>
                                   </p>
                                   <span className="text-xs text-gray-500">{act.time}</span>
                                 </div>
                               </div>
                             ))}
                           </div>
                        </div>
                     </div>
                     
                     {/* Right Content */}
                     <div className="space-y-8">
                        {/* AI Assistant Card */}
                        <div className="rounded-3xl border border-blue-500/20 bg-gradient-to-b from-blue-900/20 to-[#0B0F19] p-6 relative overflow-hidden">
                           <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[40px] pointer-events-none rounded-full" />
                           <div className="flex items-center gap-2 mb-4 relative z-10">
                              <Zap className="w-5 h-5 text-blue-400" />
                              <h3 className="font-medium text-white">AI Project Assistant</h3>
                           </div>
                           <div className="space-y-3 relative z-10">
                              <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                                <div className="flex items-center gap-2 mb-1">
                                  <Activity className="w-3.5 h-3.5 text-yellow-500" />
                                  <span className="text-xs font-medium text-yellow-500">Risk Detected</span>
                                </div>
                                <p className="text-xs text-gray-400 font-light leading-relaxed">The "Implement Google Auth" task is taking longer than expected. Consider pairing up on it to avoid delaying the Beta Launch milestone.</p>
                              </div>
                              <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                                <div className="flex items-center gap-2 mb-1">
                                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                                  <span className="text-xs font-medium text-emerald-500">Task Summary</span>
                                </div>
                                <p className="text-xs text-gray-400 font-light leading-relaxed">Team velocity is up 15% this week. Great job closing out the UI design tickets!</p>
                              </div>
                           </div>
                           <button className="w-full mt-4 py-2 border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-medium rounded-xl hover:bg-blue-500/20 transition-colors">
                             Generate Weekly Report
                           </button>
                        </div>
                     </div>
                  </div>
                </motion.div>
              )}

              {/* --- TASKS KANBAN TAB --- */}
              {activeTab === "Tasks" && (
                <div className="h-full flex flex-col p-6">
                  <div className="flex items-center justify-between mb-6 shrink-0">
                    <div className="flex items-center gap-4">
                      <h2 className="text-2xl font-display font-medium text-white">Sprint 4 Board</h2>
                      <div className="hidden sm:flex items-center gap-1 bg-white/5 rounded-lg p-1 border border-white/10">
                        <button className="px-3 py-1.5 rounded-md text-xs font-medium bg-white/10 text-white">Board</button>
                        <button className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-400 hover:text-white transition-colors">List</button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="relative hidden sm:block">
                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                         <input type="text" placeholder="Search tasks..." className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-white/20 text-white" />
                       </div>
                       <button className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl flex items-center text-sm font-medium text-white hover:bg-white/10">
                         <Filter className="w-4 h-4 sm:mr-2" />
                         <span className="hidden sm:inline">Filter</span>
                       </button>
                    </div>
                  </div>

                  <div className="flex-1 flex gap-6 overflow-x-auto overflow-y-hidden pb-4">
                    {columns.map(col => {
                      const colTasks = tasks.filter(t => t.status === col.title);
                      
                      return (
                        <div 
                          key={col.title}
                          className="flex-1 min-w-[280px] max-w-[350px] flex flex-col bg-white/[0.01] rounded-2xl border border-white/5 relative"
                          onDragOver={handleDragOver}
                          onDrop={() => handleDrop(col.title)}
                        >
                          <div className="p-4 flex items-center justify-between border-b border-white/5">
                            <div className="flex items-center gap-2">
                              <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border", col.color)}>{col.title}</span>
                              <span className="text-xs text-gray-500 font-medium">{colTasks.length}</span>
                            </div>
                            <button className="text-gray-500 hover:text-white p-1 rounded hover:bg-white/10">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="flex-1 p-3 overflow-y-auto space-y-3 scrollbar-hide">
                            {colTasks.map(task => (
                              <div 
                                key={task.id}
                                draggable
                                onDragStart={() => handleDragStart(task.id)}
                                className={cn(
                                  "bg-gray-900 border border-white/10 rounded-xl p-4 cursor-grab active:cursor-grabbing hover:border-white/20 transition-all shadow-sm group",
                                  draggedTaskId === task.id ? "opacity-50" : "opacity-100"
                                )}
                              >
                                {task.priority && (
                                  <div className={cn(
                                    "px-2 py-0.5 rounded w-fit text-[9px] uppercase tracking-wider font-bold mb-3 border",
                                    task.priority === 'High' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                                    task.priority === 'Medium' ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                                    "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                  )}>
                                    {task.priority} Priority
                                  </div>
                                )}
                                <h4 className="text-sm font-medium text-white mb-2 leading-snug group-hover:text-blue-400 transition-colors">{task.title}</h4>
                                <p className="text-xs text-gray-500 font-light line-clamp-2 mb-4 leading-relaxed">{task.desc}</p>
                                
                                <div className="flex items-center justify-between mt-auto">
                                   <div className="flex -space-x-2">
                                     {task.assignees.map((a, i) => (
                                       <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border-2 border-gray-900 flex items-center justify-center text-[9px] font-bold text-white shadow-sm">
                                         {a}
                                       </div>
                                     ))}
                                   </div>
                                   <div className="flex items-center gap-3">
                                      {task.status === 'Completed' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                                      <MessageSquare className="w-3.5 h-3.5 text-gray-600" />
                                   </div>
                                </div>
                              </div>
                            ))}
                            <button 
                              onClick={() => setShowTaskModal(true)}
                              className="w-full py-2.5 flex items-center justify-center gap-2 text-xs font-medium text-gray-500 hover:text-white hover:bg-white/5 rounded-xl border border-dashed border-white/10 transition-colors cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" /> Add Task
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* --- PLACEHOLDERS FOR OTHER TABS --- */}
              {["Roadmap", "Discussions", "Files", "Members", "Calendar", "Settings"].includes(activeTab) && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center p-8 text-center bg-gray-950/50">
                   <div className="w-24 h-24 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-center mb-6 shadow-2xl">
                     {activeTab === "Roadmap" && <Flag className="w-10 h-10 text-gray-600" />}
                     {activeTab === "Discussions" && <MessageSquare className="w-10 h-10 text-gray-600" />}
                     {activeTab === "Files" && <FileText className="w-10 h-10 text-gray-600" />}
                     {activeTab === "Members" && <Users className="w-10 h-10 text-gray-600" />}
                     {activeTab === "Calendar" && <Calendar className="w-10 h-10 text-gray-600" />}
                     {activeTab === "Settings" && <Settings className="w-10 h-10 text-gray-600" />}
                   </div>
                   <h2 className="text-3xl font-display font-medium text-white mb-3">Workspace {activeTab}</h2>
                   <p className="text-gray-400 font-light max-w-lg mx-auto text-lg leading-relaxed">
                     This module provides advanced collaboration tools for {activeTab.toLowerCase()}. <br className="hidden sm:block" />It is designed to replace external SaaS tools so your team can build faster.
                   </p>
                   <button className="mt-8 px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 transition-colors">
                     Explore Features
                   </button>
                </motion.div>
              )}

            </div>
         </div>
      </main>

      {/* New Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-gray-900 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden animate-fade-in">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />
            
            <div className="mb-6">
              <h3 className="text-2xl font-display font-medium text-white mb-2">Create a New Task</h3>
              <p className="text-gray-400 font-light text-sm">Assign work items and prioritize milestones.</p>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Task Title</label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-blue-500/50 focus:bg-blue-500/5 transition-all font-light"
                  placeholder="e.g. Integrate Payment gateway, Write Swagger docs"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Description</label>
                <textarea
                  rows={3}
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-blue-500/50 focus:bg-blue-500/5 transition-all resize-none font-light"
                  placeholder="Summarize the core requirements..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Assignee</label>
                <select
                  value={taskAssignee}
                  onChange={(e) => setTaskAssignee(e.target.value)}
                  className="w-full bg-gray-950 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-blue-500/50 focus:bg-blue-500/5 transition-all font-light"
                >
                  <option value="">Unassigned</option>
                  {team?.members?.map((m: any) => (
                    <option key={m.user?.id} value={m.user?.id}>
                      {m.user?.name} ({m.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="flex-1 h-12 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={taskLoading}
                  className="flex-1 h-12 rounded-xl bg-white text-black font-semibold text-sm hover:bg-gray-100 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center cursor-pointer"
                >
                  {taskLoading ? (
                    <div className="w-5 h-5 rounded-full border-2 border-black/20 border-t-black animate-spin" />
                  ) : (
                    "Assign Task"
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
