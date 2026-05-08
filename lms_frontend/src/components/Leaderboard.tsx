"use client";

import { motion } from "framer-motion";
import { Trophy, Medal, Star } from "lucide-react";

interface LeaderboardEntry {
  student__id: number;
  student__username: string;
  avg_score: number;
  total_quizzes: number;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
}

const rankIcons = [
  <Trophy key={1} className="w-5 h-5 text-yellow-400" />,
  <Medal key={2} className="w-5 h-5 text-slate-400" />,
  <Star key={3} className="w-5 h-5 text-amber-600" />,
];

export default function Leaderboard({ entries }: LeaderboardProps) {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-primary/10 to-accent/10">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          Quiz Leaderboard
        </h2>
        <p className="text-xs text-foreground/60 mt-1">Top 20 students by average score</p>
      </div>

      {/* Entries */}
      <div className="divide-y divide-border">
        {entries.length === 0 && (
          <p className="text-center text-foreground/50 text-sm py-8">No results yet.</p>
        )}
        {entries.map((entry, idx) => (
          <motion.div
            key={entry.student__id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`flex items-center gap-4 px-6 py-3 hover:bg-secondary/30 transition-colors ${idx === 0 ? "bg-yellow-50 dark:bg-yellow-900/10" : ""}`}
          >
            {/* Rank */}
            <div className="w-8 flex items-center justify-center font-bold text-sm">
              {idx < 3 ? rankIcons[idx] : <span className="text-foreground/40">#{idx + 1}</span>}
            </div>

            {/* Avatar placeholder */}
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs uppercase">
              {entry.student__username.charAt(0)}
            </div>

            {/* Name */}
            <span className="flex-grow font-medium text-sm">{entry.student__username}</span>

            {/* Score */}
            <div className="text-right">
              <div className="text-sm font-bold text-primary">
                {Number(entry.avg_score).toFixed(1)}%
              </div>
              <div className="text-xs text-foreground/50">avg score</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
