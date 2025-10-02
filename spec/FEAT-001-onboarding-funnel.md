# SPEC: FEAT-001 - Onboarding Funnel
*   **Version:** 1.0
*   **Status:** Proposed
*   **Owner:** Product Lead
*   **Linked Issues:** USER-001 (Onboarding drop-off - High), WEB-001 (No mobile optimization - Medium), INT-001 (Typebot integration incomplete - High)
*   **Phase:** Phase 1 (User Acquisition and Retention)

### 1. Overview
This specification defines the streamlined onboarding funnel for CIPC Agent, designed to convert WhatsApp inquiries into active users within 3 interactions. The funnel integrates Typebot for conversational flows, WhatsApp Business API via AISensy for messaging, and CockroachDB for user data persistence. Key goals include reducing drop-off to <20%, achieving 70% completion rate, and collecting POPIA consent during signup. The process handles SMME owners discovering the service via ads, referrals, or Lead Scout, guiding them through profile setup, compliance scan initiation, and first filing automation.

**Purpose:** Create a frictionless entry point that maximizes user activation, ensures compliance from day one, and feeds into viral growth mechanics.

**Interfaces:**
- **Inputs:** WhatsApp messages, Typebot webhook payloads, user profile data (company name, ID number, contact).
- **Outputs:** Activated user account, initial compliance health score, welcome series via WhatsApp/email.

**Non-Functional Requirements:**
- Completion time: <5 minutes for 90% of users.
- Conversion rate: 70% from start to activation.
- Accessibility: Mobile-first, voice input support via WhatsApp.
- Personalization: Dynamic flows based on user type (solo vs. enterprise).

**Edge Cases:**
- Interrupted flow: Resume via session ID in WhatsApp.
- Invalid data: Real-time validation with helpful prompts.
- No consent: Block progression, explain POPIA requirements.
- Enterprise detection: Route to advanced signup with team invite.

### 2. Requirements
*   **REQ-FEAT-001:** Implement multi-step Typebot flow: Discovery → Consent → Profile → Compliance Scan → Activation.
*   **REQ-FEAT-002:** Integrate WhatsApp opt-in: Verify phone via OTP, store in CockroachDB users table.
*   **REQ-FEAT-003:** Collect essential data: Company details, owner ID, business type; validate against CIPC API.
*   **REQ-FEAT-004:** Embed POPIA consent: Explicit checkbox in flow, log to consent table with timestamp.
*   **REQ-FEAT-005:** Generate initial compliance score: Run quick scan on provided data, display results.
*   **REQ-FEAT-006:** Personalize welcome: Send tailored WhatsApp message with next steps (e.g., "Upload docs for auto-filing").
*   **REQ-FEAT-007:** Analytics tracking: Log funnel steps in analytics DB, calculate drop-off rates.
*   **REQ-FEAT-008:** A/B testing support: Configurable variants in Typebot for messaging/UX tweaks.

### 3. Implementation Plan
*   **Task 1:** Design Typebot flows: Create JSON schemas for 5-step funnel, integrate with AISensy webhooks.
*   **Task 2:** Update server API: Add /onboard endpoints in server/src/app.ts for data validation and DB insert.
*   **Task 3:** Implement consent module: Extend server/src/middleware/popia.ts to handle onboarding consent.
*   **Task 4:** Build profile validation: Use Go validators in cmd/api/main.go for CIPC data checks.
*   **Task 5:** Integrate compliance scan: Trigger initial scan via temporal/compliance_check_workflow.go.
*   **Task 6:** Setup analytics: Add events to server/services/realtime-analytics.ts for funnel tracking.
*   **Task 7:** Test flows: Simulate 100 onboardings, measure completion rates and errors.
*   **Task 8:** Deploy and monitor: Roll out via docker-compose.yml, watch metrics in Grafana.
*   **Effort Estimate:** 10 days; Dependencies: Typebot instance, AISensy API keys, CIPC API access.

### 4. Acceptance Criteria
*   `[ ]` Funnel completes in <5 min; 70%+ conversion rate in tests.
*   `[ ]` All user data persisted securely in CockroachDB with consent logged.
*   `[ ]` Initial compliance score generated and displayed via WhatsApp.
*   `[ ]` Drop-off analytics captured; A/B variants switchable without downtime.
*   `[ ]` Edge cases handled: Resumes flow, validates data, enforces consent.