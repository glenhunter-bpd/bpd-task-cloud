
# BPD Cloud Registry Architecture v4.2

## System Overview
The Broadband Policy & Development (BPD) Cloud Registry V4.2 introduces the **Nexus Timeline**, an SVG-powered dependency engine that visualizes operational hierarchies.

## Tech Stack
- **Frontend Core**: React 19 (ES6 Modules) with Tailwind CSS.
- **Data Layer**: Supabase (PostgreSQL + Realtime Engine).
- **Nexus Engine**: V4.2 Graph with SVG-based cubic-bezier path mapping.
- **AI Intelligence**: Google Gemini 3 Flash-Preview.

## Architecture Pillars
1. **Dependency Nexus**: Version 4 manages prerequisites. V4.2 adds visual "Critical Path" identification using recursive dependency tree scanning.
2. **Nexus Pulse Engine**: V4.1 diffs cloud snapshots to alert users of peer updates.
3. **SVG Dependency Mapper**: Uses cubic-bezier paths to link task completion dates to subsequent start dates in the timeline view.
4. **Resilience**: Credentials persisted in `localStorage` for headless deployments.

## Path Mapping Logic
Dependency lines are calculated using:
`Path(startX, startY) -> CubicBezierControlPoints -> End(endX, endY)`
This provides a non-linear "domino" visualization that represents operational flow.
