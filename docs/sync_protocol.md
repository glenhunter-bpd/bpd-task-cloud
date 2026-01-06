
# Sync Protocol v2

## Goal
To ensure that all users, regardless of their global location, see the same task, user, and grant state without manual refreshes.

## Implementation Details
The system utilizes a "Single Source of Truth" pattern backed by a message-passing interface via the `BroadcastChannel` API.

### 1. The Message Payload
The protocol broadcasts lightweight update notifications rather than full state objects to minimize memory overhead.
```json
{
  "type": "UPDATE",
  "origin": "node_7721",
  "timestamp": "2025-05-22T10:00:00Z"
}
```

### 2. Supported Entities
As of v2.1.0, the protocol synchronizes:
- **Tasks**: Status, progress, assignments, and metadata.
- **Programs/Grants**: Funding source definitions and colors.
- **Users**: Staff profiles, roles, and departmental data.

### 3. Conflict Resolution
Currently, the protocol uses a **Last-Write-Wins (LWW)** strategy based on the `updatedAt` ISO timestamp. Every mutation triggers a full state synchronization across all active context nodes.

### 4. Resilience
The system automatically recovers state from the local node cache if the network sync is interrupted. Because data is stored in `localStorage`, session persistence is maintained even after browser restarts.
