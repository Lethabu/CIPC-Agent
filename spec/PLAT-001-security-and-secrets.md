# SPEC: PLAT-001 - Security & Secret Management
*   **Version:** 1.0
*   **Status:** Proposed
*   **Owner:** CTO
*   **Linked Issues:** SEC-001 (Hardcoded secrets - Critical), SEC-002 (Input validation gaps - High), WEB-002 (No POPIA compliance - Critical), SCAL-001 (Scalability gaps including rate limiting - High)
*   **Phase:** Phase 1 (Security and POPIA Compliance)

### 1. Overview
This specification outlines the implementation of comprehensive security measures for the CIPC Agent platform, focusing on secrets management, authentication, data protection, and scalability safeguards. The platform handles sensitive compliance data for South African SMMEs via WhatsApp, requiring adherence to POPIA/GDPR standards. Key objectives include migrating from hardcoded secrets to Doppler for secure configuration, implementing mTLS/JWT for secure communications, enabling audit logging, and applying OWASP top 10 mitigations. This addresses critical audit findings by ensuring no exposed secrets, robust input validation, POPIA consent mechanisms, and rate limiting to prevent abuse.

**Purpose:** Establish a secure foundation for the platform to protect user data, prevent unauthorized access, and ensure scalability without compromising integrity.

**Interfaces:**
- **Inputs:** API requests with JWT tokens, webhook payloads from AISensy/Temporal, user inputs via Typebot flows.
- **Outputs:** Secure responses (<500ms latency), audit logs to CockroachDB, encrypted data storage.

**Non-Functional Requirements:**
- Response time: <500ms for 95% of requests.
- Security: OWASP Top 10 compliance, mTLS for internal services, JWT for API auth, HMAC for webhooks.
- Scalability: Rate limiting (100 req/min per IP/user), horizontal scaling via K8s.
- Compliance: POPIA/GDPR data minimization, consent tracking, right to erasure.

**Edge Cases:**
- Invalid JWT/mTLS: Reject with 401/403.
- Rate limit exceeded: Return 429 with retry-after header.
- Missing POPIA consent: Block data processing, prompt re-consent.
- Secrets fetch failure: Fallback to error state, alert via Doppler.

### 2. Requirements
*   **REQ-PLAT-001:** Migrate all hardcoded secrets (API keys, DB creds) to Doppler, with automatic injection via env vars in Docker/K8s.
*   **REQ-PLAT-002:** Implement mTLS for inter-service communication (e.g., Go/Gin to Temporal.io) and JWT auth for external APIs.
*   **REQ-PLAT-003:** Add input validation/sanitization using Go validators and Python schemas to prevent injection attacks (SEC-002).
*   **REQ-PLAT-004:** Integrate POPIA consent module: Track user consent in CockroachDB, enforce data access only with valid consent (WEB-002).
*   **REQ-PLAT-005:** Enable comprehensive audit logging: Log all access/modifications with user ID, timestamp, IP to CockroachDB.
*   **REQ-PLAT-006:** Apply OWASP mitigations: CSRF tokens, secure headers (HSTS, CSP), SQL injection prevention via Drizzle ORM.
*   **REQ-PLAT-007:** Implement rate limiting using Gin middleware, configurable per endpoint/user (SCAL-001).
*   **REQ-PLAT-008:** Encrypt sensitive data at rest (CockroachDB encryption) and in transit (TLS 1.3).

### 3. Implementation Plan
*   **Task 1:** Audit and extract all hardcoded secrets from codebase (Go, Python, Dockerfiles).
*   **Task 2:** Set up Doppler project: Create configs for secrets, integrate with K8s secrets.yml.
*   **Task 3:** Refactor auth: Add mTLS certs in deployment/go-deployment.yml, JWT middleware in Go/Gin.
*   **Task 4:** Implement validation: Update server/src/app.ts and automation/cipc_runner.py with schema checks.
*   **Task 5:** Build POPIA module: Add server/src/middleware/popia.ts for consent checks.
*   **Task 6:** Setup logging: Extend server/utils/logger.ts to CockroachDB via Drizzle.
*   **Task 7:** Add OWASP guards: Configure headers in Gin, CSP in client/src/index.css.
*   **Task 8:** Deploy rate limiter: Gin middleware in server/src/app.ts, test with load (1000 req/s).
*   **Task 9:** Encryption setup: Enable CockroachDB encryption, TLS in docker-compose.yml.
*   **Effort Estimate:** 14 days; Dependencies: Doppler account, CockroachDB schema, K8s access.

### 4. Acceptance Criteria
*   `[ ]` All secrets migrated to Doppler; grep search yields no hardcoded values.
*   `[ ]` mTLS/JWT auth passes: Internal calls succeed, invalid tokens rejected (401/403).
*   `[ ]` Input validation blocks malicious payloads (e.g., SQL injection attempts logged).
*   `[ ]` POPIA consent enforced: Data access denied without consent, consent revocable via API.
*   `[ ]` Audit logs capture 100% of sensitive operations,