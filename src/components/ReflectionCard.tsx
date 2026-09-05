import React, { useState } from 'react';
import { Sparkles, Loader2, Heart, Copy, Check, Compass, Eye, Tag, Sprout, Sun, Coffee } from 'lucide-react';
import type { ReflectionInsight } from '../types';

interface ReflectionCardProps {
  insight?: ReflectionInsight;
  onGenerate: () => Promise<void>;
  isGenerating: boolean;
  canGenerate: boolean;
  error?: string | null;
}

export const ReflectionCard: React.FC<ReflectionCardProps> = ({
  insight,
  onGenerate,
  isGenerating,
  canGenerate,
  error,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyAction = () => {
    if (!insight?.actionableReflection) return;
    navigator.clipboard.writeText(insight.actionableReflection);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id="reflection-insight-container"
      className="bg-gradient-to-br from-[#12191b] via-[#141d1f] to-[#12181a] border border-emerald-500/25 rounded-2xl p-5 sm:p-6 shadow-md relative overflow-hidden transition-all duration-300"
    >
      {/* Soft warm calming chamomile ambient glows */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1c2925] to-[#141d1c] border border-emerald-400/30 flex items-center justify-center text-emerald-300 shadow-sm shrink-0">
            <Sprout className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-semibold tracking-tight text-[#fbf9f4] font-newsreader leading-tight">
                Gentle Reflection Insight
              </h3>
              <span className="text-[10px] font-medium tracking-wide text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full shadow-xs">
                Emotional Wellbeing
              </span>
            </div>
            <p className="text-xs text-[#9aaba1] font-lora italic mt-0.5">
              A compassionate look at your feelings, patterns, and a gentle step forward
            </p>
          </div>
        </div>

        <button
          id="btn-generate-reflection"
          onClick={onGenerate}
          disabled={!canGenerate || isGenerating}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-medium bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm shrink-0 cursor-pointer font-newsreader tracking-wide"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
              <span>Gently Reflecting...</span>
            </>
          ) : (
            <>
              <Heart className="w-3.5 h-3.5 text-rose-200" />
              <span>{insight ? 'Reflect Again' : 'Explore Insights'}</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div
          id="reflection-error-box"
          className="mb-4 text-xs text-red-200 bg-red-950/40 border border-red-500/40 rounded-xl p-3 font-lora"
        >
          {error}
        </div>
      )}

      {insight ? (
        <div id="reflection-insight-content" className="space-y-4 relative">
          {/* Main Theme & Emotional Weather row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="bg-[#172224]/80 p-4 rounded-xl border border-emerald-400/20 shadow-xs relative">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-300 mb-1.5 font-newsreader">
                <Tag className="w-3 h-3 text-emerald-400" />
                What's on Your Mind
              </div>
              <p className="text-sm font-medium text-[#fbf9f4] leading-relaxed font-lora italic">
                "{insight.mainTheme}"
              </p>
            </div>

            <div className="bg-[#172224]/80 p-4 rounded-xl border border-amber-400/20 shadow-xs relative">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-amber-200 mb-1.5 font-newsreader">
                <Sun className="w-3.5 h-3.5 text-amber-300" />
                Emotional Weather
              </div>
              <p className="text-sm font-medium text-[#fbf9f4] leading-relaxed font-lora italic">
                "{insight.emotionalTone}"
              </p>
            </div>
          </div>

          {/* Mindful Observation */}
          <div className="bg-[#172224]/80 p-4 sm:p-4.5 rounded-xl border border-emerald-500/15 relative">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#b8c7bc] mb-2 font-newsreader">
              <Eye className="w-3.5 h-3.5 text-emerald-300" />
              Gentle Observation
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-[#dbe2dc] pl-3 border-l-2 border-emerald-400/40 font-lora">
              {insight.keyObservation}
            </p>
          </div>

          {/* Actionable Reflection: A Small Step for Today */}
          <div className="bg-gradient-to-r from-[#1c2622] to-[#1a2325] p-4 sm:p-4.5 rounded-xl border border-emerald-400/35 shadow-sm relative">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-amber-200 font-newsreader">
                <Coffee className="w-3.5 h-3.5 text-amber-300" />
                A Gentle Step for Today
              </div>

              <button
                id="btn-copy-reflection-action"
                onClick={handleCopyAction}
                className="inline-flex items-center gap-1 text-[11px] text-emerald-200 hover:text-white bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 px-2.5 py-0.5 rounded-full transition-all cursor-pointer shadow-xs"
                title="Save this gentle step"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-300" />
                    <span className="text-emerald-200 font-medium">Saved!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Step</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-sm sm:text-base leading-relaxed text-amber-100 font-medium font-lora italic">
              "{insight.actionableReflection}"
            </p>
          </div>

          <p className="text-[11px] text-center text-[#7e8e82] font-lora italic pt-1">
            "Take whatever brings you comfort, and let the rest go."
          </p>
        </div>
      ) : (
        <div className="py-7 px-4 text-center rounded-xl border border-dashed border-emerald-500/20 bg-[#101719]/60 relative">
          <Coffee className="w-6 h-6 text-amber-300/60 mx-auto mb-2 opacity-80" />
          <p className="text-xs text-[#9aaba1] font-lora italic text-sm max-w-md mx-auto leading-relaxed">
            {canGenerate
              ? 'Click "Explore Insights" above to unpack your emotional weather, gentle patterns, and a low-pressure step for today.'
              : 'Write a few honest thoughts in your journal below. When you feel ready, you can explore a compassionate reflection.'}
          </p>
        </div>
      )}
    </div>
  );
};
