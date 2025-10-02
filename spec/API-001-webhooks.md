# SPEC: API-001 - Webhooks Integration
*   **Version:** 1.0
*   **Status:** Proposed
*   **Owner:** Backend Lead
*   **Linked Issues:** INT-002 (Webhook reliability issues - High), SEC-003 (Unverified payloads - Medium), SCAL-002 (No idempotency - High)
*   **Phase:** Phase 1 (Integration and Reliability)

### 1. Overview
This specification details the webhook infrastructure for CIPC Agent, enabling real-time event-driven communication with external services like AISensy (WhatsApp), Typebot (conversations), and Temporal (workflows). Webhooks will handle incoming payloads for user messages, workflow completions, and compliance events, ensuring secure, idempotent processing with HMAC verification and retry mechanisms. The system routes events to appropriate handlers (e.g., message to Typebot orchestrator, filing complete to user notification), persisting outcomes in CockroachDB for auditing and analytics.

**Purpose:** Provide reliable, secure event ingestion to power automated workflows, reducing polling overhead and enabling reactive features like instant compliance alerts.

**Interfaces:**
- **Inputs:** HTTP POST payloads from AISensy/Typebot/Temporal, signed with HMAC/SHA256.
- **Outputs:** 200 OK acknowledgments, async processing via Temporal, event logs to analytics DB.

**Non-Functional Requirements:**
- Latency: <100ms acknowledgment, <2s end-to-end processing.
- Reliability: 99.9% uptime, automatic retries (exponential backoff up to 5 attempts).
- Security: HMAC signature verification, rate limiting (500 req/min per source), payload size limit (1MB).
- Scalability: Horizontal webhook endpoints via Gin, load-balanced in K8s.

**Edge Cases:**
- Invalid signature: Reject with 401, log for audit.
- Duplicate events: Idempotency via event ID in DB.
- Large payloads: Truncate and queue for async processing.
- Service outage: Queue in Redis, retry on recovery.

### 2. Requirements
*   **REQ-API-001:** Expose /webhooks endpoint in Go/Gin, with middleware for signature verification (AISensy HMAC, Typebot JWT).
*   **REQ-API-002:** Implement event routing: Parse payload type, dispatch to handlers (e.g., whatsapp to server/services/whatsapp-innovation-bridge.ts).
*   **REQ-API-003:** Add idempotency: Store event IDs in CockroachDB events table, skip duplicates.
*   **REQ-API-004:** Integrate retry mechanism: Use Temporal for durable processing, with dead-letter queue for failures.
*   **REQ-API-005:** Support outgoing webhooks: Trigger notifications to partners (e.g., filing complete to accounting firm API).
*   **REQ-API-006:** Audit all events: Log to server/utils/logger.ts, include payload hash, timestamp, source IP.
*   **REQ-API-007:** Rate limiting and validation: Gin middleware to throttle and schema-validate payloads.
*   **REQ-API-008:** Monitoring: Expose metrics (events processed/sec, error rate) to Prometheus/Grafana.

### 3. Implementation Plan
*   **Task 1:** Design webhook schemas: Define JSON structures for AISensy/Typebot/Temporal payloads in shared/schema.ts.
*   **Task 2:** Build endpoint: Add server/src/webhooks/aisensy.ts and typebot.ts with verification middleware.
*   **Task 3:** Implement routing: Create dispatcher in server/api/router.ts to handle event types.
*   **Task 4:** Add idempotency and retries: Extend server/db/drizzle.ts for events table, integrate Temporal workflows.
*   **Task 5:** Setup outgoing webhooks: Add server/services/webhook-emitter.ts for partner notifications.
*   **Task 6:** Security and limits: Update server/middleware/security.ts for HMAC and rate limiting.
*   **Task 7:** Testing: Simulate 1,000 events/sec with Artillery, verify no duplicates/losses.
*   **Task 8:** Deploy: Update docker-compose.yml and go-deployment.yml, monitor in production.
*   **Effort Estimate:** 12 days; Dependencies: AISensy/Typebot API docs, Temporal setup, Redis for queuing.

### 4. Acceptance Criteria
*   `[ ]` Webhooks process 99.9% of events without loss; <100ms ACK time.
*   `[ ]` Signatures verified; invalid payloads rejected and logged.
*   `[ ]` Idempotency prevents duplicates; retries handle transient failures.
*   `[ ]` All events audited in DB; metrics visible in Grafana.
*   `[ ]` Outgoing webhooks trigger correctly for key events (e.g., filing complete).