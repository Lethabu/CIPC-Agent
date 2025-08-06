# Overview

CIPC AI Commander is an AI-powered vertical SaaS platform designed to automate CIPC (Companies and Intellectual Property Commission) compliance workflows for South African Small, Medium, and Micro Enterprises (SMMEs). The system employs a specialized army of AI agents to handle end-to-end compliance tasks, from lead generation to document filing, with WhatsApp as the primary user interface. The platform aims to simplify complex regulatory requirements through intelligent automation while maintaining POPIA compliance and data security.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client application is built using React with TypeScript and follows a modern component-based architecture:
- **UI Framework**: React with Vite as the build tool for fast development and optimized production builds
- **Component Library**: Shadcn/ui components built on Radix UI primitives for accessible, customizable UI elements
- **Styling**: Tailwind CSS with custom CSS variables for theming, featuring South African-inspired colors (trust-blue, compliance-green, sa-orange, sa-gold)
- **State Management**: TanStack React Query for server state management and API data fetching
- **Routing**: Wouter for lightweight client-side routing

## Backend Architecture
The server follows a Node.js Express architecture with TypeScript:
- **Framework**: Express.js with TypeScript for type-safe server development
- **AI Orchestration**: Central AI orchestrator managing multiple specialized agents (CIPC Commander, Lead Scout, KYC Onboarder, Form Autopilot, Regulation Sentinel, Payment Runner)
- **Agent Pattern**: Each AI agent is responsible for specific domain tasks (lead generation, document processing, form automation, compliance monitoring, payments)
- **File Processing**: Multer-based document upload system with OCR capabilities and POPIA-compliant data redaction
- **API Design**: RESTful endpoints for agent communication, document processing, and status monitoring

## Data Storage Architecture
The system uses PostgreSQL with Drizzle ORM for type-safe database operations:
- **Database**: PostgreSQL (configured for Neon serverless) with connection pooling
- **ORM**: Drizzle ORM for schema definition and type-safe queries
- **Schema**: Comprehensive database schema covering users, companies, documents, and agent activities
- **Migrations**: Drizzle Kit for database migrations and schema management

## AI Integration Architecture
Multi-model AI approach leveraging both OpenAI and Google AI:
- **Primary Models**: OpenAI GPT-4o for complex reasoning and Google Gemini 2.5 Flash for specialized tasks
- **Agent Specialization**: Each agent fine-tuned for specific CIPC compliance domains
- **Response Formatting**: Structured JSON responses for consistent agent communication
- **Error Handling**: Graceful fallbacks and error recovery mechanisms

## Authentication and Security
POPIA-compliant security architecture:
- **Data Protection**: Automatic PII redaction modules for sensitive information
- **Encryption**: AWS KMS integration for bank-grade encryption
- **Compliance**: Built-in POPIA compliance measures throughout the data pipeline
- **Session Management**: Secure session handling with PostgreSQL session store

# External Dependencies

## AI and ML Services
- **OpenAI API**: GPT-4o model for advanced natural language processing and reasoning tasks
- **Google Generative AI**: Gemini models for specialized document processing and content generation
- **Custom AI Orchestration**: Proprietary agent coordination system for task routing and execution

## Database and Storage
- **Neon Database**: Serverless PostgreSQL for scalable data storage
- **Drizzle ORM**: Type-safe database toolkit for schema management and queries
- **AWS KMS**: Key management service for encryption and security compliance

## Communication Platforms
- **WhatsApp Business API**: Primary user interface for SMME interactions
- **Meta Graph API**: Integration for WhatsApp messaging and media handling
- **SMS Services**: Backup communication channel for critical alerts

## Payment Processing
- **PayFast**: South African payment gateway for CIPC fee processing
- **Secure Transaction Handling**: Integrated payment workflows with compliance tracking

## Development and Infrastructure
- **Vite**: Frontend build tool and development server
- **Replit Integration**: Cloud development environment with runtime error handling
- **TypeScript**: Type safety across the entire application stack
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development

## South African Compliance
- **CIPC e-Services**: Direct integration with official CIPC portals for document submission
- **POPIA Compliance Framework**: Data protection and privacy regulation adherence
- **B-BBEE Systems**: Integration with Broad-Based Black Economic Empowerment requirements