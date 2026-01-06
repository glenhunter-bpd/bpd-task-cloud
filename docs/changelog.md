
# BPD Cloud Changelog

## [v4.6.0-HEAT] - 2025-03-17
### Added
- **Thermal Risk Engine**: Dynamic health scoring for all grant programs based on priority and deadline proximity.
- **Grant Health Heatmap**: New visual pulse system for high-risk grant portfolios on the Dashboard.
- **Leadership HUD**: Strategic summary of program heat scores for resource reallocation.
- **Proximity Multipliers**: Time-sensitive risk weighting for upcoming deadlines (<48h).
- **Database Service v4.6.1**: Improved environment variable detection and local storage fallback logic.

### Fixed
- **SQL Constraint Documentation**: Added troubleshooting for `42P10` unique constraint errors in Supabase setup.
- **Syntax Stability**: Refined template literals in `Dashboard.tsx` and `GrantsView.tsx` to prevent unexpected string errors.

### Improved
- **Grants UI**: Redesigned program cards with risk-aware themes and thermal progress bars.
- **Real-time Performance**: Optimized state-diffing when processing remote cloud updates.

## [v4.5.0-SENTINEL] - 2025-03-16
### Added
- **Autonomous AI Sentinel**: Proactive background agent for anomaly detection.
- **Sentinel Advisory UI**: AI risk component in "My Mission" view.
- **Quick-Switcher**: Identity switching in global header.

## [v4.3.0-MISSION] - 2025-03-15
### Added
- **My Mission Command Center**: Personalized operational summary focusing on blockers.
