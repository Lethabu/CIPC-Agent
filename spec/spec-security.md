# spec: Core Security & Secrets Management

**Status:** Proposed

**Objective:** To eliminate all existing security vulnerabilities and establish a secure-by-design foundation for secrets management and data handling, ensuring POPIA compliance from Day Zero.

## Specification

### Requirement SEC-01: Repository Cleanup
The `.env` file MUST be purged from the entire Git history using `git filter-repo`. No secrets shall exist in the repository's history.

### Requirement SEC-02: Secure Secret Management
All application secrets (API keys, database URLs, JWT secrets) MUST be managed in **Doppler**. The application code MUST read secrets from environment variables injected by Doppler at runtime.

### Requirement SEC-03: .gitignore
The `.gitignore` file MUST contain entries for `.env` and other sensitive files. A `.env.example` file with placeholder values MUST be committed.

### Requirement SEC-04: Automated Secret Scanning
A GitHub Actions workflow using a tool like `TruffleHog` MUST be implemented to scan every pull request for accidentally committed secrets.

## Verification Plan

- `verify-SEC-01`: Run `git log -- .env`. The command MUST return no results.

- `verify-SEC-02`: The application MUST fail to start locally if the `doppler run` command is not used.

- `verify-SEC-04`: Create a pull request with a fake secret (e.g., `DUMMY_API_KEY="sk_..."`). The GitHub Action MUST fail.