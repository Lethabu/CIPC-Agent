package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os/exec"
	"time"

	"go.temporal.io/sdk/activity"
	"go.temporal.io/sdk/workflow"
)

type AutomatedFilingInput struct {
	TransactionID string                 `json:"transaction_id"`
	ServiceType   string                 `json:"service_type"`
	ClientData    map[string]interface{} `json:"client_data"`
	UserID        string                 `json:"user_id"`
}

type FilingResult struct {
	Status          string `json:"status"`
	ReferenceNumber string `json:"reference_number"`
	Error           string `json:"error,omitempty"`
	Timestamp       string `json:"timestamp"`
}

// AutomatedFilingWorkflow orchestrates the automated CIPC filing
func AutomatedFilingWorkflow(ctx workflow.Context, input AutomatedFilingInput) (*FilingResult, error) {
	logger := workflow.GetLogger(ctx)
	logger.Info("Starting automated filing workflow", "transaction_id", input.TransactionID, "service_type", input.ServiceType)

	ctx = workflow.WithActivityOptions(ctx, workflow.ActivityOptions{
		StartToCloseTimeout: 10 * time.Minute,
		RetryPolicy: &workflow.RetryPolicy{
			InitialInterval:    30 * time.Second,
			BackoffCoefficient: 2.0,
			MaximumInterval:    5 * time.Minute,
			MaximumAttempts:    3,
		},
	})

	// Step 1: Validate payment
	var paymentValid bool
	err := workflow.ExecuteActivity(ctx, ValidatePaymentActivity, input.TransactionID).Get(ctx, &paymentValid)
	if err != nil || !paymentValid {
		return &FilingResult{
			Status: "failed",
			Error:  "Payment validation failed",
		}, nil
	}

	// Step 2: Execute automated filing
	var filingResult FilingResult
	err = workflow.ExecuteActivity(ctx, ExecuteAutomatedFilingActivity, input.ServiceType, input.ClientData).Get(ctx, &filingResult)
	if err != nil {
		return &FilingResult{
			Status: "failed",
			Error:  fmt.Sprintf("Filing execution failed: %v", err),
		}, nil
	}

	// Step 3: Update records and notify user
	if filingResult.Status == "success" {
		err = workflow.ExecuteActivity(ctx, UpdateFilingRecordsActivity, input.TransactionID, filingResult.ReferenceNumber).Get(ctx, nil)
		if err != nil {
			logger.Warn("Failed to update records", "error", err)
		}

		err = workflow.ExecuteActivity(ctx, SendFilingConfirmationActivity, input.UserID, filingResult).Get(ctx, nil)
		if err != nil {
			logger.Warn("Failed to send confirmation", "error", err)
		}
	} else {
		// Handle failure - alert operations team
		err = workflow.ExecuteActivity(ctx, AlertOperationsTeamActivity, input, filingResult).Get(ctx, nil)
		if err != nil {
			logger.Warn("Failed to alert operations team", "error", err)
		}
	}

	return &filingResult, nil
}

// ExecuteAutomatedFilingActivity calls the Python CIPC Runner
func ExecuteAutomatedFilingActivity(ctx context.Context, serviceType string, clientData map[string]interface{}) (FilingResult, error) {
	logger := activity.GetLogger(ctx)
	logger.Info("Executing automated filing", "service_type", serviceType)

	// Convert client data to JSON
	clientDataJSON, err := json.Marshal(clientData)
	if err != nil {
		return FilingResult{Status: "failed", Error: "Failed to marshal client data"}, err
	}

	// Execute Python CIPC Runner
	cmd := exec.Command("python3", "/app/automation/cipc_runner.py", serviceType, string(clientDataJSON))
	output, err := cmd.Output()
	if err != nil {
		return FilingResult{Status: "failed", Error: fmt.Sprintf("CIPC Runner execution failed: %v", err)}, err
	}

	// Parse result
	var result FilingResult
	err = json.Unmarshal(output, &result)
	if err != nil {
		return FilingResult{Status: "failed", Error: "Failed to parse CIPC Runner output"}, err
	}

	logger.Info("Filing completed", "status", result.Status, "reference", result.ReferenceNumber)
	return result, nil
}

// UpdateFilingRecordsActivity updates database with filing completion
func UpdateFilingRecordsActivity(ctx context.Context, transactionID, referenceNumber string) error {
	logger := activity.GetLogger(ctx)
	logger.Info("Updating filing records", "transaction_id", transactionID, "reference", referenceNumber)

	// Update database - mark transaction as completed
	// Update compliance deadlines - mark as satisfied
	// Log filing completion

	return nil
}

// SendFilingConfirmationActivity sends WhatsApp confirmation
func SendFilingConfirmationActivity(ctx context.Context, userID string, result FilingResult) error {
	logger := activity.GetLogger(ctx)
	logger.Info("Sending filing confirmation", "user_id", userID)

	message := fmt.Sprintf(`✅ *Filing Complete!*

Service: %s
Reference: %s
Status: Successfully submitted to CIPC

Your filing has been processed automatically. You'll receive official CIPC confirmation within 24-48 hours.

Need anything else? Just reply!`, 
		result.ReferenceNumber[:2], // Service type from reference
		result.ReferenceNumber)

	// Send via WhatsApp API
	logger.Info("Confirmation sent", "message_preview", message[:50])
	return nil
}

// AlertOperationsTeamActivity alerts team when automation fails
func AlertOperationsTeamActivity(ctx context.Context, input AutomatedFilingInput, result FilingResult) error {
	logger := activity.GetLogger(ctx)
	logger.Error("Automated filing failed - alerting operations team", 
		"transaction_id", input.TransactionID,
		"error", result.Error)

	// Send alert to operations team
	// Could be Slack, email, or internal dashboard notification
	
	return nil
}

// CanaryRolloutActivity determines if transaction should use automation
func CanaryRolloutActivity(ctx context.Context, transactionID string) (bool, error) {
	// Implement canary rollout logic
	// Start with 10% of transactions, gradually increase
	
	// For now, return true for all (100% automation)
	return true, nil
}