
# BPD Cloud Registry Architecture v4.3

## System Overview
The Broadband Policy & Development (BPD) Cloud Registry V4.3 introduces the **My Mission** command center, providing staff with personalized, high-leverage operational oversight.

## Tech Stack
- **Frontend Core**: React 19 (ES6 Modules) with Tailwind CSS.
- **Data Layer**: Supabase (PostgreSQL + Realtime Engine).
- **Nexus Engine**: V4.2 Graph with SVG-based cubic-bezier path mapping.
- **AI Intelligence**: Google Gemini 3 Flash-Preview.
- **Mission Engine**: V4.3 Personalized priority scoring for direct blockers and unblocked tasks.

## Architecture Pillars
1. **My Mission (New V4.3)**: Personalized view for individual staff. Scans the global graph to identify tasks that are 'Direct Blockers' (owned by you, blocking others) or 'Actionable' (all prerequisites met).
2. **Dependency Nexus**: Version 4 manages prerequisites. V4.2 adds visual "Critical Path" identification using recursive dependency tree scanning.
3. **Nexus Pulse Engine**: V4.1 diffs cloud snapshots to alert users of peer updates.
4. **SVG Dependency Mapper**: Uses cubic-bezier paths to link task completion dates to subsequent start dates in the timeline view.
5. **Resilience**: Credentials persisted in `localStorage` for headless deployments.

## Priority Logic (My Mission)
- **Direct Blocker**: `OwnedBy(User) AND Status != COMPLETE AND EXISTS(DependentTask WHERE Status != COMPLETE)`
- **Actionable Item**: `OwnedBy(User) AND Status != COMPLETE AND ALL(Prerequisites WHERE Status == COMPLETE)`
