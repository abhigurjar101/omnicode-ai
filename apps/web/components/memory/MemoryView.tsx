"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Search,
  CheckCircle2,
  Trash2,
  Cpu,
  Layers,
  ArrowRight,
  Filter,
} from "lucide-react";

interface MemoryItem {
  episode_id: string;
  task_objective: string;
  error_symptoms?: string;
  root_cause?: string;
  successful_solution?: string;
  lesson_learned: string;
  timestamp?: number;
  confidence_score?: number;
}

export function MemoryView({ apiBase = "http://localhost:8000" }: { apiBase?: string }) {
  const [episodes, setEpisodes] = useState<MemoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSection, setSelectedSection] = useState<"all" | "solved" | "skills" | "project">("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMemories();
  }, []);

  const fetchMemories = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${apiBase}/api/memory/episodes`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setEpisodes(data);
      }
    } catch (e) {
      console.error("Error loading memories", e);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEpisodes = episodes.filter((ep) => {
    const q = searchQuery.toLowerCase();
    return (
      ep.task_objective?.toLowerCase().includes(q) ||
      ep.lesson_learned?.toLowerCase().includes(q) ||
      ep.error_symptoms?.toLowerCase().includes(q) ||
      ep.root_cause?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-6 space-y-6 text-left font-mono select-none">
      {/* Editorial Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#140808] border border-[#3A1515] text-[11px] font-mono text-[#ED3327] tracking-widest uppercase mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ED3327] animate-pulse"></span>
          <span>EPISODIC & SEMANTIC INTELLIGENCE</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase">
          Knowledge that compounds.
        </h1>
        <p className="text-xs sm:text-sm text-[#A7A7A7] mt-1.5 max-w-xl font-sans">
          NEMI-CODE remembers verified solutions, project context, and reusable engineering practices.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#080808]/90 backdrop-blur-xl p-3 border border-[#3A1515]">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#ED3327] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search verified solutions, symptoms, or lessons learned..."
            className="w-full pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#555555] bg-black border border-[#260f0f] focus:border-[#ED3327] focus:outline-none"
          />
        </div>

        {/* Section Tabs */}
        <div className="flex items-center gap-1 w-full sm:w-auto text-[11px]">
          {[
            { id: "all", label: "All Memories" },
            { id: "solved", label: "Solved Problems" },
            { id: "skills", label: "Reusable Skills" },
            { id: "project", label: "Project Knowledge" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedSection(tab.id as any)}
              className={`px-3 py-1.5 uppercase font-semibold transition-all border ${
                selectedSection === tab.id
                  ? "bg-[#ED3327] border-[#ED3327] text-white"
                  : "bg-black border-[#3A1515] text-[#A7A7A7] hover:text-white hover:bg-[#140808]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Grid */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="py-12 text-center text-xs text-[#A7A7A7]">Loading memory records...</div>
        ) : filteredEpisodes.length === 0 ? (
          <div className="py-16 text-center bg-[#080808]/90 backdrop-blur-xl border border-[#3A1515] p-8 space-y-2">
            <BookOpen className="w-8 h-8 text-[#555555] mx-auto" />
            <div className="text-sm font-bold text-white uppercase">No remembered episodes yet</div>
            <p className="text-xs text-[#A7A7A7] max-w-sm mx-auto font-sans">
              As NEMI-CODE executes tasks and repairs bugs, verified solutions and lessons learned are automatically persisted here.
            </p>
          </div>
        ) : (
          filteredEpisodes.map((ep) => (
            <div
              key={ep.episode_id}
              className="bg-[#080808]/90 backdrop-blur-xl p-5 border border-[#3A1515] space-y-3 hover:border-[#ED3327]/60 transition-all shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-[#140808] border border-[#ED3327] text-[#ED3327] text-[10px] font-bold uppercase">
                      VERIFIED EPISODE
                    </span>
                    <span className="text-[11px] font-mono text-[#777777]">ID: {ep.episode_id}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white uppercase">{ep.task_objective}</h3>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-[#ED3327] font-bold bg-[#140808] px-2.5 py-1 border border-[#3A1515]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#ED3327]" />
                  <span>SUCCESS</span>
                </div>
              </div>

              {/* Lesson Learned Card */}
              <div className="p-3 bg-black border border-[#2b1010] text-xs space-y-1">
                <div className="text-[10px] uppercase font-bold text-[#A7A7A7] tracking-wider">Lesson Learned</div>
                <div className="text-[#EAEAEA] font-sans leading-relaxed">{ep.lesson_learned}</div>
              </div>

              {/* Solution Summary */}
              {ep.successful_solution && (
                <div className="text-xs text-[#A7A7A7] flex items-start gap-2">
                  <span className="font-bold text-white uppercase text-[10px]">Solution:</span>
                  <span className="font-mono text-[11px] text-[#EAEAEA]">{ep.successful_solution}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
