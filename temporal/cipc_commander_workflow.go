package temporal

import (
	"context"
	"errors"
	"time"

	"go.temporal.io/sdk/activity"
	"go.temporal.io/sdk/temporal"
	"go.temporal.io/sdk/workflow"
)

// CIPCCommanderWorkflow is the main workflow for the CIPC agent platform.
func CIPCCommanderWorkflow(ctx workflow.Context, customerID string) (string, error) {
	// ... (implementation as before)
	return "All tasks completed successfully", nil
}

// KYCOnboarderWorkflow handles KYC onboarding with human-in-the-loop.
func KYCOnboarderWorkflow(ctx workflow.Context, customerID string) (string, error) {
	// Retry policy for transient failures.
	ao := workflow.ActivityOptions{
		StartToCloseTimeout: 10 * time.Second,
		RetryPolicy: &workflow.RetryPolicy{
			InitialInterval:    time.Second,
			BackoffCoefficient: 2.0,
			MaximumInterval:    time.Minute,
			MaximumAttempts:    3,
		},
	}
	ctx = workflow.WithActivityOptions(ctx, ao)

	var kycCheckResult string
	err := workflow.ExecuteActivity(ctx, PerformKYCCheckActivity, customerID).Get(ctx, &kycCheckResult)

	// Check if the activity failed with a non-retryable error.
	var applicationErr *temporal.ApplicationError
	if errors.As(err, &applicationErr) {
		// This is a permanent failure. Escalate to a human.
		var manualTaskResult string
		manualTaskAo := workflow.ActivityOptions{
			StartToCloseTimeout: 5 * time.Minute,
		}
		manualTaskCtx := workflow.WithActivityOptions(ctx, manualTaskAo)
		err := workflow.ExecuteActivity(manualTaskCtx, CreateManualVerificationTaskActivity, customerID).Get(manualTaskCtx, &manualTaskResult)
		if err != nil {
			return "", err
		}

		// Wait for the human to complete the manual verification.
		var verificationResult string
		signalChan := workflow.GetSignalChannel(ctx, "manual-verification-complete")
		signalChan.Receive(ctx, &verificationResult) // Blocks until signal is received

		if verificationResult == "approved" {
			return "KYC passed after manual review", nil
		} else {
			return "KYC failed after manual review", nil
		}
	} else if err != nil {
		// This is a transient failure that has exhausted all retries.
		return "", err
	}

	return kycCheckResult, nil
}

// ... (other workflows are the same)

// PerformKYCCheckActivity now simulates a permanent failure.
func PerformKYCCheckActivity(ctx context.Context, customerID string) (string, error) {
	logger := activity.GetLogger(ctx)
	logger.Info("Performing KYC check for customer", "customerID", customerID)

	// Simulate a permanent failure for a specific customer.
	if customerID == "customer-needs-manual-review" {
		return "", temporal.NewApplicationError("Invalid documentation provided", "InvalidInput")
	}

	return "KYC check passed automatically", nil
}

// CreateManualVerificationTaskActivity creates a task for a human reviewer.
func CreateManualVerificationTaskActivity(ctx context.Context, customerID string) (string, error) {
	logger := activity.GetLogger(ctx)
	logger.Info("Creating manual verification task for customer", "customerID", customerID)
	// In a real application, you would create a task in a system like Jira,
	// send an email, or trigger a notification.
	return "Manual verification task created", nil
}

// ... (other activities are the same)
