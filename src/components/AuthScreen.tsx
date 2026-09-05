import React from 'react';
import { Shield, Sparkles, Lock, ArrowRight, Loader2, Feather, Compass } from 'lucide-react';

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
      className="min-h-screen bg-[#0c0e14] text-[#f3f2ee] flex items-center justify-center p-4 sm:p-6"
    >
      <div className="max-w-md w-full bg-[#131620] border border-white/[0.08] rounded-2xl shadow-2xl p-8 space-y-7 relative overflow-hidden">
        {/* Subtle decorative glow accents */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#a78bfa]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Product Brand Header */}
        <div className="text-center space-y-2.5 relative">
          <div className="w-12 h-12 rounded-xl bg-[#1a1e2b] border border-[#a78bfa]/30 text-[#c4b8f3] flex items-center justify-center mx-auto mb-3 shadow-md">
            <Feather className="w-5 h-5" />
          </div>
          <div className="inline-block px-2.5 py-0.5 rounded-full bg-[#a78bfa]/10 border border-[#a78bfa]/20 text-[10px] uppercase tracking-widest font-semibold text-[#c4b8f3]">
            Midnight Paper Edition
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#f3f2ee]">
            MindTrace
          </h1>
          <p className="text-xs text-[#a19e95] tracking-wide italic">
            "Think it. Explore it. Understand it."
          </p>
          <p className="text-xs text-[#8a8880] max-w-xs mx-auto leading-relaxed pt-1">
            A calm, sophisticated editorial journal for multi-turn brainstorming, contemplative writing, and deep AI reflection insights.
          </p>
        </div>

        {/* Security & Core Architecture Highlights */}
        <div className="bg-[#181c28] border border-white/[0.06] rounded-xl p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <div className="text-xs space-y-0.5">
              <span className="font-medium text-[#f3f2ee] block">
                Strict Cloud Firestore Isolation
              </span>
              <p className="text-[#8a8880] leading-relaxed">
                Your entries, conversations, and reflections are locked strictly to your authenticated Firebase UID.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-md bg-[#a78bfa]/10 border border-[#a78bfa]/20 text-[#c4b8f3] flex items-center justify-center shrink-0 mt-0.5">
              <Lock className="w-3.5 h-3.5" />
            </div>
            <div className="text-xs space-y-0.5">
              <span className="font-medium text-[#f3f2ee] block">
                Zero Frontend Credentials
              </span>
              <p className="text-[#8a8880] leading-relaxed">
                Gemini reasoning runs through a token-verified Cloud Run backend proxy.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div className="text-xs space-y-0.5">
              <span className="font-medium text-[#f3f2ee] block">
                AI Reflection Insight
              </span>
              <p className="text-[#8a8880] leading-relaxed">
                Extracts emotional tone, core themes, cognitive patterns, and daily actions from your sessions.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div
            id="auth-error-message"
            className="p-3 text-xs text-red-300 bg-red-950/40 border border-red-800/60 rounded-lg text-center"
          >
            {error}
          </div>
        )}

        {/* Primary Action Button */}
        <button
          id="btn-google-sign-in"
          onClick={onSignIn}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-[#f3f2ee] text-[#0c0e14] font-semibold text-xs sm:text-sm hover:bg-[#dedcd5] disabled:opacity-50 transition-all shadow-lg cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[#0c0e14]" />
              <span>Authenticating with Google...</span>
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
              <span>Sign in with Google</span>
              <ArrowRight className="w-4 h-4 ml-auto text-[#0c0e14]/70" />
            </>
          )}
        </button>

        <p className="text-[10px] text-center text-[#6b6962] tracking-wider uppercase">
          Cloud Run AI Challenge • dev-tutorial=cloud-run-ai-challenge
        </p>
      </div>
    </div>
  );
};
