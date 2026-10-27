"use client";

import React, { useState, useEffect } from "react";
import {
  Cpu,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Lock,
  Eye,
  EyeOff,
  Save,
  Key,
  Server,
  Zap,
} from "lucide-react";

export function SettingsView({ apiBase = "http://localhost:8000" }: { apiBase?: string }) {
  const [nvidiaConfigured, setNvidiaConfigured] = useState(false);
  const [modelCatalog, setModelCatalog] = useState<any[]>([]);
  const [routingProfiles, setRoutingProfiles] = useState<Record<string, string>>({});
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showKey, setShowKey] = useState(false);

  // Form State
  const [apiKey, setApiKey] = useState("");
  const [maskedKey, setMaskedKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("https://integrate.api.nvidia.com/v1");
  const [routingMode, setRoutingMode] = useState("BALANCED");
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError?: boolean } | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      setIsTesting(true);
      setStatusMessage(null);

      const healthRes = await fetch(`${apiBase}/health`);
      const healthData = await healthRes.json();
      setNvidiaConfigured(healthData.nvidia_configured);

      const settingsRes = await fetch(`${apiBase}/api/settings`);
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setMaskedKey(settingsData.masked_key || "");
        if (settingsData.base_url) setBaseUrl(settingsData.base_url);
        if (settingsData.routing_mode) setRoutingMode(settingsData.routing_mode);
      }

      const modelsRes = await fetch(`${apiBase}/api/agent/models`);
      const modelsData = await modelsRes.json();
      setModelCatalog(modelsData.catalog || []);
      setRoutingProfiles(modelsData.routing_profiles || {});
    } catch (e: any) {
      console.error("Error loading settings status", e);
      setStatusMessage({ text: "Unable to reach backend service at " + apiBase, isError: true });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveAndVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);

    try {
      const payload: any = {
        base_url: baseUrl,
        routing_mode: routingMode,
      };
      if (apiKey.trim()) {
        payload.api_key = apiKey.trim();
      }

      const res = await fetch(`${apiBase}/api/settings/key`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setNvidiaConfigured(data.nvidia_configured);
        setMaskedKey(data.masked_key || "");
        setLatencyMs(data.latency_ms);
        setApiKey("");
        setStatusMessage({
          text: `Verified & Connected! Live Model: ${data.model_used} (${data.latency_ms}ms)`,
          isError: false,
        });
        await fetchStatus();
      } else {
        setStatusMessage({ text: data.detail || "Failed to verify NVIDIA key", isError: true });
      }
    } catch (err: any) {
      setStatusMessage({ text: "Connection error: " + err.message, isError: true });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-6 space-y-6 text-left font-mono select-none">
      {/* Editorial Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#140808] border border-[#3A1515] text-[11px] font-mono text-[#ED3327] tracking-widest uppercase mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ED3327] animate-pulse"></span>
          <span>NVIDIA INFERENCE & SECURE ENGINE</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase">
          NVIDIA Intelligence Settings
        </h1>
        <p className="text-xs sm:text-sm text-[#A7A7A7] mt-1.5 max-w-xl font-sans">
          Manage your NVIDIA API key, connection endpoints, and capability-aware model routing for autonomous engineering.
        </p>
      </div>

      {/* Connection & Key Configuration Card */}
      <div className="bg-[#080808]/90 backdrop-blur-xl p-6 border border-[#3A1515] rounded-xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#220a0a]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#140808] border border-[#3A1515] rounded-lg flex items-center justify-center">
              <Cpu className="w-5 h-5 text-[#ED3327]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">NVIDIA API Connection</h2>
              <p className="text-[11px] text-[#A7A7A7]">{baseUrl}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border rounded-md ${
                nvidiaConfigured
                  ? "bg-[#140808] border-[#ED3327] text-white"
                  : "bg-black border-[#3A1515] text-[#A7A7A7]"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  nvidiaConfigured ? "bg-[#ED3327] animate-pulse" : "bg-[#555555]"
                }`}
              />
              <span>{nvidiaConfigured ? "NVIDIA CONNECTED" : "DETERMINISTIC FALLBACK"}</span>
            </span>

            <button
              onClick={fetchStatus}
              disabled={isTesting}
              className="p-1.5 bg-black border border-[#3A1515] hover:border-[#ED3327] text-[#A7A7A7] hover:text-white transition-colors rounded-md"
              title="Test Connection"
            >
              <RefreshCw className={`w-4 h-4 ${isTesting ? "animate-spin text-[#ED3327]" : ""}`} />
            </button>
          </div>
        </div>

        {/* API Key Form */}
        <form onSubmit={handleSaveAndVerify} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#CCCCCC] uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-[#ED3327]" />
                <span>NVIDIA API Key</span>
              </span>
              {maskedKey && (
                <span className="text-[10px] text-[#888888] font-normal lowercase">
                  current: <span className="text-[#4ade80] font-mono">{maskedKey}</span>
                </span>
              )}
            </label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={maskedKey ? "Enter new key to replace, or keep current" : "nvapi-..."}
                className="w-full bg-[#050608] border border-[#2b0f0f] focus:border-[#ED3327] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-[#555555] font-mono focus:outline-none transition-colors pr-10"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-2.5 text-[#777777] hover:text-white"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10.5px] text-[#777777] font-sans">
              Get your key from <a href="https://build.nvidia.com/" target="_blank" rel="noreferrer" className="text-[#ED3327] hover:underline">build.nvidia.com</a>. Keys are encrypted and securely maintained in server environment.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#CCCCCC] uppercase tracking-wider flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-[#ED3327]" />
                <span>Inference Base URL</span>
              </label>
              <input
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://integrate.api.nvidia.com/v1"
                className="w-full bg-[#050608] border border-[#2b0f0f] focus:border-[#ED3327] rounded-lg px-3.5 py-2 text-xs text-white placeholder-[#555555] font-mono focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#CCCCCC] uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#ED3327]" />
                <span>Preferred Routing Profile</span>
              </label>
              <select
                value={routingMode}
                onChange={(e) => setRoutingMode(e.target.value)}
                className="w-full bg-[#050608] border border-[#2b0f0f] focus:border-[#ED3327] rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none transition-colors"
              >
                <option value="BALANCED">BALANCED (Nemotron 30B / LLaMA 70B)</option>
                <option value="FAST">FAST (Nemotron Bolt / Autocomplete)</option>
                <option value="DEEP">DEEP (Nemotron 550B Flagship / DeepSeek)</option>
                <option value="BUDGET">BUDGET (Minimal Cost)</option>
              </select>
            </div>
          </div>

          {statusMessage && (
            <div
              className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
                statusMessage.isError
                  ? "bg-[#200508] border-[#ED3327] text-[#ff8080]"
                  : "bg-[#051c0d] border-[#22c55e] text-[#4ade80]"
              }`}
            >
              {statusMessage.isError ? (
                <AlertCircle className="w-4 h-4 shrink-0 text-[#ED3327]" />
              ) : (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#22c55e]" />
              )}
              <span className="font-sans">{statusMessage.text}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="text-[11px] text-[#888888] font-sans flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#ED3327]" />
              <span>Persisted to .env securely</span>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-lg bg-[#ED3327] hover:bg-[#db2b20] active:bg-[#c42319] disabled:opacity-40 text-white font-sans font-medium text-xs flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(237,51,39,0.4)]"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Verifying Key...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save & Test Connection</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Model Profiles Matrix */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">Active Routing Profiles</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.entries(routingProfiles).map(([mode, modelId]) => (
            <div
              key={mode}
              className="bg-[#080808]/90 backdrop-blur-xl p-4 border border-[#3A1515] rounded-xl hover:border-[#ED3327]/60 transition-all space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#ED3327]">
                  {mode}
                </span>
                <span className="text-[10px] text-[#777777]">131K Context</span>
              </div>
              <div className="font-bold text-xs text-white truncate">{modelId}</div>
              <p className="text-[11px] text-[#A7A7A7] font-sans">
                {mode === "FAST"
                  ? "Optimized for instant autocomplete and syntax verification via Nemotron Bolt."
                  : mode === "DEEP"
                  ? "Extended reasoning model for algorithmic and structural architecture."
                  : "Balanced default for autonomous coding, patch generation, and review."}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
