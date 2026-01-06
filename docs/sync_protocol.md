# BPD Cloud Sync Protocol v3

## The Handshake Sequence
When a BPD Cloud node initializes, it executes the following protocol to establish the "Single Source of Truth":

1. **Credential Discovery**: 
   - Primary: Scan `process.env` (Build-time variables).
   - Secondary: Scan `localStorage` for `BPD_CLOUD_SUPABASE_URL` (Manual Link).
2. **Ping Test**: 
   - Execute an immediate `SELECT 1` query to verify the cloud node is responsive.
3. **Full Reconciliation**: 
   - Perform an initial bulk fetch of `tasks`, `programs`, and `users`.
4. **WebSocket Attachment**: 
   - Open a Realtime Channel for the `public` schema.

## Realtime Implementation
The system utilizes Supabase Realtime Channels to eliminate manual polling:

```typescript
this.client
  .channel('bpd-realtime-global')
  .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
    // Immediate re-sync on any remote insert, update, or delete
    this.syncWithCloud();
  })
```

## Conflict Resolution
- **Strategy**: Last-Write-Wins (LWW).
- **Metadata**: Every record contains an `updated_at` timestamp and an `updated_by` identity. 
- **Atomic Operations**: Mutations are sent as individual POST requests to ensure database-level consistency.

## Resilience & Fallback
If the WebSocket connection is interrupted:
- The `DatabaseService` switches the global state to `isConnected = false`.
- The UI displays the "OFFLINE MODE" warning.
- Mutations are saved to the local `AppState` and will attempt to re-sync upon the next successful handshake.