
# BPD Cloud Changelog

## [v4.3.0-MISSION] - 2025-03-15
### Added
- **My Mission Command Center**: Personalized dashboard for individual staff members.
- **Blocker Detection**: Automated identification of tasks owned by the user that are currently stalling the global team.
- **Actionable Item Highlighting**: Real-time identification of tasks that have just been "unblocked" by peer completions.
- **Personalized Analytics**: Individual completion velocity and operational load tracking.

### Improved
- **Navigation**: Sidebar updated with the "My Mission" Target icon.
- **Dashboard Separation**: Clarified Global vs. Individual views for better signal-to-noise ratio.

## [v4.2.0-GRAPH] - 2025-03-14
### Added
- **Nexus Timeline**: Full Gantt-style visualizer for operational tasks.
- **SVG Dependency Lines**: Real-time cubic-bezier connectors between linked operations.
- **Critical Path Highlighting**: Visual indicators for tasks that are currently "Blocking" others.
- **Lock Metadata**: Visual lock icon for tasks waiting on prerequisites.

### Improved
- **Navigation**: Sidebar refresh with GitGraph icons for timeline access.
- **UI Performance**: Memoized dependency line calculations for smooth timeline scrolling.

## [v4.1.0-PULSE] - 2025-03-12
### Added
- **Nexus Pulse Engine**: Real-time event tracking for collaborator updates.
- **Dependency Alerts**: Automated notifications when a prerequisite task is completed.
