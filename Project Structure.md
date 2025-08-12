# Project Structure: CIPC Agent Platform

This document outlines the directory structure and component interactions for the CIPC Agent Platform project.

## Directory Structure

```
CIPC-Agent/
├── client/                 # Frontend application source code
│   ├── public/             # Static assets
│   ├── src/                # React application source
│   │   ├── assets/         # Images, icons, etc.
│   │   ├── components/     # Reusable UI components
│   │   │   ├── beneficial-ownership/ # Components specific to beneficial ownership
│   │   │   ├── navigation/ # Navigation components (e.g., navbar)
│   │   │   ├── sections/   # Page sections (e.g., hero, pricing)
│   │   │   └── ui/         # Shadcn UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions and configurations
│   │   ├── pages/          # Application pages (e.g., Home, Dashboard)
│   │   ├── App.tsx         # Main application component
│   │   ├── index.css       # Global styles
│   │   └── main.tsx        # Entry point for the React app
│   ├── index.html          # Main HTML file
│   ├── package.json        # Client dependencies and scripts
│   ├── postcss.config.js   # PostCSS configuration
│   ├── tailwind.config.ts  # Tailwind CSS configuration
│   └── vite.config.ts      # Vite build configuration
├── server/                 # Backend application source code
│   ├── src/                # Node.js/TypeScript server source
│   │   ├── db.ts           # Database connection and configuration
│   │   ├── index.ts        # Main server entry point
│   │   ├── routes.ts       # API route definitions
│   │   ├── storage.ts      # File storage utilities
│   │   ├── vite.ts         # Vite integration for server-side rendering (if applicable)
│   │   └── services/       # Business logic and external service integrations
│   │       ├── aiOrchestrator.ts     # Orchestrates AI agent interactions
│   │       ├── documentProcessor.ts  # Handles document parsing and processing
│   │       ├── whatsappService.ts    # Manages WhatsApp communication
│   │       └── agents/               # Specialized AI agents
│   │           ├── cipcCommander.ts  # Master orchestrator for CIPC tasks
│   │           ├── formAutopilot.ts   # Automates CIPC form generation
│   │           ├── kycOnboarder.ts     # Handles KYC and onboarding processes
│   │           ├── leadScout.ts        # Identifies potential leads
│   │           ├── paymentRunner.ts    # Manages payment processing
│   │           └── regulationSentinel.ts # Monitors regulatory changes
│   ├── package.json        # Server dependencies and scripts
│   ├── tsconfig.json       # TypeScript configuration for server
│   └── .env.example        # Example environment variables for server
├── shared/                 # Shared types, interfaces, and schemas
│   ├── schema.ts           # Database schema definitions (e.g., Drizzle schema)
│   └── types.ts            # Common TypeScript types and interfaces
├── .vscode/                # VS Code specific settings
├── attached_assets/        # Assets attached to the project (e.g., diagrams, screenshots)
├── components.json         # Shadcn UI components configuration
├── drizzle.config.ts       # Drizzle ORM configuration
├── package.json            # Root package.json (for workspace management, if used)
├── tsconfig.json           # Root TypeScript configuration
└── README.md               # Project overview and quick start guide
```

## Component Interactions

1.  **User Interaction (Client):** Users interact with the React frontend to access features like the dashboard, beneficial ownership forms, and other compliance tools.

2.  **Client-Server Communication:** The frontend makes API requests to the Node.js/TypeScript backend for data retrieval, form submissions, and triggering agent-based operations.

3.  **Server (API & Services):**
    *   `index.ts` acts as the main entry point, setting up the server and defining routes.
    *   `routes.ts` defines the API endpoints that the client interacts with.
    *   `db.ts` manages database connections and queries using Drizzle ORM.
    *   `storage.ts` handles file storage operations.
    *   `services/` directory contains the core business logic and integrations:
        *   `aiOrchestrator.ts`: Coordinates interactions between different AI agents and external AI models.
        *   `documentProcessor.ts`: Processes uploaded documents (e.g., OCR, data extraction).
        *   `whatsappService.ts`: Manages communication via WhatsApp, potentially handling incoming messages and sending automated responses.
        *   `agents/`: This sub-directory houses specialized AI agents, each responsible for a distinct CIPC-related task. These agents receive instructions from the `cipcCommander` and interact with various internal services and external APIs (e.g., CIPC e-Services, payment gateways).

4.  **Shared Components:** The `shared/` directory ensures consistency between the client and server by providing common data structures and schema definitions.

5.  **Configuration:** `drizzle.config.ts` manages database migrations, and `.env.example` (or similar) guides environment variable setup for both client and server.

6.  **Development & Deployment:** The project uses Vite for fast development and build processes. Docker and Docker Compose can be used for containerization and simplified deployment in production environments.