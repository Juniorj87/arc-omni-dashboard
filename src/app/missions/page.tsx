'use client';

import { useWallet } from '@/hooks/useWallet';
import { useMissions } from '@/hooks/useMissions';
import { useOmniPositions } from '@/hooks/useOmniPositions';
import { cn } from '@/lib/utils';
import { Target, Trophy, Zap, Shield, ArrowRight, Flame, Loader2, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { notify } from '@/components/NotificationCenter';
import { WalletModal } from '@/components/WalletModal';

const MISSION_ICONS = [Shield, Zap, Target, Flame, Shield];

export default function MissionsPage() {
  const { address, connect, connectWallet, isConnecting, error: walletError, showModal, setShowModal } = useWallet();
  const { missions, totalClaimedPoints, isClaiming, claimMission } = useMissions(address);
  const { extraData } = useOmniPositions(address);

  const handleClaim = async (missionId: number, points: number) => {
    if (!address) { setShowModal(true); return; }
    const success = await claimMission(missionId);
    if (success) {
      notify('success', 'MISSION_COMPLETE', `${points} pts synchronized`);
    } else {
      notify('error', 'CLAIM_FAILED', 'Could not claim rewards');
    }
  };

  const totalPoints = totalClaimedPoints || extraData.score || 0;
  const completedCount = missions.filter(m => m.completed).length;
  const claimedCount = missions.filter(m => m.claimed).length;
  const progress = (completedCount / Math.max(missions.length, 1)) * 100;

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <header className="border border-[#1a1a1a] bg-[#0f0f0f] p-4">
        <div className="flex items-center gap-3">
          <Target className="w-4 h-4 text-[#00ff41]" />
          <h1 className="font-mono text-lg font-bold text-[#00ff41] uppercase tracking-wider">missions</h1>
          <span className="text-[#2a2a2a]">|</span>
          <span className="font-mono text-[10px] text-[#2a2a2a]">ACHIEVEMENT_SYSTEM</span>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="terminal-card p-4">
          <p className="font-mono text-[8px] text-[#2a2a2a] uppercase tracking-[0.2em] mb-1">total_score</p>
          <p className="font-mono text-lg font-bold text-[#00ff41] glow-green">{totalPoints.toLocaleString()}</p>
        </div>
        <div className="terminal-card p-4">
          <p className="font-mono text-[8px] text-[#2a2a2a] uppercase tracking-[0.2em] mb-1">streak</p>
          <p className="font-mono text-lg font-bold text-[#ffb000] glow-amber">{extraData.activeDays}d</p>
        </div>
        <div className="terminal-card p-4">
          <p className="font-mono text-[8px] text-[#2a2a2a] uppercase tracking-[0.2em] mb-1">completion</p>
          <p className="font-mono text-lg font-bold text-[#e0e0e0]">{progress.toFixed(0)}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-3">
          <span className="font-mono text-[9px] text-[#2a2a2a] uppercase tracking-[0.3em]">active_objectives//</span>
          {missions.map((m, i) => {
            const Icon = MISSION_ICONS[i] || Shield;
            return (
              <div key={m.id} className={cn(
                "terminal-card p-4 flex items-center justify-between group transition-all",
                m.completed ? "border-[#00ff41]/20" : ""
              )}>
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-8 h-8 border flex items-center justify-center transition-colors",
                    m.completed ? "border-[#00ff41]/30 text-[#00ff41] bg-[#00ff41]/5" : "border-[#1a1a1a] text-[#2a2a2a]"
                  )}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-[#e0e0e0] uppercase">{m.title}</span>
                      <span className="font-mono text-[8px] text-[#00ff41] border border-[#00ff41]/20 px-1.5 py-0.5">+{m.points}</span>
                    </div>
                    <p className="font-mono text-[9px] text-[#2a2a2a] mt-0.5">{m.description}</p>
                  </div>
                </div>
                
                {m.completed ? (
                  m.claimed ? (
                    <div className="flex items-center gap-1.5 text-[#00ff41]">
                      <CheckCircle2 className="w-3 h-3" />
                      <span className="font-mono text-[9px] uppercase">claimed</span>
                    </div>
                  ) : (
                    <button onClick={() => handleClaim(m.id, m.points)} disabled={isClaiming === m.id}
                      className="btn-terminal py-1.5 px-4 text-[9px]">
                      {isClaiming === m.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'claim'}
                    </button>
                  )
                ) : (
                  <ArrowRight className="w-3 h-3 text-[#1a1a1a] group-hover:text-[#4a4a4a] transition-colors" />
                )}
              </div>
            );
          })}
        </div>

        <div className="lg:col-span-4 space-y-4">
          <div className="terminal-card p-4">
            <span className="font-mono text-[9px] text-[#2a2a2a] uppercase tracking-[0.3em] block mb-4">season_1_rewards//</span>
            <div className="space-y-4">
              <RewardItem title="early_adopter" req="1000 pts" progress={Math.min(100, (totalPoints / 1000) * 100)} />
              <RewardItem title="contributor" req="5 missions" progress={(completedCount / 5) * 100} />
              <RewardItem title="pioneer" req="bridge_assets" progress={missions.find(m => m.id === 3)?.claimed ? 100 : 0} />
            </div>
          </div>

          <div className="terminal-card p-4">
            <span className="font-mono text-[9px] text-[#2a2a2a] uppercase tracking-[0.3em] block mb-4">daily_bonus//</span>
            <button onClick={() => { if (!address) { setShowModal(true); return; } notify('success', 'BONUS', '+50 EXP'); }}
              className="w-full terminal-card p-4 border border-[#ffb000]/20 hover:border-[#ffb000]/40 transition-colors text-center group">
              <Zap className="w-5 h-5 text-[#ffb000] mx-auto mb-2 group-hover:glow-amber" />
              <p className="font-mono text-[10px] text-[#ffb000] uppercase">authorize_bonus</p>
              <p className="font-mono text-[8px] text-[#2a2a2a] mt-1">+50 EXP</p>
            </button>
          </div>
        </div>
      </div>
      <WalletModal isOpen={showModal} onClose={() => setShowModal(false)} onSelect={connectWallet} isConnecting={isConnecting} error={walletError} />
    </div>
  );
}

function RewardItem({ title, req, progress }: { title: string, req: string, progress: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="font-mono text-[9px] text-[#4a4a4a] uppercase">{title}</span>
        <span className="font-mono text-[8px] text-[#2a2a2a]">{progress.toFixed(0)}%</span>
      </div>
      <div className="h-1 bg-[#1a1a1a] overflow-hidden">
        <div className="h-full bg-[#00ff41] transition-all" style={{ width: `${progress}%` }} />
      </div>
      <p className="font-mono text-[7px] text-[#2a2a2a]">{req}</p>
    </div>
  );
}
