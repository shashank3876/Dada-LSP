cd /Users/shashankg/.gemini/antigravity/scratch/dada-advisory

# Terminal 1: Backend API (port 3001)
pnpm --filter "api" start:dev

# Terminal 2: Web Portals (port 3000)
pnpm --filter "web" dev

# Terminal 3: Async Worker
pnpm --filter "worker" start:dev