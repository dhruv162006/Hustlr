import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bookmark, Briefcase, FileText, ArrowRight, Trash2, Ghost } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function SavedItems() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBookmarks = () => {
    if (!token) return;
    setLoading(true);
    setError("");
    fetch("/api/profile/saved/bookmarks", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "Failed to load bookmarks");
        return data;
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setBookmarks(data);
        }
      })
      .catch((err) => {
        setError(err.message || "Failed to load saved items.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchBookmarks();
  }, [token]);

  const handleRemoveBookmark = async (id: string, type: string, targetId: string) => {
    try {
      const url = type === "opportunity" 
        ? `/api/opportunities/${targetId}/bookmark` 
        : `/api/community/posts/${targetId}/save`;
      
      const response = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error("Failed to remove bookmark");
      }
      setBookmarks(prev => prev.filter(b => b.id !== id));
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="bg-gray-950 min-h-screen text-gray-200 pb-20 pt-28 px-4 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Bookmark className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-medium text-white">Saved Items</h1>
            <p className="text-gray-400 text-xs font-light">Manage your bookmarked opportunities and saved community posts.</p>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-blue-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="p-6 border border-red-500/20 bg-red-500/5 text-center rounded-2xl">
            <p className="text-red-400">{error}</p>
          </div>
        ) : bookmarks.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            <AnimatePresence>
              {bookmarks.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-6 rounded-3xl bg-white/[0.01] border border-white/5 hover:border-white/10 transition-colors flex gap-6 items-start justify-between"
                >
                  <div className="flex gap-4 items-start">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                      item.type === "opportunity" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-blue-500/10 border-blue-500/20 text-blue-400"
                    }`}>
                      {item.type === "opportunity" ? <Briefcase className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-3 text-[10px] font-medium uppercase tracking-wider text-gray-500">
                        <span>{item.type}</span>
                        {item.space && <span>• {item.space}</span>}
                        {item.clientName && <span>• {item.clientName}</span>}
                      </div>
                      <h2 className="text-lg font-display font-medium text-white">{item.title}</h2>
                      <p className="text-sm text-gray-400 font-light line-clamp-2 leading-relaxed">{item.description}</p>
                      {item.budget && <span className="inline-block text-xs font-semibold text-emerald-400 mt-2">{item.budget}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleRemoveBookmark(item.id, item.type, item.type === "opportunity" ? item.opportunityId : item.postId)}
                      className="p-3 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <Link 
                      to={item.type === "opportunity" ? `/opportunity/${item.opportunityId}` : `/community`} 
                      className="p-3 bg-white/5 border border-white/10 text-white hover:bg-white/10 rounded-xl transition-colors shrink-0 flex items-center justify-center"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="py-20 text-center border border-white/5 bg-white/[0.01] rounded-3xl p-6">
            <Ghost className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-display font-medium text-white mb-2">No saved items yet</h3>
            <p className="text-sm text-gray-400 font-light max-w-sm mx-auto mb-6">Bookmark opportunities in the Marketplace or save posts in the Community Forum to view them here.</p>
            <div className="flex gap-4 justify-center">
              <Link to="/marketplace" className="px-5 py-2.5 bg-white text-black font-semibold rounded-xl text-sm hover:bg-gray-100 transition-colors">Marketplace</Link>
              <Link to="/community" className="px-5 py-2.5 bg-white/5 border border-white/10 text-white font-medium rounded-xl text-sm hover:bg-white/10 transition-colors">Community</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
