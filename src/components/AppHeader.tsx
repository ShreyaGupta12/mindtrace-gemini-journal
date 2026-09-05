import React from 'react';
import { LogOut, User as UserIcon, ShieldCheck, Menu, Sprout, Heart, Coffee } from 'lucide-react';
import type { User } from 'firebase/auth';

interface AppHeaderProps {
  user: User;
  onSignOut: () => void;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

/**
 * Safely masks an email address to protect user privacy.
 * E.g., 'shreyaguptacsbs@gmail.com' -> 'sh••••••s@gmail.com'
 */
export function maskEmail(email: string | null | undefined): string {
  if (!email) return 'Anonymous';
  const atIndex = email.indexOf('@');
  if (atIndex <= 0) return '••••••';
  
  const localPart = email.slice(0, atIndex);
  const domain = email.slice(atIndex); // e.g. '@gmail.com'
  
  if (localPart.length <= 2) {
    return `${localPart[0]}*${domain}`;
  }
  
  const start = localPart.slice(0, 2);
  const end = localPart.length > 4 ? localPart.slice(-1) : '';
  const maskedLength = Math.max(3, Math.min(localPart.length - 2 - end.length, 6));
  const mask = '•'.repeat(maskedLength);
  
  return `${start}${mask}${end}${domain}`;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  user,
  onSignOut,
  onToggleSidebar,
}) => {
  const maskedEmail = maskEmail(user.email);
  return (
    <header
      id="app-top-header"
      className="h-16 border-b border-emerald-500/15 bg-[#101618]/90 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 shrink-0 z-30 relative shadow-sm"
    >
      {/* Decorative top soft chamomile accent line */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-amber-300/30 to-emerald-300/30" />

      <div className="flex items-center gap-3">
        {/* Mobile menu toggle */}
        <button
          id="btn-toggle-sidebar"
          onClick={onToggleSidebar}
          className="md:hidden p-2 rounded-xl text-[#a5ad9f] hover:text-[#f7f5ed] hover:bg-white/[0.08] transition-all"
          title="Toggle notebooks"
          aria-label="Toggle navigation drawer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand identity: Whimsical English Mental Health Haven */}
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#182420] to-[#121a1b] border border-emerald-400/25 flex items-center justify-center text-emerald-300 shadow-[0_0_15px_rgba(126,168,143,0.15)] transition-transform group-hover:scale-105">
              <Coffee className="w-4 h-4 text-amber-200" />
              <Sprout className="w-3 h-3 text-emerald-300 absolute -top-1 -right-1" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold tracking-normal text-transparent bg-clip-text bg-gradient-to-r from-[#fbf9f4] via-[#e5e0d3] to-[#f4deb2] font-newsreader leading-none">
                MindTrace
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] tracking-wide font-medium text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-400/20 shadow-xs">
                <Heart className="w-2.5 h-2.5 text-rose-300" />
                Gentle Mind Haven
              </span>
            </div>
            <p className="text-[11px] text-[#9aaba1] font-lora italic tracking-wide leading-tight mt-0.5 hidden xs:block">
              "A warm cup of tea for your thoughts & mental wellbeing"
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Privacy & Safe Sanctuary badge */}
        <div
          className="hidden lg:flex items-center gap-1.5 text-[11px] text-[#abb9af] bg-[#141d1e]/80 border border-emerald-500/20 px-3 py-1 rounded-full shadow-xs select-none"
          title="Your identity and personal journal entries are end-to-end isolated and private"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="font-lora text-xs italic text-amber-200/90 font-medium">Safe &amp; Private:</span>
          <span className="truncate max-w-[170px] text-[11px] text-[#d6ded8] tracking-wider font-mono">
            {maskedEmail}
          </span>
        </div>

        {/* User profile avatar */}
        <div className="flex items-center gap-2.5 pl-2.5 border-l border-emerald-500/15">
          {user.photoURL ? (
            <div className="relative">
              <img
                src={user.photoURL}
                alt={user.displayName || 'User Avatar'}
                className="w-8 h-8 rounded-full border border-amber-300/30 p-0.5 object-cover"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#101618]" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1b2622] to-[#121b18] border border-emerald-400/25 flex items-center justify-center text-emerald-200">
              <UserIcon className="w-4 h-4" />
            </div>
          )}
          <span className="hidden sm:inline text-xs font-medium text-[#e3e8e1] max-w-[130px] truncate font-newsreader">
            {user.displayName || maskedEmail}
          </span>
        </div>

        {/* Sign out */}
        <button
          id="btn-sign-out"
          onClick={onSignOut}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl text-[#9aaba1] hover:text-[#f7f5ed] hover:bg-white/[0.08] border border-transparent hover:border-emerald-400/20 transition-all cursor-pointer"
          title="Rest & Sign Out"
        >
          <LogOut className="w-3.5 h-3.5 text-emerald-300" />
          <span className="hidden sm:inline font-lora text-xs">Take a Break</span>
        </button>
      </div>
    </header>
  );
};
