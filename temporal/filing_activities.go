package temporal

import (
	"context"
	"fmt"
	"time"

	"go.temporal.io/sdk/activity"
)

// ValidateDataActivity performs data validation and extraction.
func ValidateDataActivity(ctx context.Context, params FilingWorkflowParams) (string, error) {
	logger := activity.GetLogger(ctx)
	logger.Info("Validating data for filing", "companyRegNum", params.CompanyRegNum)

	// In a real implementation, this would:
	// 1. Call a service like Unstructured.io or OpenAI to extract data from documents.
	// 2. Redact Personally Identifiable Information (PII) to comply with POPIA.
	// 3. Insert the validated and redacted data into CockroachDB via Prisma.

	// Simulate a long-running validation that can be canceled.
	for i := 0; i < 15; i++ { // Simulate a 15-second process
		select {
		case <-ctx.Done():
			// The context is canceled, so the activity should stop.
			logger.Warn("ValidateDataActivity canceled.")
			return "", ctx.Err() // Return the cancellation error
		default:
			// Not canceled, continue work.
			activity.RecordHeartbeat(ctx, fmt.Sprintf("Validation progress: %d%%", (i*100)/15))
			time.Sleep(1 * time.Second)
		}
	}

	// Simulate successful validation
	return "Validated", nil
}

// SubmitFilingActivity submits the filing to the CIPC.
func SubmitFilingActivity(ctx context.Context, params FilingWorkflowParams, otp string) (string, error) {
	logger := activity.GetLogger(ctx)
	logger.Info("Submitting filing to CIPC", "companyRegNum", params.CompanyRegNum, "serviceType", params.ServiceType)

	// In a real implementation, this would:
	// 1. Use the CIPC API or a browser automation tool to log in.
	// 2. Fill out the required forms with the validated data.
	// 3. Handle the One-Time Pin (OTP) submission.
	// 4. Potentially trace payments on a blockchain for auditing.

	// Simulate a long-running submission that can be canceled.
	for i := 0; i < 30; i++ { // Simulate a 30-second process
		select {
		case <-ctx.Done():
			// The context is canceled, so the activity should stop.
			logger.Warn("SubmitFilingActivity canceled.")
			return "", ctx.Err() // Return the cancellation error
		default:
			// Not canceled, continue work.
			activity.RecordHeartbeat(ctx, fmt.Sprintf("Submission progress: %d%%", (i*100)/30))
			time.Sleep(1 * time.Second)
		}
	}

	// Simulate a successful submission and return a confirmation number.
	// Note: In a real app, you would use a more robust method for generating confirmation numbers.
	// Using RunID is convenient for demonstration but may not be ideal for production.
	info := activity.GetInfo(ctx)
	confirmationNum := fmt.Sprintf("AR2025/%s", info.WorkflowExecution.RunID)

	return confirmationNum, nil
}
