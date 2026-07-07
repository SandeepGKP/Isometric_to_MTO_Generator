"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, FileType, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface UploadAreaProps {
  onUpload: (file: File) => Promise<void>;
  loading: boolean;
}

export function UploadArea({ onUpload, loading }: UploadAreaProps) {
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    if (acceptedFiles.length > 0) {
      const selected = acceptedFiles[0];
      if (selected.size > 20 * 1024 * 1024) {
        setError("File size must be less than 20MB");
        return;
      }
      setFile(selected);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/jpeg": [], "image/png": [], "application/pdf": [] },
    maxFiles: 1,
  });

  const handleProcess = async () => {
    if (file) {
      setError(null);
      try {
        await onUpload(file);
      } catch (err: any) {
        if (err.response && err.response.data && err.response.data.detail) {
          setError(err.response.data.detail);
        } else {
          setError("An error occurred during processing.");
        }
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8 max-w-3xl mx-auto"
    >
      <div
        {...getRootProps()}
        className={cn(
          "relative overflow-hidden border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all duration-300 group",
          isDragActive
            ? "border-blue-500 bg-blue-500/5 shadow-inner"
            : "border-slate-300 hover:border-blue-400 hover:bg-slate-50"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-4">
          <motion.div
            animate={isDragActive ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
            className={cn(
              "p-4 rounded-full transition-colors duration-300",
              isDragActive ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-500"
            )}
          >
            <UploadCloud className="w-10 h-10" />
          </motion.div>
          <div>
            <h3 className="text-xl font-semibold text-slate-800">
              {isDragActive ? "Drop drawing here..." : "Drag & drop your drawing"}
            </h3>
            <p className="text-slate-500 mt-2 font-medium text-sm">Only Isometric Drawings of pipelines are allowed (PDF, JPG, PNG. Max 20MB).</p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 24 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="flex items-center gap-3 text-rose-600 bg-rose-50/80 backdrop-blur-sm p-4 rounded-xl border border-rose-100"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="font-medium text-sm">{error}</p>
          </motion.div>
        )}

        {file && !error && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 24 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="flex flex-col sm:flex-row items-center justify-between bg-slate-50/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-4 gap-4"
          >
            <div className="flex items-center gap-4 w-full sm:w-auto overflow-hidden">
              <div className="w-14 h-14 bg-white rounded-xl flex flex-shrink-0 items-center justify-center shadow-sm border border-slate-100 overflow-hidden relative">
                {file.type.startsWith("image/") ? (
                  <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover absolute inset-0" />
                ) : (
                  <FileType className="w-6 h-6 text-blue-600" />
                )}
              </div>
              <div className="overflow-hidden">
                <p className="font-semibold text-slate-800 truncate">{file.name}</p>
                <p className="text-sm text-slate-500 font-medium">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <button
              onClick={handleProcess}
              disabled={loading}
              className="w-full sm:w-auto cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Extracting...
                </>
              ) : (
                "Generate MTO"
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="w-full mt-6 flex flex-col items-center justify-center space-y-3"
          >
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner border border-slate-200">
              <motion.div
                className="bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500 h-full rounded-full relative"
                initial={{ width: "0%" }}
                animate={{ width: "98%" }}
                transition={{ duration: 12, ease: "easeOut" }}
              >
                <motion.div 
                  className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)]"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                />
              </motion.div>
            </div>
            <p className="text-sm font-semibold text-slate-600 animate-pulse">
              Analyzing Blueprint via Vision AI... Please wait.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
