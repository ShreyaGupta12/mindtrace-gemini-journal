import React from 'react';
import { LogOut, User as UserIcon, ShieldCheck, Menu, Feather, Sparkles } from 'lucide-react';
import type { User } from 'firebase/auth';

interface AppHeaderProps {
  user: User;
  onSignOut: () => void;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  user,
  onSignOut,
  onToggleSidebar,
  isSidebarOpen,
}) => {
  return (
    <header
      id="app-top-header"
      className="h-14 border-b border-white/[0.08] bg-[#0d0f15] flex items-center justify-between px-4 sm:px-6 shrink-0 z-30"
    >
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle */}
        <button
          id="btn-toggle-sidebar"
          onClick={onToggleSidebar}
          className="md:hidden p-1.5 rounded-lg text-[#a19e95] hover:text-[#f3f2ee] hover:bg-white/[0.06] transition-colors"
          title="Toggle navigation"
          aria-label="Toggle navigation drawer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand identity */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#181c28] border border-[#a78bfa]/30 flex items-center justify-center text-[#c4b8f3] shadow-xs">
            <Feather className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold tracking-tight text-[#f3f2ee] leading-none">
                MindTrace
              </h1>
              <span className="hidden sm:inline-block text-[10px] uppercase tracking-wider font-semibold text-[#a78bfa] bg-[#a78bfa]/10 px-1.5 py-0.5 rounded border border-[#a78bfa]/20">
                Midnight Paper
              </span>
            </div>
            <p className="text-[11px] text-[#8a8880] tracking-normal leading-tight mt-0.5 hidden xs:block">
              Think it. Explore it. Understand it.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Privacy badge */}
        <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-[#8a8880] bg-[#141722] border border-white/[0.06] px-2.5 py-1 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="truncate max-w-[200px]">
            Isolated to UID ({user.email})
          </span>
        </div>

        {/* User profile avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-white/[0.08]">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || 'User Avatar'}
              className="w-7 h-7 rounded-full border border-white/[0.15]"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-[#181c28] border border-white/[0.12] flex items-center justify-center text-[#c8c6bf]">
              <UserIcon className="w-3.5 h-3.5" />
            </div>
          )}
          <span className="hidden sm:inline text-xs font-medium text-[#dedcd5] max-w-[120px] truncate">
            {user.displayName || user.email?.split('@')[0]}
          </span>
        </div>

        {/* Sign out */}
        <button
          id="btn-sign-out"
          onClick={onSignOut}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg text-[#a19e95] hover:text-[#f3f2ee] hover:bg-white/[0.06] transition-colors"
          title="Sign out of MindTrace"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
};
