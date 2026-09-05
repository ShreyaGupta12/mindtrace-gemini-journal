import React, { useState } from 'react';
import { Sparkles, Loader2, HeartHandshake, Copy, Check, Compass, Eye, Tag } from 'lucide-react';
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
      className="bg-[#141722] border border-amber-500/25 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden transition-all duration-300"
    >
      {/* Subtle warm amber ambient glow in the top-right corner */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/[0.04] rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 relative">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-300 shadow-sm shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold tracking-tight text-[#f3f2ee] leading-tight">
                AI Reflection Insight
              </h3>
              <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                Core Synthesis
              </span>
            </div>
            <p className="text-xs text-[#8a8880] mt-0.5">
              Psychological and thematic crystallization of your current journal dialogue
            </p>
          </div>
        </div>

        <button
          id="btn-generate-reflection"
          onClick={onGenerate}
          disabled={!canGenerate || isGenerating}
          className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-[#1d212f] text-amber-200 hover:text-amber-100 hover:bg-[#252a3b] border border-amber-500/30 hover:border-amber-500/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs shrink-0 cursor-pointer"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
              <span>Analyzing Dialogue...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{insight ? 'Regenerate Insight' : 'Extract Insight'}</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div
          id="reflection-error-box"
          className="mb-4 text-xs text-red-300 bg-red-950/40 border border-red-800/60 rounded-xl p-3"
        >
          {error}
        </div>
      )}

      {insight ? (
        <div id="reflection-insight-content" className="space-y-4 relative">
          {/* Main Theme & Emotional Tone row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="bg-[#191d29] p-4 rounded-xl border border-white/[0.08] relative">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-amber-400/90 mb-1.5 font-mono">
                <Tag className="w-3 h-3 text-amber-400" />
                Main Theme
              </div>
              <p className="text-xs sm:text-sm font-medium text-[#f3f2ee] leading-relaxed">
                {insight.mainTheme}
              </p>
            </div>

            <div className="bg-[#191d29] p-4 rounded-xl border border-white/[0.08] relative">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#a78bfa] mb-1.5 font-mono">
                <Compass className="w-3 h-3 text-[#a78bfa]" />
                Emotional Tone
              </div>
              <p className="text-xs sm:text-sm font-medium text-[#f3f2ee] leading-relaxed">
                {insight.emotionalTone}
              </p>
            </div>
          </div>

          {/* Key Observation */}
          <div className="bg-[#191d29] p-4 sm:p-4.5 rounded-xl border border-white/[0.08] relative">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#a19e95] mb-2 font-mono">
              <Eye className="w-3 h-3 text-amber-400/80" />
              Key Observation
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-[#dedcd5] pl-2.5 border-l-2 border-amber-500/40">
              {insight.keyObservation}
            </p>
          </div>

          {/* Actionable Reflection: Prominent Takeaway */}
          <div className="bg-[#1c1914] p-4 sm:p-4.5 rounded-xl border border-amber-500/30 relative">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-amber-300 font-mono">
                <HeartHandshake className="w-3.5 h-3.5 text-amber-400" />
                Actionable Daily Anchor
              </div>

              <button
                id="btn-copy-reflection-action"
                onClick={handleCopyAction}
                className="inline-flex items-center gap-1 text-[11px] text-amber-300/80 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-0.5 rounded transition-colors cursor-pointer"
                title="Copy action to clipboard"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-300 font-medium">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Action</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs sm:text-sm leading-relaxed text-amber-100/95 font-medium">
              {insight.actionableReflection}
            </p>
          </div>
        </div>
      ) : (
        <div className="py-6 px-4 text-center rounded-xl border border-dashed border-white/[0.08] bg-[#12151f]/50">
          <p className="text-xs text-[#8a8880] max-w-md mx-auto leading-relaxed">
            {canGenerate
              ? 'Click "Extract Insight" above to distill your thoughts into emotional valence, psychological patterns, and an actionable daily anchor.'
              : 'Type your thoughts into the journal dialogue below. Once you start writing, you can extract a deep AI Reflection Insight.'}
          </p>
        </div>
      )}
    </div>
  );
};
