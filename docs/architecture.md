
# BPD Cloud Registry Architecture v4.6.0-HEAT

## System Overview
The Broadband Policy & Development (BPD) Cloud Registry is a mission-critical, local-first operational database. Version 4.6.0-HEAT introduces the **Thermal Risk Engine**, which monitors grant-level health through multi-variable threshold analysis.

## Core Tech Stack
- **Frontend Core**: React 19 (ES6 Modules)
- **Styling**: Tailwind CSS + Lucide Icons
- **Data Layer**: Supabase (PostgreSQL + Realtime WebSocket)
- **Intelligence**: Google Gemini 3 Flash-Preview (Model: `gemini-3-flash-preview`)
- **Version Control**: Semantic versioning (Current: v4.6.0-HEAT)

## Key Architectural Pillars

### 1. Thermal Risk Engine (V4.6 HEAT Build)
The Heatmap monitors pressure points by calculating a weighted risk score for every grant program in the registry.
- **Algorithm**: `Score = Sum(TaskWeight * TimeMultiplier)`.
- **Weights**: Critical (20), High (10), Medium (5), Low (2).
- **Time Multiplier**: Overdue (3x), <48h (2.5x), <7d (1.5x), Else (1x).
- **Visualization**: Inferno (Red Pulse), High (Amber Glow), Stable (Emerald).

### 2. Database Integrity & Upsert Logic
To support real-time synchronization and "Insert or Update" (Upsert) operations, the database requires specific unique constraints:
- **Programs Table**: Unique constraint on `name` field.
- **Users Table**: Unique constraint on `email` field.
- **Enforcement**: This prevents duplicate registry entries during bulk cloud reconciliations.

### 3. AI Sentinel (Background Observer)
Autonomous logic loop identifying operational anomalies every 300 seconds.
- **Output**: Broadcasts risk anomalies to the global pulse feed using Gemini JSON schema extraction.

### 4. Dependency Nexus (Graph Engine)
Recursive dependency tree scanning enforces strict completion order and visualizes the "Critical Path" in the Timeline view.

### 5. Mission Personalization
Staff profiles drive the "My Mission" view, filtering tasks into "Direct Blockers" (items you own blocking others) and "Newly Actionable" (items where dependencies are met).
