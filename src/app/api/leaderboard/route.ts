import { NextResponse } from 'next/server';

/**
 * ARC LEADERBOARD API
 * 
 * Scalable architecture for tracking active wallets.
 * In a production environment, this would connect to the PostgreSQL table defined in SCHEMA.sql.
 */

// Mock DB for the session (Replace with real DB client like 'pg' or 'Prisma')
let mockDb: any[] = [
    { address: '0x1c8300000000000000000000000000000000a83d', label: 'Protocol Sentinel', score: 1254000, tx_count: 15400, net_worth: 850000, active_days: 180 },
    { address: '0x992a00000000000000000000000000000000f411', label: 'Arc Titan', score: 982100, tx_count: 12500, net_worth: 420000, active_days: 150 },
    { address: '0x551100000000000000000000000000000000bc22', label: 'Heavy Liquidity', score: 748900, tx_count: 8600, net_worth: 210000, active_days: 120 },
];

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    try {
        // 1. Sort by score
        const sorted = [...mockDb].sort((a, b) => b.score - a.score);

        // 2. Add ranking and percentile
        const total = sorted.length;
        const leaderboard = sorted.map((entry, index) => {
            const rank = index + 1;
            const percentile = ((total - rank) / total) * 100;
            return { ...entry, rank, percentile };
        });

        // 3. Network Statistics
        const stats = {
            totalWallets: total,
            totalTxCount: mockDb.reduce((acc, curr) => acc + curr.tx_count, 0),
            totalValueUsd: mockDb.reduce((acc, curr) => acc + (parseFloat(curr.net_worth) || 0), 0),
            avgScore: total > 0 ? mockDb.reduce((acc, curr) => acc + curr.score, 0) / total : 0
        };

        // 4. Specific address lookup
        const userEntry = address ? leaderboard.find(e => e.address.toLowerCase() === address.toLowerCase()) : null;

        return NextResponse.json({
            success: true,
            stats,
            leaderboard: leaderboard.slice(0, 50), // Return top 50
            userEntry
        });
    } catch (error) {
        console.error("[Leaderboard API] GET Error:", error);
        return NextResponse.json({ success: false, message: "No Global Data Available" }, { status: 503 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { address, score, tx_count, net_worth, active_days, label } = body;

        if (!address) return NextResponse.json({ success: false, message: "Missing address" }, { status: 400 });

        // Upsert logic (In SQL: INSERT INTO ... ON CONFLICT (address) DO UPDATE ...)
        const index = mockDb.findIndex(e => e.address.toLowerCase() === address.toLowerCase());
        const entry = { 
            address: address.toLowerCase(), 
            score, 
            tx_count, 
            net_worth, 
            active_days, 
            label,
            last_updated: new Date().toISOString()
        };

        if (index > -1) {
            mockDb[index] = { ...mockDb[index], ...entry };
        } else {
            mockDb.push(entry);
        }

        return NextResponse.json({ success: true, message: "Node Registered" });
    } catch (error) {
        console.error("[Leaderboard API] POST Error:", error);
        return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
    }
}
