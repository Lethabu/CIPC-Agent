# Spec: Security (SEC)

## Principles

- **SEC-01: No Secrets in Repository.** Under no circumstances shall any secrets (API keys, passwords, connection strings, private keys) be committed to the Git repository.
- **SEC-02: Centralized Secret Management.** All secrets must be managed through a centralized secret management service (Doppler). Applications will fetch secrets from this service at runtime.
- **SEC-03: Environment Template.** A `.env.example` file must be present at the root of the repository, listing all required environment variables with placeholder or non-sensitive default values.
- **SEC-04: Gitignore.** The `.gitignore` file must contain entries to ignore all environment files, specifically `.env*`.

## Remediation Procedures

- **SEC-RP-01: Secret Leak Protocol.** If a secret is ever committed, the following steps must be taken immediately:
    1. The leaked secret must be immediately rotated and invalidated.
    2. The `git filter-repo` tool must be used to purge the secret from the entire Git history.
    3. A force push to the remote repository is required to overwrite the compromised history.
    4. A full audit must be conducted to ensure no other secrets were exposed.