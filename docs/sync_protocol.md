
# BPD Cloud Sync Protocol v5.0 (ENTERPRISE)

## Protocol Overview
The v5.0 protocol defines the enterprise-grade interaction model for the BPD Remote Registry.

## 1. Credentials Persistence
V5 utilizes `localStorage` with a `BPD_CLOUD_` prefix. Note: V5 introduces multi-org credential support in the roadmap.

## 2. Real-time Subscription
- **Channel**: `bpd-realtime-global`
- **Logic**: V5 currently uses the full-reconciliation model from V4.6, with the **Delta-Sync** engine currently in research.

## 3. SQL Environment Setup (Required)
**CRITICAL**: The protocol relies on `ON CONFLICT` logic. Without the following constraints, the sync will fail:
```sql
ALTER TABLE programs ADD CONSTRAINT programs_name_key UNIQUE (name);
ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE (email);
```

## 4. Lifecycle Status
This protocol is the active standard for the Version 5 Enterprise lifecycle.
