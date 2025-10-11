# Spec: Minimum Viable Funnel (MVF)

## Principles

- **MVF-01: Conversational First.** The initial user onboarding, data collection, and payment flow will be handled by a conversational interface, not a traditional web form.
- **MVF-02: Decoupled Architecture.** The funnel components (frontend, backend, conversational UI) will be deployed as separate, independent services.

## Components

- **MVF-COMP-01: Conversational Frontend (Typebot)**
    - **Technology:** Self-hosted Typebot instance.
    - **Deployment:** Render, using the `baptistearno/typebot:latest` Docker image.
    - **Function:**
        - Guides the user through an onboarding conversation.
        - Collects user and company data.
        - Triggers webhooks to the backend.

- **MVF-COMP-02: Landing Page**
    - **Technology:** Simple, static `index.html`.
    - **Deployment:** Vercel.
    - **Function:**
        - Provides a public-facing landing page for the service.
        - Embeds the Typebot conversational flow.
        - The domain `www.cipcagent.co.za` will point to this deployment.

- **MVF-COMP-03: Backend Webhook Handler**
    - **Technology:** Go (Golang).
    - **Deployment:** Fly.io.
    - **Endpoint:** `POST /api/v1/flows/onboard`
    - **Function:**
        - Receives data from the Typebot webhook.
        - Processes the data.
        - Triggers the AISensy API to send a confirmation message via WhatsApp.

## Flow

1. User visits `www.cipcagent.co.za`.
2. The Vercel-hosted `index.html` page loads, which embeds the Typebot flow.
3. User interacts with the Typebot, providing their information.
4. At the end of the conversation, Typebot sends the collected data to the `POST /api/v1/flows/onboard` endpoint on the Fly.io-hosted Go backend.
5. The Go backend receives the data and calls the AISensy API.
6. AISensy sends a "Welcome" message to the user's WhatsApp number.