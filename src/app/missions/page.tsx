'use client';

import { useWallet } from '@/hooks/useWallet';
import { useOmniPositions } from '@/hooks/useOmniPositions';
import { cn } from '@/lib/utils';
import { 
  Target, Trophy, Zap, Star, Shield, 
  CheckCircle2, ArrowRight, Flame, Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { notify } from '@/components/NotificationCenter';

export default function MissionsPage() {
  const { address } = useWallet();
  const { extraData } = useOmniPositions(address);
  const [claiming, setClaiming] = useState<number | null>(null);

  const missions = [
    { id: 1, title: 'Identity Link', description: 'Connect your Web3 wallet to the terminal.', points: 10, completed: !!address, icon: Shield },
    { id: 2, title: 'Payload Transmission', description: 'Complete your first ERC20 transfer on Arc.', points: 50, completed: extraData.txCount > 0, icon: Zap },
    { id: 3, title: 'Liquidity Provision', description: 'Swap or add liquidity to any supported DEX.', points: 100, completed: extraData.txCount > 5, icon: Target },
    { id: 4, title: 'Ecosystem Bridge', description: 'Bridge assets from another network to Arc.', points: 250, completed: false, icon: Star },
    { id: 5, title: 'Daily Check-in', description: 'Access the terminal 3 days in a row.', points: 25, completed: extraData.activeDays >= 3, icon: Flame },
  ];

  const handleClaim = (id: number, points: number) => {
    setClaiming(id);
    setTimeout(() => {
      setClaiming(null);
      notify('success', 'Points Secured', `Successfully synchronized ${points} protocol points.`);
    }, 1500);
  };

  const totalPoints = extraData.score || 0;
  const completedCount = missions.filter(m => m.completed).length;
  const progress = (completedCount / missions.length) * 100;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white">Mission Center</h1>
          <p className="text-xs font-bold text-white/40 uppercase tracking-widest mt-1">Ecosystem Achievement System</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="arc-glass px-6 py-3 rounded-2xl border border-white/10 flex flex-col items-end">
            <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Global Rank</span>
            <span className="text-lg font-black text-blue-500 italic uppercase">Rank A - Elite</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ScoreCard label="Activity Score" value={totalPoints.toLocaleString()} icon={Trophy} color="blue" />
        <ScoreCard label="Active Streak" value={extraData.activeDays} symbol="Days" icon={Flame} color="orange" />
        <ScoreCard label="Completion" value={`${progress.toFixed(0)}%`} icon={Target} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-4">
           <h3 className="text-[10px] font-black uppercase text-white/20 tracking-[0.3em] mb-6 ml-2">Active Objectives</h3>
           {missions.map((m, i) => (
             <MissionItem 
               key={m.id} 
               mission={m} 
               index={i} 
               isClaiming={claiming === m.id}
               onClaim={() => handleClaim(m.id, m.points)}
             />
           ))}
        </div>

        <div className="lg:col-span-4 space-y-6">
           <section className="arc-glass rounded-[2.5rem] p-8 border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8">
                <Trophy className="w-12 h-12 text-white/5" />
              </div>
              <h3 className="font-bold text-xs uppercase tracking-[0.2em] text-white/40 mb-8">Season 1 Rewards</h3>
              <div className="space-y-6">
                 <RewardItem title="Early Adopter Badge" requirement="Reach 1,000 Points" progress={Math.min(100, (totalPoints / 1000) * 100)} />
                 <RewardItem title="Ecosystem Contributor" requirement="5 Completed Missions" progress={(completedCount / 5) * 100} />
                 <RewardItem title="Arc Pioneer" requirement="Bridge Assets" progress={0} />
              </div>
              <button className="w-full mt-10 py-4 bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all">
                 View All Rewards
              </button>
           </section>

           <section className="arc-glass rounded-[2.5rem] p-8 border border-white/5">
              <h3 className="font-bold text-xs uppercase tracking-[0.2em] text-white/40 mb-6">Daily Bonus</h3>
              <button 
                onClick={() => handleClaim(99, 50)}
                disabled={claiming !== null}
                className="w-full bg-blue-600/10 border border-blue-500/20 rounded-2xl p-6 flex flex-col items-center text-center space-y-3 hover:bg-blue-600/20 transition-all group"
              >
                 <Zap className={cn("w-8 h-8 text-blue-500 transition-transform group-hover:scale-110", claiming === 99 && "animate-pulse")} />
                 <p className="text-xs font-bold text-white uppercase tracking-widest">Authorize Daily Bonus</p>
                 <div className="text-2xl font-black text-white italic">CLAIM NOW</div>
                 <p className="text-[10px] text-white/40 uppercase font-bold">+50 EXP Bonus</p>
              </button>
           </section>
        </div>
      </div>
    </div>
  );
}

function ScoreCard({ label, value, symbol, icon: Icon, color }: { label: string, value: string | number, symbol?: string, icon: any, color: string }) {
  return (
    <div className="arc-glass rounded-[2.5rem] p-8 border border-white/5 relative overflow-hidden group">
      <div className={cn(
        "absolute -top-12 -right-12 w-32 h-32 blur-3xl opacity-20 transition-opacity group-hover:opacity-40",
        color === 'blue' ? "bg-blue-600" : color === 'orange' ? "bg-orange-600" : "bg-purple-600"
      )} />
      <Icon className={cn(
        "w-6 h-6 mb-6",
        color === 'blue' ? "text-blue-500" : color === 'orange' ? "text-orange-500" : "text-purple-500"
      )} />
      <div className="space-y-1">
        <p className="text-[10px] font-black uppercase text-white/20 tracking-widest">{label}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-4xl font-black italic tracking-tighter text-white">{value}</h3>
          {symbol && <span className="text-[10px] font-bold text-white/20 uppercase">{symbol}</span>}
        </div>
      </div>
    </div>
  );
}

function MissionItem({ mission, index, isClaiming, onClaim }: { mission: any, index: number, isClaiming: boolean, onClaim: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        "arc-glass rounded-[2rem] p-6 border border-white/5 flex items-center justify-between group transition-all",
        mission.completed ? "border-green-500/10" : "hover:border-white/20 hover:bg-white/[0.04]"
      )}
    >
      <div className="flex items-center gap-5">
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center border transition-all",
          mission.completed ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-white/5 border-white/5 text-white/30 group-hover:text-white"
        )}>
          <mission.icon className="w-6 h-6" />
        </div>
        <div>
           <div className="flex items-center gap-2">
             <h4 className="font-bold text-sm text-white uppercase tracking-tight">{mission.title}</h4>
             <span className="text-[10px] font-black text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-md">+{mission.points}</span>
           </div>
           <p className="text-[11px] text-white/40 font-medium">{mission.description}</p>
        </div>
      </div>
      
      {mission.completed ? (
        <button 
          onClick={onClaim}
          disabled={isClaiming}
          className="bg-green-500 text-black px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
        >
           {isClaiming ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Claim'}
        </button>
      ) : (
        <div className="text-white/10 group-hover:text-white transition-all group-hover:translate-x-1">
           <ArrowRight className="w-5 h-5" />
        </div>
      )}
    </motion.div>
  );
}

function RewardItem({ title, requirement, progress }: { title: string, requirement: string, progress: number }) {
  return (
    <div className="space-y-2">
       <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
          <span className="text-white/60">{title}</span>
          <span className="text-white/20">{progress.toFixed(0)}%</span>
       </div>
       <div className="h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]"
          />
       </div>
       <p className="text-[9px] text-white/20 italic">{requirement}</p>
    </div>
  );
}
