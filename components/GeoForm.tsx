"use client";

import { useState, useRef } from "react";

export interface UploadedImage {
  name: string;
  base64: string;
  mimeType: string;
  previewUrl: string;
}

export interface FormData {
  brandName: string;
  website: string;
  niche: string;
  competitors: Array<{ brand: string; url: string }>;
  productsServices: string;
  targetAudience: string;
  authorityLevel: string;
  images: UploadedImage[];
}

interface GeoFormProps {
  onSubmit: (data: FormData) => void;
  isLoading: boolean;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_IMAGES = 5;
const MAX_SIZE_MB = 5;

export default function GeoForm({ onSubmit, isLoading }: GeoFormProps) {
  const [formData, setFormData] = useState<FormData>({
    brandName: "",
    website: "",
    niche: "",
    competitors: [
      { brand: "", url: "" },
      { brand: "", url: "" },
      { brand: "", url: "" },
    ],
    productsServices: "",
    targetAudience: "",
    authorityLevel: "new brand",
    images: [],
  });
  const [dragOver, setDragOver] = useState(false);
  const [imageError, setImageError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateCompetitor = (index: number, field: "brand" | "url", value: string) => {
    const updated = [...formData.competitors];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, competitors: updated });
  };

  const processFiles = async (files: FileList | File[]) => {
    setImageError("");
    const fileArray = Array.from(files);
    const remaining = MAX_IMAGES - formData.images.length;

    if (remaining <= 0) {
      setImageError(`Maximum ${MAX_IMAGES} images allowed.`);
      return;
    }

    const toProcess = fileArray.slice(0, remaining);
    const newImages: UploadedImage[] = [];

    for (const file of toProcess) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setImageError("Only JPEG, PNG, WebP, and GIF images are supported.");
        continue;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setImageError(`"${file.name}" exceeds ${MAX_SIZE_MB}MB limit.`);
        continue;
      }

      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          resolve(result.split(",")[1]); // strip data URL prefix
        };
        reader.readAsDataURL(file);
      });

      newImages.push({
        name: file.name,
        base64,
        mimeType: file.type,
        previewUrl: URL.createObjectURL(file),
      });
    }

    setFormData((prev) => ({ ...prev, images: [...prev.images, ...newImages] }));
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(formData.images[index].previewUrl);
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    processFiles(e.dataTransfer.files);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Brand Info */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Brand Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Notion, HubSpot, Figma"
            value={formData.brandName}
            onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Website URL <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. notion.so"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Niche / Industry <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          placeholder="e.g. Project management software for remote teams"
          value={formData.niche}
          onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
          className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
        />
      </div>

      {/* Competitors */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-3">
          Top Competitors
        </label>
        <div className="space-y-3">
          {formData.competitors.map((comp, i) => (
            <div key={i} className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder={`Competitor ${i + 1} name`}
                value={comp.brand}
                onChange={(e) => updateCompetitor(i, "brand", e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
              <input
                type="text"
                placeholder={`competitor${i + 1}.com`}
                value={comp.url}
                onChange={(e) => updateCompetitor(i, "url", e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Products/Services */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Primary Products / Services
        </label>
        <textarea
          rows={3}
          placeholder="Describe what you sell or offer..."
          value={formData.productsServices}
          onChange={(e) => setFormData({ ...formData, productsServices: e.target.value })}
          className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
        />
      </div>

      {/* Target Audience */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Target Audience
        </label>
        <textarea
          rows={2}
          placeholder="e.g. SaaS founders, marketing teams at mid-size B2B companies..."
          value={formData.targetAudience}
          onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
          className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
        />
      </div>

      {/* Authority Level */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Current Authority Level
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: "new brand", label: "New Brand", desc: "Just starting out" },
            { value: "established in niche", label: "Established", desc: "Known in your niche" },
            { value: "industry leader", label: "Industry Leader", desc: "Top brand in category" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setFormData({ ...formData, authorityLevel: opt.value })}
              className={`p-3 rounded-lg border-2 text-left transition cursor-pointer ${
                formData.authorityLevel === opt.value
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              <div className="font-semibold text-sm">{opt.label}</div>
              <div className="text-xs mt-0.5 opacity-75">{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">
          AI Search Screenshots{" "}
          <span className="font-normal text-slate-400">(optional, up to {MAX_IMAGES})</span>
        </label>
        <p className="text-xs text-slate-500 mb-3">
          Upload screenshots from ChatGPT, Perplexity, or Gemini showing who appears for your target queries. Claude will use these to improve the audit.
        </p>

        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
            dragOver
              ? "border-indigo-400 bg-indigo-50"
              : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50"
          } ${formData.images.length >= MAX_IMAGES ? "opacity-50 pointer-events-none" : ""}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && processFiles(e.target.files)}
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm text-slate-500">
            <span className="font-semibold text-indigo-600">Click to upload</span> or drag & drop
          </p>
          <p className="text-xs text-slate-400 mt-1">PNG, JPG, WebP up to {MAX_SIZE_MB}MB each</p>
        </div>

        {imageError && (
          <p className="mt-2 text-xs text-red-600">{imageError}</p>
        )}

        {/* Thumbnails */}
        {formData.images.length > 0 && (
          <div className="mt-3 grid grid-cols-5 gap-2">
            {formData.images.map((img, i) => (
              <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.previewUrl}
                  alt={img.name}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                  className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-1 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-xs truncate">{img.name}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3.5 px-6 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 text-base shadow-sm"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Generating Strategy...
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
            Generate GEO Strategy
          </>
        )}
      </button>
    </form>
  );
}
