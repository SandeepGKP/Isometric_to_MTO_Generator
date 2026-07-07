"use client";

import React, { useState } from "react";
import axios from "axios";
import { Download, CheckCircle2, FileImage, Maximize2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MTOResponse } from "@/types";
import { UploadArea } from "@/components/UploadArea";
import { SummaryCards } from "@/components/SummaryCards";
import { MTOTable } from "@/components/MTOTable";

const API_BASE_URL = "http://localhost:8000/api";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [mtoData, setMtoData] = useState<MTOResponse | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);

  const handleUpload = async (file: File) => {
    setLoading(true);
    setMtoData(null);
    setJobId(null);
    
    if (file.type.startsWith("image/") || file.type === "application/pdf") {
      setPreviewUrl(URL.createObjectURL(file));
      setFileType(file.type);
    } else {
      setPreviewUrl(null);
      setFileType(null);
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      // 1. Upload File
      const uploadRes = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const { job_id } = uploadRes.data;
      setJobId(job_id);

      // 2. Process File
      const mtoRes = await axios.get<MTOResponse>(`${API_BASE_URL}/mto/${job_id}`);
      setMtoData(mtoRes.data);
    } catch (err: any) {
      console.error(err);
      throw err; // Let UploadArea handle the error display
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    if (!jobId) return;
    window.location.href = `${API_BASE_URL}/mto/${jobId}/csv`;
  };

  const handleDownloadExcel = () => {
    if (!jobId) return;
    window.location.href = `${API_BASE_URL}/mto/${jobId}/excel`;
  };

  return (
    <main className="min-h-screen bg-slate-100 font-sans text-slate-900 selection:bg-blue-200">
      {/* Background Gradient */}
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-slate-100 to-slate-200" />
      
      <div className="relative z-10 max-w-7xl mx-auto p-6 md:p-12 space-y-10">
        
        {/* Header */}
        <header className="text-center space-y-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 font-medium text-sm shadow-sm mb-4">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
              AI-Powered Extraction
            </div>
          </motion.div>
          <motion.h1 initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.1 }} className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
            Isometric MTO Generator
          </motion.h1>
          <motion.p initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }} className="text-lg text-slate-600 max-w-2xl mx-auto">
            Upload your piping isometric drawing and let our Vision AI instantly extract a structured Bill of Materials.
          </motion.p>
        </header>

        {/* Upload Area */}
        {!mtoData && (
          <UploadArea onUpload={handleUpload} loading={loading} />
        )}

        {/* Results View */}
        <AnimatePresence>
          {mtoData && (
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Top Action Bar */}
              <div className="flex flex-col sm:flex-row justify-between items-center bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-slate-200 gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Extraction Complete</h2>
                    <p className="text-xs font-medium text-slate-500">{mtoData.items.length} items found</p>
                  </div>
                </div>
                <div className="flex gap-3 w-full sm:w-auto flex-wrap sm:flex-nowrap">
                  <button 
                    onClick={() => { setMtoData(null); setPreviewUrl(null); }}
                    className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-all shadow-sm"
                  >
                    Upload New
                  </button>
                  <button 
                    onClick={handleDownloadCSV}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md hover:shadow-lg"
                  >
                    <Download className="w-4 h-4" /> CSV
                  </button>
                  <button 
                    onClick={handleDownloadExcel}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md hover:shadow-lg"
                  >
                    <Download className="w-4 h-4" /> Excel
                  </button>
                </div>
              </div>

              {/* Layout */}
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                
                {/* Left Col: Metadata & Preview */}
                <div className="xl:col-span-1 space-y-6">
                  {/* Drawing Metadata */}
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-100 p-4">
                      <h3 className="font-bold text-slate-700">Drawing Metadata</h3>
                    </div>
                    <div className="p-5 grid grid-cols-2 gap-y-5 gap-x-4">
                      <div className="col-span-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Line Number</p>
                        <p className="font-bold text-blue-600 text-lg mt-1">{mtoData.drawing_meta.line_number || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Drawing No.</p>
                        <p className="font-semibold text-slate-800 mt-1">{mtoData.drawing_meta.drawing_no || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Revision</p>
                        <p className="font-semibold text-slate-800 mt-1">{mtoData.drawing_meta.revision || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Size (NPS)</p>
                        <p className="font-semibold text-slate-800 mt-1">{mtoData.drawing_meta.nps || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Class</p>
                        <p className="font-semibold text-slate-800 mt-1">{mtoData.drawing_meta.material_class || "N/A"}</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Image Preview */}
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-100 p-4 flex items-center justify-between">
                      <h3 className="font-bold text-slate-700">Source Image</h3>
                      <FileImage className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="p-4 bg-slate-100/50 flex justify-center items-center min-h-[250px] relative group overflow-hidden rounded-b-2xl">
                      {previewUrl ? (
                        <>
                          <button 
                            onClick={() => setIsPreviewExpanded(true)}
                            className="absolute top-3 right-3 bg-white/90 backdrop-blur p-2 rounded-lg shadow-sm border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50 opacity-0 group-hover:opacity-100 transition-all z-10"
                            title="Expand Preview"
                          >
                            <Maximize2 className="w-4 h-4" />
                          </button>
                          {fileType === "application/pdf" ? (
                            <embed src={previewUrl} type="application/pdf" className="w-full h-[300px] rounded-lg shadow-sm border border-slate-200 bg-white relative z-0" />
                          ) : (
                            <img src={previewUrl} alt="Source" className="max-w-full max-h-[300px] rounded-lg shadow-sm border border-slate-200 bg-white object-contain relative z-0" />
                          )}
                        </>
                      ) : (
                        <p className="text-slate-400 font-medium text-sm">Preview not available</p>
                      )}
                    </div>
                  </motion.div>
                </div>

                {/* Right Col: Summaries & Table */}
                <div className="xl:col-span-3 space-y-6">
                  <SummaryCards summary={mtoData.summary} />
                  <MTOTable items={mtoData.items} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Full Screen Preview Overlay */}
      <AnimatePresence>
        {isPreviewExpanded && previewUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-12 bg-slate-900/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full h-full max-w-6xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-white">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <FileImage className="w-5 h-5 text-blue-600" />
                  Document Preview
                </h3>
                <button 
                  onClick={() => setIsPreviewExpanded(false)}
                  className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 bg-slate-100 p-4 md:p-8 overflow-auto flex justify-center items-center">
                {fileType === "application/pdf" ? (
                  <embed src={previewUrl} type="application/pdf" className="w-full h-full shadow-md rounded-lg bg-white" />
                ) : (
                  <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain shadow-md rounded-lg bg-white" />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
