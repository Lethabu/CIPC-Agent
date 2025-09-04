# CIPC AI Agent Platform

This project is a sophisticated, AI-powered CIPC agent built on a modern, scalable, and fault-tolerant architecture. It automates complex interactions with the South African Companies and Intellectual Property Commission (CIPC), including company onboarding, annual filings, and compliance monitoring.

---

## Architecture Overview

The system is composed of three main components, orchestrated by Docker Compose:

1.  **Node.js Server (`node-server`)**: This is the frontend of the application. It exposes an API (intended to be connected to a WhatsApp service) that receives user requests and initiates workflows. It is built with TypeScript and Express.

2.  **Go Worker (`go-worker`)**: This is the backend processing engine. It runs on Go and uses the Temporal SDK to execute long-running, reliable workflows and activities. This is where all the core business logic, AI interactions, and browser automation tasks reside.

3.  **Temporal Server (`temporal`)**: The orchestration engine that guarantees the execution of your workflows. It handles state, retries, and scheduling, making the application resilient to failure. The included `docker-compose.yml` runs the `temporalio/auto-setup` image for easy local development.

---

## Prerequisites

-   [Docker](https://www.docker.com/products/docker-desktop/)
-   [Docker Compose](https://docs.docker.com/compose/install/)

---

## How to Run the Application

This project is fully containerized, allowing for a simple, one-command setup.

### 1. Create an Environment File

Before you start, you must create a `.env` file in the root of the project. This file stores configuration and secrets. You can copy the provided example:

```bash
cp .env.example .env
```

_Note: You can modify the `INTERNAL_API_KEY` in the `.env` file to a more secure secret._

### 2. Build and Run with Docker Compose

From the root of the project, run the following command:

```bash
docker-compose up --build
```

This command will:
-   Build the Docker images for the `node-server` and `go-worker`.
-   Start all three services (`node-server`, `go-worker`, `temporal`).
-   Connect the services on a shared network.

### 3. Verify the System is Running

-   **Temporal Web UI**: Open your browser and navigate to [http://localhost:8233](http://localhost:8233). You should see the Temporal UI for the `cipc-agent-ns` namespace.
-   **Node.js Server**: The logs in your terminal should show the Node.js server listening on port 3000.
-   **Go Worker**: The logs will also show the Go worker has started and is polling the `CIPC_TASK_QUEUE` for tasks.

---

## Interacting with the System

Once the system is running, you can trigger workflows by making API calls to the Node.js server. For example, to start the `OnboardingWorkflow`:

```bash
curl -X POST http://localhost:3000/api/whatsapp/inbound \
-H "Content-Type: application/json" \
-d '{"from": "+27123456789", "message": "hi"}'
```

You can then observe the workflow's execution in the Temporal Web UI.
