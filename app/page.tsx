"use client";

import { useState, useRef } from "react";
import GeoForm, { FormData } from "@/components/GeoForm";
import GeoReport from "@/components/GeoReport";

export default function Home() {
  const [reportContent, setReportContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState("");
  const [brandName, setBrandName] = useState("");
  const reportRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (data: FormData) => {
    setReportContent("");
    setError("");
    setIsStreaming(true);
    setBrandName(data.brandName);

    try {
      const response = await fetch("/api/geo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to generate strategy");
      }

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      setTimeout(() => {
        reportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setReportContent((prev) => prev + chunk);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 9a2 2 0 114 0 2 2 0 01-4 0z" />
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a4 4 0 00-3.446 6.032l-2.261 2.26a1 1 0 101.414 1.415l2.261-2.261A4 4 0 1011 5z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">GEO Strategy Generator</h1>
            <p className="text-xs text-slate-500 leading-tight">Generative Engine Optimization</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* Hero */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-4 border border-indigo-100">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            Powered by Claude Opus 4.6
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3 tracking-tight">
            Get cited by AI, not just Google
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto text-base leading-relaxed">
            Generate a complete 7-step GEO strategy to make your brand appear in ChatGPT, Perplexity, Gemini, and other AI-generated responses.
          </p>
        </div>

        {/* Tips banner */}
        <div className="mb-8 bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-amber-800">
            <strong>Pro tip:</strong> Before filling out the form, go to ChatGPT, Perplexity, and Gemini and search for the best products/services in your category. Screenshot the results — this gives you a real baseline for the strategy.
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <h3 className="text-lg font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100">
            Your Brand Details
          </h3>
          <GeoForm onSubmit={handleSubmit} isLoading={isStreaming} />
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-red-800">Error</p>
              <p className="text-sm text-red-700 mt-0.5">{error}</p>
              {error.includes("ANTHROPIC_API_KEY") && (
                <p className="text-xs text-red-600 mt-2">
                  Add your API key to <code className="bg-red-100 px-1 rounded">.env.local</code> as <code className="bg-red-100 px-1 rounded">ANTHROPIC_API_KEY=sk-ant-...</code>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Report */}
        <div ref={reportRef}>
          <GeoReport
            content={reportContent}
            isStreaming={isStreaming}
            brandName={brandName}
          />
        </div>

        <footer className="mt-16 pt-8 border-t border-slate-200 text-center text-xs text-slate-400">
          GEO Strategy Generator · Built with Claude Opus 4.6
        </footer>
      </main>
    </div>
  );
}
