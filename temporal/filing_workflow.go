package temporal

import (
	"time"

	"go.temporal.io/sdk/workflow"
)

// FilingWorkflowParams defines the input for the FilingWorkflow.
type FilingWorkflowParams struct {
	UserPhone       string
	CompanyRegNum   string
	ServiceType     string // e.g., "annual_return"
	Documents       []string // URLs from WhatsApp uploads
}

// FilingWorkflow orchestrates the entire CIPC filing process.
func FilingWorkflow(ctx workflow.Context, params FilingWorkflowParams) (string, error) {
	ao := workflow.ActivityOptions{
		StartToCloseTimeout: time.Minute * 5,
		RetryPolicy: &workflow.RetryPolicy{
			InitialInterval:    time.Second,
			BackoffCoefficient: 2.0,
			MaximumInterval:    time.Minute,
			MaximumAttempts:    3,
		},
		HeartbeatTimeout: time.Second * 30, // For long-running activities
	}
	ctx = workflow.WithActivityOptions(ctx, ao)

	// Step 1: Validate Data
	var validationResult string
	err := workflow.ExecuteActivity(ctx, ValidateDataActivity, params).Get(ctx, &validationResult)
	if err != nil {
		return "", err
	}

	// Step 2: Compliance Check (as a child workflow)
	var checkResult string
	cwo := workflow.ChildWorkflowOptions{WorkflowRunTimeout: time.Minute * 2}
	childCtx := workflow.WithChildOptions(ctx, cwo)
	err = workflow.ExecuteChildWorkflow(childCtx, ComplianceCheckWorkflow, params.CompanyRegNum).Get(childCtx, &checkResult)
	if err != nil {
		return "", err
	}

	// Await Signal for OTP/User Input
	var otpSignal string
	otpChan := workflow.GetSignalChannel(ctx, "OTP_SIGNAL")
	selector := workflow.NewSelector(ctx)
	selector.AddReceive(otpChan, func(c workflow.ReceiveChannel, more bool) {
		c.Receive(ctx, &otpSignal)
	})

	// Optional: Add a timeout for waiting for the OTP
	timer := workflow.NewTimer(ctx, time.Minute*5)
	selector.AddFuture(timer, func(f workflow.Future) {
		// Timer fired
	})

	selector.Select(ctx) // Wait for signal or timer

	if otpSignal == "" {
		// Handle timeout
		return "Filing failed: OTP not received in time.", nil
	}

	// Step 3: Submit to CIPC
	var submissionResult string
	err = workflow.ExecuteActivity(ctx, SubmitFilingActivity, params, otpSignal).Get(ctx, &submissionResult)
	if err != nil {
		return "", err
	}

	return submissionResult, nil
}
