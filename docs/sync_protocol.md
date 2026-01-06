
# BPD Cloud Sync Protocol v4.6

## 1. Handshake Sequence
Every node (browser instance) performs an initialization handshake:
1. **Discovery**: Check `process.env` then `localStorage` for Supabase credentials.
2. **Ping**: Immediate limited query to verify the cloud node is alive.
3. **Reconciliation**: Bulk fetch of tasks, programs, and users to build the local shadow state.
4. **Subscription**: Attach to the `public` schema via WebSocket for real-time `INSERT/UPDATE/DELETE` events.

## 2. Database Provisioning (Critical)
For the sync engine to function without SQL errors (specifically `42P10`), the remote database must have **Unique Constraints** established on the lookup keys.

### Required SQL Fix for "ON CONFLICT" errors:
If the Supabase SQL editor returns `ERROR: 42P10: there is no unique or exclusion constraint matching the ON CONFLICT specification`, run the following:
```sql
-- Required for Programs Upsert
ALTER TABLE programs ADD CONSTRAINT programs_name_key UNIQUE (name);

-- Required for Users Upsert
ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE (email);
```

## 3. Real-time Resolution
When a remote change occurs:
- The `postgres_changes` callback is triggered via the `bpd-realtime-global` channel.
- A full `syncWithCloud()` is executed.
- The system diffs the `updated_at` and `updated_by` fields.
- If `updated_by` != `currentUser`, a **Nexus Pulse** notification is generated.

## 4. The Sentinel Cycle
The AI Sentinel adds a secondary processing layer:
1. **Trigger**: After every cloud sync, the service checks the `lastSentinelRun` timestamp.
2. **Analysis**: If > 300 seconds have passed, a registry snapshot is sent to Gemini.
3. **Broadcast**: Structured anomalies (JSON) are parsed and inserted into the notification feed with the `SENTINEL` type.

## 5. Conflict Management
- **Strategy**: Last-Write-Wins (LWW) based on database timestamps.
- **Integrity**: UI-level blockers prevent users from moving tasks to `COMPLETED` if dependency IDs are not in a completed state.
