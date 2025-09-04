package temporal

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"

	"go.temporal.io/sdk/activity"
	"go.temporal.io/sdk/workflow"
)

// --- Signal Structs ---
type DocumentSignal struct {
	DocumentURL  string
	DocumentType string
}

type OTPSignal struct {
	OTP string
}


// --- Helper for Internal API Calls ---
// ... (implementation from previous step remains the same)
func CallInternalAPI(ctx context.Context, to, message string) error {
	// ... implementation remains the same
	return nil
}


// --- Onboarding Workflow & Activities ---
// ... (implementations from previous steps remain the same)
func OnboardingWorkflow(ctx workflow.Context, phoneNumber string, initialMessage string) (string, error) {
	// ...
	return "Onboarding complete", nil
}
func SendWhatsAppWelcomeActivity(ctx context.Context, phoneNumber string) error { 
	// ...
	return nil 
}
func KYCOnboarderActivity(ctx context.Context, params map[string]string) (string, error) {
	// ...
	return "KYC Passed", nil
}
func ComplianceCopilotActivity(ctx context.Context, phoneNumber string) (int, error) {
	// ...
	return 85, nil
}
func PromptSubscriptionActivity(ctx context.Context, phoneNumber string, message string) error {
	// ...
	return nil
}


// --- Filing Workflow & Activities ---

// Refactored FilingWorkflow to handle interactive OTP signal.
func FilingWorkflow(ctx workflow.Context, params FilingWorkflowParams) (string, error) {
	ao := workflow.ActivityOptions{StartToCloseTimeout: time.Minute * 5}
	ctx = workflow.WithActivityOptions(ctx, ao)

	// Step 1: Data Validation
	var validationResult string
	err := workflow.ExecuteActivity(ctx, ValidateFilingDataActivity, params).Get(ctx, &validationResult)
	if err != nil {
		return "", err
	}

	// Step 2: Request the OTP from the user.
	err = workflow.ExecuteActivity(ctx, RequestOTPActivity, params.UserPhone).Get(ctx, nil)
	if err != nil {
		return "", err
	}

	// Step 3: Wait for the user to send the OTP via signal.
	var otpSignal OTPSignal
	otpChan := workflow.GetSignalChannel(ctx, "UserSentOTP")
	timerCtx, cancelTimer := workflow.NewTimer(ctx, time.Minute*10) // 10-minute timeout for OTP

	var signalReceived bool
	selector := workflow.NewSelector(ctx)
	selector.AddReceive(otpChan, func(c workflow.ReceiveChannel, more bool) {
		c.Receive(ctx, &otpSignal)
		signalReceived = true
	})
	selector.AddFuture(timerCtx, func(f workflow.Future) {})

	selector.Select(ctx)

	if !signalReceived {
		return "", workflow.NewTimeoutError("User did not provide OTP in time", workflow.TimeoutTypeStartToClose)
	}
	cancelTimer()

	// Step 4: CIPC Submission with the received OTP.
	activityTimeout := time.Minute * 10 // This activity can be long-running
	sao := workflow.ActivityOptions{StartToCloseTimeout: activityTimeout, HeartbeatTimeout: time.Minute * 2}
	ctx = workflow.WithActivityOptions(ctx, sao)

	submissionParams := SubmitFilingParams{
		CompanyRegNum: params.CompanyRegNum,
		ServiceType:   params.ServiceType,
		OTP:           otpSignal.OTP,
	}
	var submissionResult string
	err = workflow.ExecuteActivity(ctx, SubmitFilingToCIPCActivity, submissionParams).Get(ctx, &submissionResult)
	if err != nil {
		return "", err
	}

	// Step 5: Send confirmation to user
	confirmationMsg := fmt.Sprintf("Your %s filing for %s has been submitted! Reference: %s", params.ServiceType, params.CompanyRegNum, submissionResult)
	err = workflow.ExecuteActivity(ctx, SendWhatsAppConfirmationActivity, params.UserPhone, confirmationMsg).Get(ctx, nil)
	if err != nil {
		return "", err
	}

	return submissionResult, nil
}

func ValidateFilingDataActivity(ctx context.Context, params FilingWorkflowParams) (string, error) {
	// ... implementation remains the same
	return "Validated", nil
}

func RequestOTPActivity(ctx context.Context, phoneNumber string) error {
	logger := activity.GetLogger(ctx)
	logger.Info("Requesting OTP from user", "phoneNumber", phoneNumber)
	message := "The CIPC portal requires an OTP to proceed. Please send us the code you receive via SMS."
	return CallInternalAPI(ctx, phoneNumber, message)
}

// ... (SubmitFilingToCIPCActivity and other activities remain the same)


// --- Payment Recovery & Compliance Monitoring Workflows ---
// ... (implementations from previous steps remain the same)
