import React from "react";
import { motion } from "motion/react";
import { Scale, Calendar, FileText } from "lucide-react";

export function Terms() {
  return (
    <div className="bg-gray-950 min-h-screen text-gray-200 pb-20 pt-28 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center rounded-full border border-purple-500/20 bg-purple-500/5 px-3 py-1 text-xs font-medium text-purple-400 mb-6">
            <Scale className="w-3.5 h-3.5 mr-1.5" />
            Compliance Framework
          </div>
          <h1 className="text-4xl font-display font-medium text-white mb-4">Terms of Service</h1>
          <p className="text-gray-500 text-sm flex items-center justify-center gap-1.5"><Calendar className="w-4 h-4"/> Last Updated: July 9, 2026</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-8 rounded-3xl bg-white/[0.01] border border-white/5 space-y-8 font-light text-gray-300 leading-relaxed text-sm">
          <div className="space-y-3">
            <h2 className="text-lg font-display font-medium text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" /> 1. Campus Network Rules
            </h2>
            <p>HUSTLR is built for university students to form teams, share startup ideas, and collaborate on projects. You agree not to publish false information, spam the community feed, or create placeholder items with intent to manipulate matching criteria.</p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-display font-medium text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" /> 2. Workspace & Task Ownership
            </h2>
            <p>Team leads hold direct ownership over task delegation and workspace access inside their specific Kanban board. Any tasks, files, or attachments created are subject to platform moderation and can be flagged for review by moderators.</p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-display font-medium text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" /> 3. Code Quality & Moderation
            </h2>
            <p>We reserve the right to moderate, flag, or restrict access to any posts or accounts that do not comply with our safety rules. Moderation actions (flags, content removal) can be performed by designated administrators at any time.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
