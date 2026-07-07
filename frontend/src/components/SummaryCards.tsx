import React from "react";
import { motion } from "framer-motion";
import { MTOSummary } from "@/types";
import { Ruler, GitMerge, Disc, Settings2, LifeBuoy, Wrench } from "lucide-react";

export function SummaryCards({ summary }: { summary: MTOSummary }) {
  const cards = [
    { label: "Total Pipe", value: `${summary.total_pipe_length_m} m`, color: "from-blue-500 to-cyan-500", shadow: "shadow-blue-500/20", icon: Ruler },
    { label: "Fittings", value: summary.fittings, color: "from-indigo-500 to-purple-500", shadow: "shadow-indigo-500/20", icon: GitMerge },
    { label: "Flanges", value: summary.flanges, color: "from-violet-500 to-fuchsia-500", shadow: "shadow-violet-500/20", icon: Disc },
    { label: "Valves", value: summary.valves, color: "from-rose-500 to-pink-500", shadow: "shadow-rose-500/20", icon: Settings2 },
    { label: "Gaskets", value: summary.gaskets, color: "from-amber-500 to-orange-500", shadow: "shadow-amber-500/20", icon: LifeBuoy },
    { label: "Bolt Sets", value: summary.bolt_sets, color: "from-emerald-500 to-teal-500", shadow: "shadow-emerald-500/20", icon: Wrench },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <motion.div 
      variants={container} 
      initial="hidden" 
      animate="show" 
      className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4"
    >
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={idx}
            variants={item}
            whileHover={{ y: -5, scale: 1.02 }}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.color} p-5 text-white shadow-lg ${card.shadow} transition-shadow`}
          >
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <Icon className="w-10 h-10" />
            </div>
          <p className="text-xs font-bold uppercase tracking-wider text-white/80">{card.label}</p>
          <p className="text-3xl font-extrabold mt-2 tracking-tight">{card.value}</p>
        </motion.div>
        );
      })}
    </motion.div>
  );
}
