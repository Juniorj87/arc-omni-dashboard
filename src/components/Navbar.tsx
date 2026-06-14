'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Menu, X, Terminal, Trophy, Globe, 
  Wallet, Activity, LayoutDashboard, Target,
  Settings, ExternalLink, ChevronRight, Search, Flame,
  TrendingUp, Image, Vote, Book
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: 'terminal', href: '/', icon: Terminal, shortcut: 'F1' },
    { name: 'portfolio', href: '/portfolio', icon: Wallet, shortcut: 'F2' },
    { name: 'activity', href: '/activity', icon: Activity, shortcut: 'F3' },
    { name: 'missions', href: '/missions', icon: Target, shortcut: 'F4' },
    { name: 'leaderboard', href: '/leaderboard', icon: Trophy, shortcut: 'F5' },
    { name: 'scanner', href: '/scanner', icon: Search, shortcut: 'F6' },
    { name: 'gas', href: '/gas', icon: Flame, shortcut: 'F7' },
    { name: 'yield', href: '/yield', icon: TrendingUp, shortcut: 'F8' },
    { name: 'nfts', href: '/nfts', icon: Image, shortcut: 'F9' },
    { name: 'governance', href: '/governance', icon: Vote, shortcut: 'F10' },
    { name: 'addresses', href: '/addresses', icon: Book, shortcut: 'F11' },
  ];

  const secondaryLinks = [
    { name: 'wallets', href: '/wallets', icon: Settings },
    { name: 'docs', href: 'https://github.com/Juniorj87/arc-omni-dashboard', icon: Globe, external: true },
  ];

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-[100] p-2 bg-[#0f0f0f] border border-[#1a1a1a] text-[#00ff41] hover:border-[#00ff41] transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Sidebar Desktop */}
      <aside className="fixed top-0 left-0 bottom-0 w-64 bg-[#0a0a0a] border-r border-[#1a1a1a] z-[120] hidden lg:flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-[#1a1a1a]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border border-[#00ff41] flex items-center justify-center glow-box-green">
              <Terminal className="w-4 h-4 text-[#00ff41]" />
            </div>
            <div>
              <span className="font-mono font-bold text-sm text-[#00ff41] tracking-wider block leading-tight">ARC</span>
              <span className="font-mono text-[8px] text-[#4a4a4a] uppercase tracking-[0.3em]">terminal v2.0</span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="text-[8px] font-bold text-[#2a2a2a] uppercase tracking-[0.3em] mb-3 px-3">main//</p>
          {navLinks.map((link) => (
            <NavLink key={link.name} link={link} active={pathname === link.href} />
          ))}
          
          <div className="pt-6">
            <p className="text-[8px] font-bold text-[#2a2a2a] uppercase tracking-[0.3em] mb-3 px-3">sys//</p>
            {secondaryLinks.map((link) => (
              <NavLink key={link.name} link={link} active={pathname === link.href} />
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-[#1a1a1a]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00ff41] pulse-green" />
              <span className="text-[8px] font-bold text-[#4a4a4a] uppercase tracking-[0.2em]">online</span>
            </div>
            <span className="text-[8px] text-[#2a2a2a] font-mono">arc_testnet</span>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/90 z-[130] lg:hidden"
            />
            <motion.div 
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-[#0a0a0a] border-r border-[#1a1a1a] z-[140] p-6 flex flex-col lg:hidden"
            >
              <div className="flex justify-between items-center mb-8 pb-4 border-b border-[#1a1a1a]">
                <div className="flex items-center gap-3">
                  <Terminal className="w-5 h-5 text-[#00ff41]" />
                  <span className="font-mono font-bold text-sm text-[#00ff41]">ARC</span>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 text-[#4a4a4a] hover:text-[#e0e0e0]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 space-y-1">
                {navLinks.map((link) => (
                  <NavLink key={link.name} link={link} active={pathname === link.href} onClick={() => setIsOpen(false)} />
                ))}
                <div className="pt-6">
                  {secondaryLinks.map((link) => (
                    <NavLink key={link.name} link={link} active={pathname === link.href} onClick={() => setIsOpen(false)} />
                  ))}
                </div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function NavLink({ link, active, onClick }: { link: any, active: boolean, onClick?: () => void }) {
  const isExternal = link.external;
  
  const content = (
    <div className={cn(
      "flex items-center justify-between group px-3 py-2.5 transition-all duration-150 relative w-full",
      active 
        ? "bg-[#00ff41]/5 border-l-2 border-[#00ff41] text-[#00ff41]" 
        : "border-l-2 border-transparent hover:bg-[#141414] text-[#4a4a4a] hover:text-[#e0e0e0]"
    )}>
      <div className="flex items-center gap-3">
        <link.icon className={cn("w-4 h-4", active ? "text-[#00ff41]" : "text-[#2a2a2a] group-hover:text-[#4a4a4a]")} />
        <span className="font-mono text-[11px] font-medium tracking-wider lowercase">
          {link.name}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {link.shortcut && (
          <span className={cn(
            "text-[8px] font-mono px-1.5 py-0.5 border",
            active ? "border-[#00ff41]/30 text-[#00ff41]/60" : "border-[#1a1a1a] text-[#2a2a2a]"
          )}>
            {link.shortcut}
          </span>
        )}
        {isExternal && <ExternalLink className="w-3 h-3 text-[#2a2a2a]" />}
      </div>
    </div>
  );

  if (isExternal) {
    return (
      <a href={link.href} target="_blank" rel="noreferrer" onClick={onClick} className="block">
        {content}
      </a>
    );
  }

  return (
    <Link href={link.href} onClick={onClick} className="block">
      {content}
    </Link>
  );
}
