
package temporal

import (
	"context"
	"fmt"
	"time"

	"go.temporal.io/sdk/activity"
	"go.temporal.io/sdk/temporal"
	"go.temporal.io/sdk/workflow"
)

// --- Input and Result Structs ---

// FilingWorkflowInput represents the input for filing workflows
type FilingWorkflowInput struct {
	TransactionID   string                 `json:"transaction_id"`
	UserID          string                 `json:"user_id"`
	ServiceType     string                 `json:"service_type"`
	FilingData      map[string]interface{} `json:"filing_data"`
	IsUrgent        bool                   `json:"is_urgent"`
	CompanyRegNumber string                `json:"company_reg_number"`
}

// FilingWorkflowResult represents the result of filing workflows
type FilingWorkflowResult struct {
	Success         bool   `json:"success"`
	FilingReference string `json:"filing_reference"`
	ErrorMessage    string `json:"error_message,omitempty"`
}

// OTPSignal defines the structure for the OTP signal
type OTPSignal struct {
	OTP string
}

// --- The Consolidated Workflow ---

// CombinedFilingWorkflow is the single, authoritative workflow for the entire filing process.
func CombinedFilingWorkflow(ctx workflow.Context, params FilingWorkflowInput) (*FilingWorkflowResult, error) {
	logger := workflow.GetLogger(ctx)
	logger.Info("Starting CombinedFilingWorkflow", "TransactionID", params.TransactionID)

	ao := workflow.ActivityOptions{
		StartToCloseTimeout: time.Minute * 5,
		RetryPolicy: &temporal.RetryPolicy{
			InitialInterval:    time.Second,
			BackoffCoefficient: 2.0,
			MaximumInterval:    time.Minute,
			MaximumAttempts:    3,
		},
	}
	ctx = workflow.WithActivityOptions(ctx, ao)

	// Step 1: Validate Payment
	var paymentValid bool
	if err := workflow.ExecuteActivity(ctx, ValidatePaymentActivity, params.TransactionID).Get(ctx, &paymentValid); err != nil {
		return nil, fmt.Errorf("payment validation activity failed: %w", err)
	}
	if !paymentValid {
		return &FilingWorkflowResult{Success: false, ErrorMessage: "Payment not confirmed"}, nil
	}

	// Step 2: Extract Document Data
	var extractedData map[string]interface{}
	if err := workflow.ExecuteActivity(ctx, ExtractDocumentDataActivity, params).Get(ctx, &extractedData); err != nil {
		return nil, fmt.Errorf("document extraction activity failed: %w", err)
	}

	// Step 3: Request OTP from User
	if err := workflow.ExecuteActivity(ctx, RequestOTPActivity, params.UserID).Get(ctx, nil); err != nil {
		return nil, fmt.Errorf("RequestOTPActivity failed: %w", err)
	}

	// Step 4: Wait for the OTP signal
	var otpSignal OTPSignal
	otpChan := workflow.GetSignalChannel(ctx, "UserSentOTP")
	signalReceived := otpChan.ReceiveWithTimeout(ctx, time.Minute*10, &otpSignal)

	if !signalReceived {
		timeoutMessage := "We didn't receive the OTP in time. Please start the process again."
		_ = workflow.ExecuteActivity(ctx, SendWhatsAppMessageActivity, params.UserID, timeoutMessage).Get(ctx, nil)
		return nil, temporal.NewTimeoutError("user did not provide OTP in time", temporal.TimeoutTypeStartToClose)
	}

	// Step 5: Submit to CIPC with OTP
	var filingReference string
	submissionInput := map[string]interface{}{
		"ServiceType": params.ServiceType,
		"OTP":         otpSignal.OTP,
		"Data":        extractedData,
	}
	if err := workflow.ExecuteActivity(ctx, SubmitToCIPCActivity, submissionInput).Get(ctx, &filingReference); err != nil {
		return nil, fmt.Errorf("CIPC submission activity failed: %w", err)
	}

	// Step 6: Update User Records to PROCESSING_COMPLETE
	updateRecordInput := map[string]interface{}{
		"UserID":          params.UserID,
		"TransactionID":   params.TransactionID,
		"FilingReference": filingReference,
		"Status":          "PROCESSING_COMPLETE",
	}
	if err := workflow.ExecuteActivity(ctx, UpdateUserRecordsActivity, updateRecordInput).Get(ctx, nil); err != nil {
		logger.Warn("Failed to update user records", "error", err)
	}

	// Step 7: Send Final Confirmation
	confirmationMsg := fmt.Sprintf("✅ *Filing Complete!*\n\nService: %s\nReference: %s", params.ServiceType, filingReference)
	_ = workflow.ExecuteActivity(ctx, SendWhatsAppMessageActivity, params.UserID, confirmationMsg).Get(ctx, nil)

	return &FilingWorkflowResult{
		Success:         true,
		FilingReference: filingReference,
	}, nil
}

// --- Activity Implementations ---

// ValidatePaymentActivity mocks payment validation.
func ValidatePaymentActivity(ctx context.Context, transactionID string) (bool, error) {
	activity.GetLogger(ctx).Info("Validating payment", "transaction_id", transactionID)
	time.Sleep(1 * time.Second)
	return true, nil
}

// ExtractDocumentDataActivity mocks document data extraction.
func ExtractDocumentDataActivity(ctx context.Context, input FilingWorkflowInput) (map[string]interface{}, error) {
	activity.GetLogger(ctx).Info("Extracting document data", "service_type", input.ServiceType)
	return map[string]interface{}{"extracted_field": "extracted_value"}, nil
}

// RequestOTPActivity mocks sending an OTP request.
func RequestOTPActivity(ctx context.Context, userID string) error {
	message := "The CIPC portal requires an OTP to proceed. Please send us the code you receive via SMS."
	return SendWhatsAppMessageActivity(ctx, userID, message)
}

// SubmitToCIPCActivity mocks the submission to CIPC.
func SubmitToCIPCActivity(ctx context.Context, submissionInput map[string]interface{}) (string, error) {
	activity.GetLogger(ctx).Info("Submitting to CIPC", "input", submissionInput)
	time.Sleep(3 * time.Second)
	return fmt.Sprintf("CIPC-REF-%d", time.Now().Unix()), nil
}

// UpdateUserRecordsActivity mocks updating the user's records.
func UpdateUserRecordsActivity(ctx context.Context, updateRecordInput map[string]interface{}) error {
	activity.GetLogger(ctx).Info("Updating user records to PROCESSING_COMPLETE", "input", updateRecordInput)
	// In a real implementation, this would update your database.
	time.Sleep(1 * time.Second)
	return nil
}

// SendWhatsAppMessageActivity mocks sending a WhatsApp message.
func SendWhatsAppMessageActivity(ctx context.Context, userID, message string) error {
	activity.GetLogger(ctx).Info("Sending WhatsApp message", "UserID", userID, "Message", message)
	time.Sleep(1 * time.Second)
	return nil
}
