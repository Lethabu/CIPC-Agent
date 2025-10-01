# spec: CIPC Runner Agent - Annual Returns (CoR 30.1)

## Status

Proposed

## Objective

To create a durable, reliable, and fully automated agent that can perform a complete Annual Return filing on the CIPC e-services portal without human intervention.

## Specification

### Requirement CRA-01: Invocation

The agent's execution MUST be triggered by a **Temporal Workflow** named `AnnualReturnWorkflow`.

### Requirement CRA-02: Authentication

The agent MUST securely fetch CIPC Filer credentials from Doppler at runtime. It MUST successfully solve the image-based CAPTCHA using `Pytesseract` or a similar OCR library.

### Requirement CRA-03: Data Input

The agent MUST accept a JSON object containing all necessary data for a CoR 30.1 filing (e.g., `turnover`, director details).

### Requirement CRA-04: Execution

The agent, using **Playwright**, MUST successfully navigate the CIPC portal, fill all form fields, and submit the filing.

### Requirement CRA-05: Output

Upon successful submission, the agent MUST scrape the CIPC confirmation reference number and return it to the Temporal Workflow.

### Requirement CRA-06: Error Handling

If any step fails, the agent MUST take a screenshot of the browser at the point of failure, log a detailed error message, and return a structured error to the Temporal Workflow.

## Verification Plan

### verify-CRA-01

A test that starts the `AnnualReturnWorkflow` MUST show a successful call to the `CIPC Runner` agent in the Temporal UI.

### verify-CRA-04

The agent MUST successfully complete 10 consecutive filings in a sandboxed CIPC environment with a 100% success rate.

### verify-CRA-06

Intentionally providing incorrect data MUST result in a structured error output and a saved screenshot.