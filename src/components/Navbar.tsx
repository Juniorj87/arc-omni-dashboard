'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Layers, Trophy, Zap, Wallet, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: 'Terminal', href: '/', icon: Layers },
    { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
    { name: 'Airdrop Checker', href: '/leaderboard', icon: Zap },
    { name: 'Documentation', href: '/docs', icon: Globe },
  ];

  return (
    <>
      {/* Burger Button - High Visibility Version */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed top-6 left-6 z-[100] p-4 bg-blue-600 text-white rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.5)] hover:bg-blue-500 hover:scale-110 transition-all flex items-center justify-center backdrop-blur-xl"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110]"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-[#050505] border-r border-white/5 z-[120] p-8 flex flex-col shadow-2xl"
            >
              <div className="flex justify-between items-center mb-12">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                       <Layers className="w-6 h-6 text-black" />
                    </div>
                    <span className="font-bold tracking-tighter text-2xl arc-gradient-text uppercase">Arc Oracle</span>
                 </div>
                 <button onClick={() => setIsOpen(false)} className="p-2 text-white/40 hover:text-white">
                    <X className="w-6 h-6" />
                 </button>
              </div>

              <nav className="flex-1 space-y-2">
                 {navLinks.map((link) => (
                   <Link 
                     key={link.name} 
                     href={link.href}
                     onClick={() => setIsOpen(false)}
                     className={cn(
                       "flex items-center gap-4 p-4 rounded-2xl transition-all font-bold uppercase text-[10px] tracking-[0.2em]",
                       pathname === link.href ? "bg-white text-black" : "text-white/40 hover:bg-white/5 hover:text-white"
                     )}
                   >
                     <link.icon className="w-5 h-5" />
                     {link.name}
                   </Link>
                 ))}
              </nav>

              <div className="pt-8 border-t border-white/5 space-y-6">
                 <div className="flex items-center gap-4">
                    <a href="https://github.com/Juniorj87/arc-omni-dashboard" target="_blank" rel="noreferrer" className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all">
                       <Globe className="w-6 h-6" />
                    </a>
                 </div>
                 <p className="text-[9px] font-black uppercase text-white/10 tracking-[0.3em]">
                   v1.2.0 Institutional Edition
                 </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
