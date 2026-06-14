'use client';

import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { WalletModal } from '@/components/WalletModal';
import { Vote, Clock, CheckCircle2, XCircle, Minus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { notify } from '@/components/NotificationCenter';

interface Proposal {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'passed' | 'rejected' | 'pending';
  votesFor: number;
  votesAgainst: number;
  votesAbstain: number;
  endDate: string;
  author: string;
}

const MOCK_PROPOSALS: Proposal[] = [
  { id: 'ARC-001', title: 'Increase ARC token supply cap', description: 'Proposal to increase the maximum supply of ARC tokens from 1B to 2B to support ecosystem growth.', status: 'active', votesFor: 1250, votesAgainst: 340, votesAbstain: 80, endDate: '2026-06-20', author: '0x1c83...a83d' },
  { id: 'ARC-002', title: 'Add Curve integration rewards', description: 'Enable additional yield incentives for Curve liquidity providers on Arc Testnet.', status: 'active', votesFor: 890, votesAgainst: 120, votesAbstain: 45, endDate: '2026-06-22', author: '0x992a...f411' },
  { id: 'ARC-003', title: 'Reduce gas fees by 20%', description: 'Network upgrade to reduce base gas costs for all transactions on Arc.', status: 'passed', votesFor: 2100, votesAgainst: 200, votesAbstain: 100, endDate: '2026-06-10', author: '0x5511...bc22' },
  { id: 'ARC-004', title: 'Treasury allocation for grants', description: 'Allocate 500K ARC from treasury to fund developer grants and hackathons.', status: 'passed', votesFor: 1800, votesAgainst: 400, votesAbstain: 50, endDate: '2026-06-05', author: '0x424f...2e6c' },
  { id: 'ARC-005', title: 'Reject high inflation proposal', description: 'Community vote to reject the 50% inflation increase.', status: 'rejected', votesFor: 300, votesAgainst: 2500, votesAbstain: 200, endDate: '2026-05-28', author: '0xaaaa...1111' },
];

export default function GovernancePage() {
  const { address, connectWallet, isConnecting, error: walletError, showModal, setShowModal } = useWallet();
  const [filter, setFilter] = useState<string>('all');
  const [proposals, setProposals] = useState(MOCK_PROPOSALS);
  const [votingId, setVotingId] = useState<string | null>(null);

  const filtered = proposals.filter(p => filter === 'all' || p.status === filter);

  const handleVote = async (proposalId: string, vote: 'for' | 'against' | 'abstain') => {
    if (!address) {
      setShowModal(true);
      return;
    }

    setVotingId(proposalId);
    
    // Simulate on-chain voting delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    setProposals(prev => prev.map(p => {
      if (p.id !== proposalId) return p;
      return {
        ...p,
        votesFor: vote === 'for' ? p.votesFor + 1 : p.votesFor,
        votesAgainst: vote === 'against' ? p.votesAgainst + 1 : p.votesAgainst,
        votesAbstain: vote === 'abstain' ? p.votesAbstain + 1 : p.votesAbstain,
      };
    }));

    setVotingId(null);
    notify('success', 'VOTE_RECORDED', `${vote} vote on ${proposalId}`);
  };

  return (
    <div className="p-6 max-w-[1200px] mx-auto space-y-6">
      <header className="border border-[#1a1a1a] bg-[#0f0f0f] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Vote className="w-4 h-4 text-[#00ff41]" />
            <h1 className="font-mono text-lg font-bold text-[#00ff41] uppercase tracking-wider">governance</h1>
            <span className="text-[#2a2a2a]">|</span>
            <span className="font-mono text-[10px] text-[#2a2a2a]">PROPOSAL_VOTING</span>
          </div>
          <div className="flex gap-1">
            {['all', 'active', 'passed', 'rejected'].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={cn("font-mono text-[9px] px-3 py-1.5 border transition-colors uppercase",
                filter === f ? "border-[#00ff41] text-[#00ff41] bg-[#00ff41]/5" : "border-[#1a1a1a] text-[#2a2a2a] hover:text-[#4a4a4a]"
              )}>{f}</button>
            ))}
          </div>
        </div>
      </header>

      {!address && (
        <div className="terminal-card p-4 border-[#ffb000]/20 flex items-center justify-between">
          <span className="font-mono text-[10px] text-[#ffb000]">connect_wallet_to_vote</span>
          <button onClick={() => setShowModal(true)} className="btn-terminal btn-amber py-1.5 px-4 text-[9px]">connect</button>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((p) => {
          const total = p.votesFor + p.votesAgainst + p.votesAbstain;
          const forPct = total > 0 ? (p.votesFor / total) * 100 : 0;
          const againstPct = total > 0 ? (p.votesAgainst / total) * 100 : 0;
          const isVoting = votingId === p.id;

          return (
            <div key={p.id} className={cn("terminal-card p-5 transition-all hover:border-[#00ff41]/20",
              p.status === 'active' && "border-[#00ff41]/10"
            )}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[9px] text-[#4a4a4a]">{p.id}</span>
                  <span className={cn("tag text-[7px]",
                    p.status === 'active' ? "tag-green" : p.status === 'passed' ? "tag-amber" : "tag-red"
                  )}>{p.status}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#2a2a2a]">
                  <Clock className="w-3 h-3" />
                  <span className="font-mono text-[8px]">{p.endDate}</span>
                </div>
              </div>

              <h3 className="font-mono text-[12px] text-[#e0e0e0] mb-1">{p.title}</h3>
              <p className="font-mono text-[9px] text-[#4a4a4a] mb-4">{p.description}</p>

              {/* Vote Bar */}
              <div className="h-1.5 bg-[#1a1a1a] flex overflow-hidden mb-3">
                <div className="bg-[#00ff41] h-full transition-all" style={{ width: `${forPct}%` }} />
                <div className="bg-[#ff3333] h-full transition-all" style={{ width: `${againstPct}%` }} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-[#00ff41]" />
                    <span className="font-mono text-[9px] text-[#00ff41]">{p.votesFor.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <XCircle className="w-3 h-3 text-[#ff3333]" />
                    <span className="font-mono text-[9px] text-[#ff3333]">{p.votesAgainst.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Minus className="w-3 h-3 text-[#4a4a4a]" />
                    <span className="font-mono text-[9px] text-[#4a4a4a]">{p.votesAbstain}</span>
                  </div>
                </div>
                <span className="font-mono text-[8px] text-[#2a2a2a]">by {p.author}</span>
              </div>

              {p.status === 'active' && (
                <div className="flex gap-2 mt-4 pt-3 border-t border-[#1a1a1a]">
                  <button onClick={() => handleVote(p.id, 'for')} disabled={isVoting}
                    className="flex-1 py-2 border border-[#00ff41]/30 font-mono text-[9px] text-[#00ff41] uppercase hover:bg-[#00ff41]/5 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5">
                    {isVoting ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                    vote_for
                  </button>
                  <button onClick={() => handleVote(p.id, 'against')} disabled={isVoting}
                    className="flex-1 py-2 border border-[#ff3333]/30 font-mono text-[9px] text-[#ff3333] uppercase hover:bg-[#ff3333]/5 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5">
                    {isVoting ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                    vote_against
                  </button>
                  <button onClick={() => handleVote(p.id, 'abstain')} disabled={isVoting}
                    className="py-2 px-4 border border-[#1a1a1a] font-mono text-[9px] text-[#4a4a4a] uppercase hover:text-[#e0e0e0] transition-colors disabled:opacity-50">
                    abstain
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <WalletModal isOpen={showModal} onClose={() => setShowModal(false)} onSelect={connectWallet} isConnecting={isConnecting} error={walletError} />
    </div>
  );
}
