import React from "react";
import { motion } from "motion/react";
import { Sparkles, Calendar, ArrowRight, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

export function Blog() {
  const posts = [
    { title: "Introducing HUSTLR: The Campus Builder Network", date: "July 9, 2026", category: "Company", desc: "How we are bridging the gap between student builders, founders, and recruiters with a decentralized task workspace and skill index." },
    { title: "Building a Technical Co-founder Matchmaker", date: "June 28, 2026", category: "Guides", desc: "Finding co-founders can be tough. In this post, we discuss building match algorithms leveraging college majors, GitHub links, and reputation scores." },
    { title: "Why We Swapped Mock APIs for Real Express+PostgreSQL Backends", date: "June 15, 2026", category: "Engineering", desc: "A technical dive into configuring Prisma ORM schemas, managing cascading deletion records, and integrating Socket.io typing indicators." }
  ];

  return (
    <div className="bg-gray-950 min-h-screen text-gray-200 pb-20 pt-28 px-4">
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-blue-400 mb-6">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            HUSTLR Bulletin
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-medium text-white mb-4">Latest Insights & Stories</h1>
          <p className="text-gray-400 font-light max-w-xl mx-auto">Explore tutorials, product updates, and features highlighting the next generation of campus builders.</p>
        </motion.div>

        <div className="w-full space-y-8">
          {posts.map((p, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="p-8 rounded-3xl bg-white/[0.01] border border-white/5 hover:bg-white/[0.02] hover:border-white/10 transition-all flex flex-col md:flex-row gap-6 items-start">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-4 text-xs font-medium">
                  <span className="text-blue-400 uppercase tracking-wider">{p.category}</span>
                  <span className="text-gray-500 flex items-center gap-1"><Calendar className="w-3.5 h-3.5"/> {p.date}</span>
                </div>
                <h2 className="text-xl font-display font-medium text-white">{p.title}</h2>
                <p className="text-gray-400 font-light text-sm leading-relaxed">{p.desc}</p>
                <div className="pt-2">
                  <span className="inline-flex items-center text-sm font-medium text-white hover:text-blue-400 gap-1 group cursor-pointer">
                    Read Article <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
