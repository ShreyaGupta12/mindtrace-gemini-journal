import React from 'react';
import { Shield, Heart, Lock, ArrowRight, Loader2, Coffee, Sprout, Sun } from 'lucide-react';

interface AuthScreenProps {
  onSignIn: () => void;
  isLoading: boolean;
  error?: string | null;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onSignIn,
  isLoading,
  error,
}) => {
  return (
    <div
      id="auth-screen-container"
      className="min-h-screen bg-[#0d1214] text-[#f7f5ed] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden"
    >
      {/* Whimsical soft ambient chamomile & sage glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-md w-full bg-gradient-to-b from-[#131b1d] via-[#111719] to-[#0f1416] border border-emerald-500/25 rounded-3xl shadow-xl p-8 sm:p-9 space-y-7 relative z-10">
        {/* Top soft chamomile accent line */}
        <div className="absolute top-0 inset-x-10 h-[1px] bg-gradient-to-r from-transparent via-amber-300/40 to-transparent" />

        {/* Product Brand Header */}
        <div className="text-center space-y-3 relative">
          <div className="relative inline-block mx-auto mb-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1c2925] via-[#162120] to-[#11191a] border border-emerald-400/30 text-emerald-300 flex items-center justify-center shadow-md animate-gentle-breathe">
              <Coffee className="w-6 h-6 text-amber-200" />
            </div>
            <Sprout className="w-4 h-4 text-emerald-300 absolute -top-1 -right-1" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-400/25 text-[10px] uppercase tracking-wider font-medium text-emerald-300 shadow-xs mb-2">
              <Heart className="w-2.5 h-2.5 text-rose-300" />
              <span>A Gentle Haven for the Mind</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-normal text-transparent bg-clip-text bg-gradient-to-r from-[#fbf9f4] via-[#e5e0d3] to-[#f4deb2] font-newsreader">
              MindTrace
            </h1>
            <p className="text-xs text-amber-200/90 font-lora italic tracking-wide text-base mt-1">
              "A warm cup of tea for your thoughts &amp; emotional wellbeing"
            </p>
          </div>

          <p className="text-xs text-[#9aaba1] font-lora max-w-xs mx-auto leading-relaxed pt-1">
            A comforting, private sanctuary to write freely, unpack difficult emotions, and receive gentle, supportive reflection.
          </p>
        </div>

        {/* Security & Supportive Architecture Highlights */}
        <div className="bg-[#151f21]/80 border border-emerald-500/20 rounded-2xl p-4 space-y-3 shadow-inner">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <div className="text-xs space-y-0.5">
              <span className="font-semibold text-[#f8f6f0] block font-newsreader text-xs">
                Private &amp; Locked to You
              </span>
              <p className="text-[#8f9d92] font-lora leading-relaxed">
                Your entries and reflections are isolated strictly to your authenticated Firebase UID.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-teal-500/10 border border-teal-500/25 text-teal-300 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
              <Lock className="w-3.5 h-3.5" />
            </div>
            <div className="text-xs space-y-0.5">
              <span className="font-semibold text-[#f8f6f0] block font-newsreader text-xs">
                Confidential Backend
              </span>
              <p className="text-[#8f9d92] font-lora leading-relaxed">
                Zero API keys or credentials in the browser; all reflections are securely proxied via Cloud Run.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-400/25 text-amber-300 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
              <Sun className="w-3.5 h-3.5" />
            </div>
            <div className="text-xs space-y-0.5">
              <span className="font-semibold text-[#f8f6f0] block font-newsreader text-xs">
                Gentle Reflection Insights
              </span>
              <p className="text-[#8f9d92] font-lora leading-relaxed">
                Unpack your emotional weather, mindful observations, and a gentle grounding step for today.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div
            id="auth-error-message"
            className="p-3 text-xs text-red-200 bg-red-950/40 border border-red-500/40 rounded-xl text-center font-lora"
          >
            {error}
          </div>
        )}

        {/* Primary Action Button */}
        <button
          id="btn-google-sign-in"
          onClick={onSignIn}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#fbf9f4] via-[#f5f1e8] to-[#ede7dc] text-[#131b1d] font-semibold text-xs sm:text-sm hover:opacity-95 disabled:opacity-50 transition-all shadow-md cursor-pointer active:scale-[0.99] border border-white/40"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[#131b1d]" />
              <span className="font-newsreader text-xs tracking-wider">Opening Your Journal...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span className="font-newsreader text-sm text-[#131b1d] font-semibold">
                Enter with Google
              </span>
              <ArrowRight className="w-4 h-4 ml-auto text-[#131b1d]/70" />
            </>
          )}
        </button>

        <p className="text-[10px] text-center text-[#718275] tracking-widest uppercase font-mono">
          Cloud Run AI Challenge • dev-tutorial=cloud-run-ai-challenge
        </p>
      </div>
    </div>
  );
};
