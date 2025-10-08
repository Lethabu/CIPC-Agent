
# Security Specification (SEC-01)

**Version:** 1.0
**Status:** Proposed
**Author:** AI Assistant
**Date:** 2025-10-06

## 1. Overview

This specification outlines the security requirements for the CIPC-Agent platform. The primary goal is to remediate the critical security flaw of having a publicly committed `.env` file with exposed production keys. This document formalizes the requirements for a secure repository and a robust secrets management strategy.

## 2. Security Requirements

| ID | Requirement | Description |
| :--- | :--- | :--- |
| **SEC-01** | No secrets in the repository | The repository MUST NOT contain any secrets, API keys, or other sensitive information in plain text. |
| **SEC-02** | Secrets management | All secrets MUST be managed through a secure secrets management service (Doppler). |
| **SEC-03** | `.env` file handling | The `.env` file MUST be purged from the Git history. It MUST be listed in the `.gitignore` file. |
| **SEC-04** | `.env.example` | An `.env.example` file MUST exist in the repository root, providing a template for required environment variables. |

## 3. Remediation Plan

1.  **Rotate Keys:** All exposed keys in the original `.env` file MUST be considered compromised and rotated immediately.
2.  **Setup Doppler:** A new Doppler project MUST be created to manage all environment variables for development, staging, and production.
3.  **Purge Git History:** The `.env` file MUST be completely removed from the Git history using `git filter-repo` or a similar tool.
4.  **Update `.gitignore`:** The `.gitignore` file MUST be updated to include `.env`.
5.  **Create `.env.example`:** A new `.env.example` file MUST be created based on the variables in the original `.env` file, with all sensitive values removed.

## 4. Verification Plan

| ID | Description | Verification Steps |
| :--- | :--- | :--- |
| **SEC-01-VERIFY** | No `.env` file in history | Run `git log --all -- .env` and verify that no commits related to the `.env` file exist. |
| **SEC-02-VERIFY** | `.gitignore` is correct | Check the content of the `.gitignore` file to ensure it contains a line for `.env`. |
| **SEC-03-VERIFY** | `.env.example` exists | Verify that the `.env.example` file exists in the root of the repository. |
