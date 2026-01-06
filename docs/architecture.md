
# BPD Cloud Registry Architecture v4.0

## System Overview
The Broadband Policy & Development (BPD) Cloud Registry V4 introduces the **Dependency Nexus**, a sophisticated task-graph engine that manages prerequisites and blocking operations across the global cloud.

## Tech Stack
- **Frontend Core**: React 19 (ES6 Modules) with Tailwind CSS.
- **Data Layer**: Supabase (PostgreSQL + Realtime Engine).
- **Dependency Engine**: Custom V4 Nexus logic for hierarchical task resolution.
- **AI Intelligence**: Google Gemini 3 Flash-Preview.

## Architecture Pillars
1. **Dependency Nexus**: Version 4 introduces the ability to link tasks. A task cannot be marked `COMPLETED` if it has outstanding `dependentTasks` that are still open.
2. **Cloud-First Persistence**: Centralized Supabase truth with support for complex Postgres array types (`dependent_tasks`).
3. **Realtime Broadcast**: Instant cross-staff updates for both status and dependency shifts.
4. **Environment Resilience**: Manual Provisioning Fallback for static hosting environments.

## Security & Compliance
- **V3 Nexus Protocol**: Every mutation is cryptographically linked to a specific staff member and tracked in the global dependency log.
