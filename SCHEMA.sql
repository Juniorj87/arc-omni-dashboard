-- ARC OMNI LEADERBOARD SCHEMA (PostgreSQL)

-- Table to store active wallets and their engagement metrics
CREATE TABLE IF NOT EXISTS leaderboard (
    address VARCHAR(42) PRIMARY KEY, -- Wallet address (0x...)
    label VARCHAR(255),              -- Custom label or ENS
    score INTEGER DEFAULT 0,         -- Engagement score
    tx_count INTEGER DEFAULT 0,      -- Total transactions
    net_worth NUMERIC DEFAULT 0,      -- Portfolio value in USD
    active_days INTEGER DEFAULT 0,   -- Number of days active
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast ranking queries
CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON leaderboard (score DESC);

-- Helper query to get global rank and percentile
-- SELECT 
--     address, 
--     score,
--     rank() OVER (ORDER BY score DESC) as global_rank,
--     percent_rank() OVER (ORDER BY score DESC) as percentile
-- FROM leaderboard;
