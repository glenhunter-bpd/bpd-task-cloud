
# BPD Cloud Architecture v2

## System Overview
The BPD Global Task Sync application is a high-availability, real-time distributed task management system designed for the Broadband Policy and Development team. It provides a unified interface for tracking policy tasks, managing grant funding sources, and coordinating global staff.

## Tech Stack
- **Frontend**: React 19 with Tailwind CSS for high-performance UI.
- **State Management**: Reactive subscription model via `DatabaseService`.
- **Sync Layer**: `BroadcastChannel` API for instantaneous cross-context communication.
- **Intelligence**: Gemini 3 Flash for automated project health analysis and strategic reporting.

## Core Pillars
1. **Real-time Synchronization**: Every action is broadcast globally within the user's browser environment, ensuring no tab is ever out of date.
2. **Operational Safety**: A sitewide confirmation layer protects critical data from accidental modification or deletion.
3. **Data Durability**: LWW (Last-Write-Wins) conflict resolution backed by local persistence buffers.
4. **AI-First Monitoring**: Gemini-driven reports provide managers with high-level summaries without manual data aggregation.

## Data Schema
- **Tasks**: Hierarchical objects containing timeline data, progress meters, and audit trails.
- **Programs**: Categorical taxonomy used to align tasks with funding sources.
- **Users**: Role-based identities (Admin, Manager, Staff) that govern interface availability.

## Security
- Role-based UI visibility.
- Cryptographic timestamps for all update events.
- Double-confirmation requirements for destructive cloud actions.
