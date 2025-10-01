# spec: Minimum Viable Funnel (Typebot -> WhatsApp)

**Status:** Proposed

**Objective:** To create a live, secure, and functional lead-capture and onboarding funnel that can process a user from the public website to a confirmed lead in our system.

## Specification

### Requirement MVF-01: Live Landing Page
The domain `www.cipcagent.co.za` MUST serve a static page that embeds a live, self-hosted Typebot instance. The page MUST achieve a Lighthouse performance score of >90.

### Requirement MVF-02: Conversational Onboarding
The Typebot flow MUST successfully collect the user's Company Registration Number, their WhatsApp number, and explicit POPIA consent.

### Requirement MVF-03: Secure Webhook
Upon completion, the Typebot MUST send a `POST` request to the `/api/v1/flows/onboard` endpoint of our Go backend. The request MUST be authenticated using a shared secret in the `Authorization` header.

### Requirement MVF-04: Backend Processing
The Go backend MUST validate the webhook signature, parse the incoming data, create a new `user` record in the CockroachDB database, and log the successful onboarding event.

### Requirement MVF-05: WhatsApp Confirmation
Upon successful processing of the webhook, the backend MUST call the AISensy API to send an approved "Welcome" template message to the user's WhatsApp number.

## Verification Plan

- `verify-MVF-01`: `curl -sL www.cipcagent.co.za` MUST return a 200 OK status with HTML containing the Typebot script.

- `verify-MVF-03`: A test `POST` request to the webhook endpoint without the correct `Authorization` header MUST return a 401 Unauthorized error.

- `verify-MVF-05`: Completing the Typebot flow MUST result in a WhatsApp message being received within 15 seconds.