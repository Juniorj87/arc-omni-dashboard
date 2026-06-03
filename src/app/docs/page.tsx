'use client';

import { ShieldCheck, Info, Book, Zap, Layers, Globe, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function DocsPage() {
  const sections = [
    {
      title: "Introduction",
      content: "Arc Omni is an institutional-grade portfolio terminal designed exclusively for the Arc Testnet. It provides high-precision data aggregation across multiple DeFi protocols.",
      icon: Info
    },
    {
      title: "DropScore Algorithm",
      content: "Our proprietary algorithm calculates airdrop eligibility based on three vectors: Active Days (30%), Protocol Depth (40%), and Total Operation Count (30%).",
      icon: Zap
    },
    {
      title: "Supported Protocols",
      content: "Currently tracking Achswap V2 pools, Curve Stable pools, and ArcPerps margin accounts. Support for PrestoDEX and Synthra is in active development.",
      icon: Layers
    }
  ];

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto space-y-12 pt-24 pb-20">
      <header className="space-y-4">
        <Link href="/" className="text-[10px] font-black uppercase text-white/20 hover:text-white transition-colors tracking-widest">← Back to Terminal</Link>
        <h1 className="text-5xl font-bold arc-gradient-text tracking-tighter">Documentation</h1>
        <p className="text-muted-foreground text-lg">Understanding the Arc Omni Ecosystem Intelligence.</p>
      </header>

      <div className="space-y-12">
        {sections.map((section, i) => (
          <section key={i} className="arc-glass rounded-3xl p-8 border border-white/5 space-y-4">
            <div className="flex items-center gap-3 text-blue-500">
               <section.icon className="w-5 h-5" />
               <h3 className="font-bold uppercase tracking-widest text-sm">{section.title}</h3>
            </div>
            <p className="text-white/60 leading-relaxed italic">{section.content}</p>
          </section>
        ))}

        <section className="bg-white rounded-3xl p-10 text-black space-y-6">
           <h3 className="text-2xl font-black tracking-tighter">Technical Integration</h3>
           <p className="text-sm font-medium opacity-70">
             Arc Omni connects directly to the `https://rpc.testnet.arc.network` provider. No intermediate servers are used for balance fetching, ensuring your data is as accurate as the block explorer.
           </p>
           <div className="flex flex-wrap gap-4 pt-4">
              <a href="https://github.com/Juniorj87" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full font-bold text-xs hover:scale-105 transition-all">
                 <Globe className="w-4 h-4" /> View GitHub
              </a>
              <div className="flex items-center gap-2 px-6 py-3 border border-black/10 rounded-full font-bold text-xs italic">
                 Chain ID: 5042002
              </div>
           </div>
        </section>
      </div>

      <footer className="pt-10 text-center">
         <p className="text-[9px] font-black uppercase text-white/10 tracking-[0.5em]">Built for the Arc Community</p>
      </footer>
    </main>
  );
}
