import React from "react";
import { motion } from "framer-motion";
import { MTOItem } from "@/types";
import { cn } from "@/lib/utils";

export function MTOTable({ items }: { items: MTOItem[] }) {
  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "PIPE": return "bg-blue-100 text-blue-700 border-blue-200";
      case "FITTING": return "bg-indigo-100 text-indigo-700 border-indigo-200";
      case "FLANGE": return "bg-purple-100 text-purple-700 border-purple-200";
      case "VALVE": return "bg-rose-100 text-rose-700 border-rose-200";
      case "GASKET": return "bg-amber-100 text-amber-700 border-amber-200";
      case "BOLT": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50/80 backdrop-blur border-b border-slate-200 text-xs uppercase text-slate-500 font-bold tracking-wider">
            <tr>
              <th className="px-4 py-4 text-center">Item</th>
              <th className="px-4 py-4">Category</th>
              <th className="px-4 py-4">Description</th>
              <th className="px-4 py-4">Size (NPS)</th>
              <th className="px-4 py-4">Sch / Rating</th>
              <th className="px-4 py-4">Material</th>
              <th className="px-4 py-4 text-center">Quantity</th>
              <th className="px-4 py-4 text-center">Unit</th>
              <th className="px-4 py-4 text-center">Confidence</th>
              <th className="px-4 py-4">Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item, idx) => (
              <motion.tr 
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + idx * 0.05 }}
                className="hover:bg-slate-50 transition-colors group text-sm"
              >
                <td className="px-4 py-3 font-semibold text-slate-900 text-center">{item.item_no}</td>
                <td className="px-4 py-3">
                  <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold border", getCategoryColor(item.category))}>
                    {item.category}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-slate-700" title={item.description}>
                  {item.description}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-slate-600 font-medium">{item.size_nps || "-"}</td>
                <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-600">{item.schedule_rating || "-"}</td>
                <td className="px-4 py-3 font-medium text-slate-600">{item.material_spec || "-"}</td>
                <td className="px-4 py-3 text-center font-bold text-slate-900">
                  {item.quantity ? item.quantity : item.length_m}
                </td>
                <td className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">{item.unit}</td>
                <td className="px-4 py-3 text-center">
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-bold",
                    (item.confidence ?? 1) >= 0.9 ? "bg-green-100 text-green-700" :
                    (item.confidence ?? 1) >= 0.7 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                  )}>
                    {Math.round((item.confidence ?? 1) * 100)}%
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-500" title={item.remarks}>
                  {item.remarks || "-"}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
