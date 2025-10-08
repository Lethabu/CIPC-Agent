
# Funnel Specification (FUN-01)

**Version:** 1.0
**Status:** Proposed
**Author:** AI Assistant
**Date:** 2025-10-06

## 1. Overview

This specification outlines the architecture and implementation of the Minimum Viable Funnel (MVF) for the CIPC-Agent platform. The primary goal is to replace the current static frontend with a dynamic, conversational user funnel built on Typebot. This will enable rapid iteration and a seamless user experience, guiding users from the landing page to initiating a CIPC compliance check via WhatsApp.

## 2. Components

| Component | Technology | Hosting | Purpose |
| :--- | :--- | :--- | :--- |
| **Landing Page** | HTML/CSS | Vercel | Simple, fast-loading page to attract users and embed the Typebot. |
| **Conversational UI** | Typebot | Self-hosted (Render) | Interactive, conversational flow for user onboarding and data collection. |
| **Communication** | AISensy | - | Manages all WhatsApp communication with the user. |
| **Backend** | Go/Gin | Fly.io | Receives data from Typebot via webhooks for processing. |

## 3. User Flow

1.  A user visits `www.cipcagent.co.za`.
2.  The `index.html` landing page is served from Vercel.
3.  The page displays a clear call-to-action (CTA) that launches the embedded Typebot.
4.  The user interacts with the Typebot, providing necessary information for the compliance check.
5.  At the end of the Typebot flow, the user is prompted to continue the conversation on WhatsApp.
6.  Typebot redirects the user to the Ai Sensy WhatsApp URL: `https://wa.aisensy.com/+27699171527?text=hi`.
7.  The user sends the pre-filled "hi" message, and the backend takes over the conversation via Ai Sensy.

## 4. Implementation Details

### 4.1. `index.html` Landing Page

The landing page will be a single HTML file with minimal styling. It will contain:
- A compelling headline and subheading.
- An embedded Typebot window.

### 4.2. Typebot Flow

The Typebot flow will be designed to be simple and engaging. It will:
- Greet the user.
- Ask for the company registration number.
- Validate the input.
- Ask for consent to be contacted on WhatsApp.
- Redirect to the Ai Sensy WhatsApp URL.

## 5. Verification Plan

| ID | Description | Verification Steps |
| :--- | :--- | :--- |
| **MVF-01** | The user can complete the funnel. | 1. Navigate to `www.cipcagent.co.za`. 2. Interact with the Typebot. 3. Be redirected to the correct WhatsApp chat. |
