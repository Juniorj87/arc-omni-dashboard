'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Menu, X, Layers, Trophy, Globe, 
  Wallet, Activity, LayoutDashboard, Target,
  Settings, ExternalLink, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: 'Terminal', href: '/', icon: LayoutDashboard },
    { name: 'Portfolio', href: '/portfolio', icon: Wallet },
    { name: 'Activity', href: '/activity', icon: Activity },
    { name: 'Missions', href: '/missions', icon: Target },
    { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
  ];

  const secondaryLinks = [
    { name: 'Wallets', href: '/wallets', icon: Settings },
    { name: 'Docs', href: 'https://github.com/Juniorj87/arc-omni-dashboard', icon: Globe, external: true },
  ];

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-6 left-6 z-[100] p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-600/20"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Sidebar Desktop */}
      <aside className="fixed top-0 left-0 bottom-0 w-72 bg-[#0b0f17]/50 backdrop-blur-3xl border-r border-white/5 z-[120] hidden lg:flex flex-col p-8">
        <Logo />
        <nav className="flex-1 mt-12 space-y-2">
           <p className="text-[10px] font-black uppercase text-white/20 tracking-[0.2em] mb-4 ml-4">Main Menu</p>
           {navLinks.map((link) => (
             <NavLink key={link.name} link={link} active={pathname === link.href} />
           ))}
           
           <div className="pt-8">
             <p className="text-[10px] font-black uppercase text-white/20 tracking-[0.2em] mb-4 ml-4">Advanced</p>
             {secondaryLinks.map((link) => (
               <NavLink key={link.name} link={link} active={pathname === link.href} />
             ))}
           </div>
        </nav>

        <Footer />
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[130] lg:hidden"
            />
            <motion.div 
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-[#0b0f17] border-r border-white/5 z-[140] p-8 flex flex-col lg:hidden"
            >
              <div className="flex justify-between items-center mb-12">
                 <Logo />
                 <button onClick={() => setIsOpen(false)} className="p-2 text-white/40 hover:text-white">
                    <X className="w-6 h-6" />
                 </button>
              </div>

              <nav className="flex-1 space-y-2">
                 {navLinks.map((link) => (
                   <NavLink key={link.name} link={link} active={pathname === link.href} onClick={() => setIsOpen(false)} />
                 ))}
                 <div className="pt-8">
                    {secondaryLinks.map((link) => (
                      <NavLink key={link.name} link={link} active={pathname === link.href} onClick={() => setIsOpen(false)} />
                    ))}
                 </div>
              </nav>
              <Footer />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-4 px-2">
      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl shadow-white/5 transition-transform hover:scale-105 active:scale-95 cursor-pointer">
         <Layers className="w-7 h-7 text-black" />
      </div>
      <div className="overflow-visible">
        <span className="font-black tracking-tight text-2xl arc-gradient-text uppercase block leading-tight">Arc Omni</span>
        <span className="text-[9px] font-bold text-white/20 uppercase tracking-[0.3em]">Protocol v1.5</span>
      </div>
    </div>
  );
}

function NavLink({ link, active, onClick }: { link: any, active: boolean, onClick?: () => void }) {
  const isExternal = link.external;
  
  const content = (
    <div className={cn(
      "flex items-center justify-between group p-4 rounded-2xl transition-all duration-300 relative overflow-hidden w-full",
      active ? "bg-white/5 border border-white/10" : "hover:bg-white/[0.02] border border-transparent"
    )}>
      <div className="flex items-center gap-4 relative z-10">
        <link.icon className={cn("w-5 h-5 transition-colors", active ? "text-blue-500" : "text-white/30 group-hover:text-white/60")} />
        <span className={cn(
          "font-bold uppercase text-[11px] tracking-widest transition-colors",
          active ? "text-white" : "text-white/40 group-hover:text-white"
        )}>
          {link.name}
        </span>
      </div>
      {active && (
        <motion.div layoutId="nav-glow" className="absolute inset-0 bg-blue-500/5 blur-xl pointer-events-none" />
      )}
      <div className="relative z-10">
        {isExternal ? (
          <ExternalLink className="w-3.5 h-3.5 text-white/20 group-hover:text-white/40 transition-colors" />
        ) : (
          <ChevronRight className={cn("w-4 h-4 transition-all opacity-0", active ? "opacity-100 text-blue-500 translate-x-0" : "group-hover:opacity-40 -translate-x-2")} />
        )}
      </div>
    </div>
  );

  if (isExternal) {
    return (
      <a href={link.href} target="_blank" rel="noreferrer" onClick={onClick} className="block w-full">
        {content}
      </a>
    );
  }

  return (
    <Link href={link.href} onClick={onClick} className="block w-full">
      {content}
    </Link>
  );
}

function Footer() {
  return (
    <div className="pt-8 border-t border-white/5 space-y-6">
       <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
             <span className="text-[9px] font-black uppercase text-white/30 tracking-widest">System Online</span>
          </div>
          <a href="https://github.com/Juniorj87/arc-omni-dashboard" target="_blank" rel="noreferrer" className="text-white/20 hover:text-white transition-colors">
             <Globe className="w-4 h-4" />
          </a>
       </div>
       <p className="text-[9px] font-black uppercase text-white/5 tracking-[0.4em] text-center">
         Institutional Terminal
       </p>
    </div>
  );
}
