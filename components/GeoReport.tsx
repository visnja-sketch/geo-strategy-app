"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useState } from "react";

interface GeoReportProps {
  content: string;
  isStreaming: boolean;
  brandName: string;
}

const STEPS = [
  { key: "STEP 1", label: "AI Visibility Audit" },
  { key: "STEP 2", label: "Citation Authority Building" },
  { key: "STEP 3", label: "Content Optimization" },
  { key: "STEP 4", label: "Brand Entity Optimization" },
  { key: "STEP 5", label: "Strategic Content Plan" },
  { key: "STEP 6", label: "Third-Party Mention Strategy" },
  { key: "STEP 7", label: "Monitoring & Measurement" },
];

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/~~([^~]+)~~/g, "$1")
    .trim();
}

function parseInlineForDocx(text: string, TextRun: new (opts: object) => object): object[] {
  const runs: object[] = [];
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/);
  for (const part of parts) {
    if (!part) continue;
    if (part.startsWith("**") && part.endsWith("**")) {
      runs.push(new TextRun({ text: part.slice(2, -2), bold: true }));
    } else if (part.startsWith("*") && part.endsWith("*")) {
      runs.push(new TextRun({ text: part.slice(1, -1), italics: true }));
    } else if (part.startsWith("`") && part.endsWith("`")) {
      runs.push(new TextRun({ text: part.slice(1, -1), font: "Courier New", size: 18 }));
    } else {
      runs.push(new TextRun({ text: part }));
    }
  }
  return runs.length > 0 ? runs : [new TextRun({ text })];
}

export default function GeoReport({ content, isStreaming, brandName }: GeoReportProps) {
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState<"pdf" | "word" | null>(null);

  const completedSteps = STEPS.filter((step) => content.includes(step.key)).length;
  const slug = brandName.toLowerCase().replace(/\s+/g, "-");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMarkdownDownload = () => {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug}-geo-strategy.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePDFDownload = async () => {
    setExporting("pdf");
    try {
      const { default: jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const margin = 18;
      const maxW = pageW - margin * 2;
      let y = margin;

      const newPage = () => { doc.addPage(); y = margin; };
      const checkY = (needed: number) => { if (y + needed > pageH - margin) newPage(); };

      // Title page header
      doc.setFillColor(79, 70, 229);
      doc.rect(0, 0, pageW, 28, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text(`GEO Strategy: ${brandName}`, margin, 17);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("Generative Engine Optimization Report", margin, 23);
      y = 38;
      doc.setTextColor(30, 30, 30);

      const lines = content.split("\n");

      for (const line of lines) {
        const trimmed = line.trim();

        if (trimmed.startsWith("# ")) {
          checkY(14);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(14);
          doc.setTextColor(30, 30, 30);
          const wrapped = doc.splitTextToSize(stripMarkdown(trimmed.slice(2)), maxW);
          for (const w of wrapped) { checkY(8); doc.text(w, margin, y); y += 7; }
          y += 2;

        } else if (trimmed.startsWith("## ")) {
          checkY(12);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(12);
          doc.setTextColor(79, 70, 229);
          const wrapped = doc.splitTextToSize(stripMarkdown(trimmed.slice(3)), maxW);
          for (const w of wrapped) { checkY(7); doc.text(w, margin, y); y += 6; }
          y += 1;
          doc.setTextColor(30, 30, 30);

        } else if (trimmed.startsWith("### ")) {
          checkY(8);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10.5);
          doc.setTextColor(55, 65, 81);
          const wrapped = doc.splitTextToSize(stripMarkdown(trimmed.slice(4)), maxW);
          for (const w of wrapped) { checkY(6); doc.text(w, margin, y); y += 5.5; }
          doc.setTextColor(30, 30, 30);

        } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("→")) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          const bullet = trimmed.startsWith("→") ? "→  " : "•  ";
          const indent = trimmed.startsWith("→") ? margin + 4 : margin + 3;
          const text = stripMarkdown(trimmed.startsWith("→") ? trimmed : trimmed.slice(2));
          const wrapped = doc.splitTextToSize(bullet + text, maxW - 5);
          for (let i = 0; i < wrapped.length; i++) {
            checkY(5);
            doc.text(i === 0 ? wrapped[i] : "     " + wrapped[i].trimStart(), indent, y);
            y += 5;
          }

        } else if (trimmed.match(/^\d+\.\s/)) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          const text = stripMarkdown(trimmed);
          const wrapped = doc.splitTextToSize(text, maxW - 5);
          for (const w of wrapped) { checkY(5); doc.text(w, margin + 3, y); y += 5; }

        } else if (trimmed === "" || trimmed === "---") {
          y += 3;

        } else {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          doc.setTextColor(55, 65, 81);
          const text = stripMarkdown(trimmed);
          if (text) {
            const wrapped = doc.splitTextToSize(text, maxW);
            for (const w of wrapped) { checkY(5); doc.text(w, margin, y); y += 5; }
          }
          doc.setTextColor(30, 30, 30);
        }
      }

      // Footer on each page
      const totalPages = (doc.internal as unknown as { getNumberOfPages: () => number }).getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`${brandName} — GEO Strategy Report`, margin, pageH - 8);
        doc.text(`Page ${i} of ${totalPages}`, pageW - margin, pageH - 8, { align: "right" });
      }

      doc.save(`${slug}-geo-strategy.pdf`);
    } finally {
      setExporting(null);
    }
  };

  const handleWordDownload = async () => {
    setExporting("word");
    try {
      const { Document, Paragraph, TextRun, HeadingLevel, Packer, AlignmentType, BorderStyle } =
        await import("docx");

      const paragraphs: InstanceType<typeof Paragraph>[] = [];

      // Title
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: `GEO Strategy: ${brandName}`, bold: true, size: 36, color: "4F46E5" })],
          spacing: { after: 200 },
        })
      );
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: "Generative Engine Optimization Report", size: 22, color: "6B7280", italics: true })],
          spacing: { after: 400 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "E5E7EB" } },
        })
      );

      const lines = content.split("\n");

      for (const line of lines) {
        const trimmed = line.trim();

        if (trimmed.startsWith("# ")) {
          paragraphs.push(new Paragraph({
            text: stripMarkdown(trimmed.slice(2)),
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }));
        } else if (trimmed.startsWith("## ")) {
          paragraphs.push(new Paragraph({
            text: stripMarkdown(trimmed.slice(3)),
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 160 },
          }));
        } else if (trimmed.startsWith("### ")) {
          paragraphs.push(new Paragraph({
            text: stripMarkdown(trimmed.slice(4)),
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 200, after: 120 },
          }));
        } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          paragraphs.push(new Paragraph({
            children: parseInlineForDocx(trimmed.slice(2), TextRun) as InstanceType<typeof TextRun>[],
            bullet: { level: 0 },
            spacing: { after: 80 },
          }));
        } else if (trimmed.startsWith("→")) {
          paragraphs.push(new Paragraph({
            children: parseInlineForDocx(trimmed, TextRun) as InstanceType<typeof TextRun>[],
            indent: { left: 480 },
            spacing: { after: 80 },
          }));
        } else if (trimmed.match(/^\d+\.\s/)) {
          paragraphs.push(new Paragraph({
            children: parseInlineForDocx(trimmed, TextRun) as InstanceType<typeof TextRun>[],
            numbering: undefined,
            spacing: { after: 80 },
          }));
        } else if (trimmed === "" || trimmed === "---") {
          paragraphs.push(new Paragraph({ text: "", spacing: { after: 120 } }));
        } else if (trimmed) {
          paragraphs.push(new Paragraph({
            children: parseInlineForDocx(trimmed, TextRun) as InstanceType<typeof TextRun>[],
            spacing: { after: 120 },
            alignment: AlignmentType.LEFT,
          }));
        }
      }

      const doc = new Document({
        styles: {
          default: {
            document: {
              run: { font: "Calibri", size: 22 },
            },
          },
        },
        sections: [{ children: paragraphs }],
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${slug}-geo-strategy.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(null);
    }
  };

  if (!content) return null;

  return (
    <div className="mt-8 space-y-4">
      {/* Progress bar while streaming */}
      {isStreaming && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-slate-700">Generating strategy...</span>
            <span className="text-sm text-slate-500">{completedSteps}/{STEPS.length} sections</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mb-3">
            <div
              className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(5, (completedSteps / STEPS.length) * 100)}%` }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {STEPS.map((step) => {
              const done = content.includes(step.key);
              return (
                <span
                  key={step.key}
                  className={`text-xs px-2 py-1 rounded-full font-medium transition-colors ${
                    done ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {done ? "✓ " : ""}{step.label}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Export toolbar — shown when done */}
      {!isStreaming && content && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">GEO Strategy Report</h2>
            <p className="text-sm text-slate-500">Complete 7-step strategy for {brandName}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Copy */}
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
            >
              {copied ? (
                <><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>Copied!</>
              ) : (
                <><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" /><path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" /></svg>Copy</>
              )}
            </button>

            {/* Markdown */}
            <button
              onClick={handleMarkdownDownload}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              .md
            </button>

            {/* PDF */}
            <button
              onClick={handlePDFDownload}
              disabled={exporting !== null}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-60 rounded-lg transition"
            >
              {exporting === "pdf" ? (
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" /></svg>
              )}
              PDF
            </button>

            {/* Word */}
            <button
              onClick={handleWordDownload}
              disabled={exporting !== null}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-lg transition"
            >
              {exporting === "word" ? (
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" /></svg>
              )}
              Word
            </button>
          </div>
        </div>
      )}

      {/* Google Docs note */}
      {!isStreaming && content && (
        <p className="text-xs text-slate-400">
          💡 <strong>Google Docs:</strong> Download the Word file, then go to Google Drive → New → File upload → open it there.
        </p>
      )}

      {/* Report content */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8">
        <div className="prose prose-slate max-w-none
          prose-headings:font-bold
          prose-h1:text-2xl prose-h1:text-slate-900 prose-h1:border-b prose-h1:border-slate-200 prose-h1:pb-3 prose-h1:mb-6
          prose-h2:text-xl prose-h2:text-indigo-700 prose-h2:mt-8 prose-h2:mb-4
          prose-h3:text-base prose-h3:text-slate-700 prose-h3:mt-5 prose-h3:mb-2
          prose-p:text-slate-600 prose-p:leading-relaxed
          prose-li:text-slate-600 prose-li:leading-relaxed
          prose-strong:text-slate-800 prose-strong:font-semibold
          prose-blockquote:border-l-4 prose-blockquote:border-indigo-300 prose-blockquote:bg-indigo-50 prose-blockquote:rounded-r-lg prose-blockquote:px-4 prose-blockquote:py-0.5
          prose-code:text-indigo-700 prose-code:bg-indigo-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
          prose-hr:border-slate-200
        ">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          {isStreaming && (
            <span className="inline-block w-0.5 h-4 bg-indigo-500 animate-pulse ml-0.5 align-middle" />
          )}
        </div>
      </div>
    </div>
  );
}
