package temporal

import (
	"time"

	"go.temporal.io/sdk/workflow"
)

// OnboardingWorkflow handles new user signup, KYC, and initial compliance scoring.
func OnboardingWorkflow(ctx workflow.Context, phoneNumber string) (string, error) {
	ao := workflow.ActivityOptions{
		StartToCloseTimeout: time.Minute * 2,
		RetryPolicy: &workflow.RetryPolicy{
			InitialInterval:    time.Second,
			BackoffCoefficient: 2.0,
			MaximumInterval:    time.Minute,
			MaximumAttempts:    3,
		},
	}
	ctx = workflow.WithActivityOptions(ctx, ao)

	// 1. Welcome & Consent
	var consentGiven bool
	consentSignalChan := workflow.GetSignalChannel(ctx, "user-consent-signal")

	err := workflow.ExecuteActivity(ctx, SendWelcomeAndConsentActivity, phoneNumber).Get(ctx, nil)
	if err != nil {
		return "", err
	}

	// Wait for the user's consent signal, with a timeout.
	timer := workflow.NewTimer(ctx, time.Minute*15) // User has 15 minutes to respond
	selector := workflow.NewSelector(ctx)
	selector.AddReceive(consentSignalChan, func(c workflow.ReceiveChannel, more bool) {
		c.Receive(ctx, &consentGiven)
	})
	selector.AddFuture(timer, func(f workflow.Future) {
		// Timer fired, user did not consent in time
		consentGiven = false
	})

	selector.Select(ctx) // Wait for signal or timer

	if !consentGiven {
		workflow.ExecuteActivity(ctx, SendConsentTimeoutMessageActivity, phoneNumber)
		return "Onboarding failed: User did not provide consent in time.", nil
	}

	// 2. KYC Onboarder (as a child workflow)
	var kycResult string
	cwo := workflow.ChildWorkflowOptions{
		WorkflowID: "kyc-onboarder-" + phoneNumber, // Ensure unique ID
		WorkflowRunTimeout: time.Minute * 15, // Max time for the whole KYC flow
	}
	ctx = workflow.WithChildOptions(ctx, cwo)
	kycChild := workflow.ExecuteChildWorkflow(ctx, KYCOnboarderWorkflow, phoneNumber)
	err = kycChild.Get(ctx, &kycResult)
	if err != nil {
		return "", err // KYC failed
	}

	// 3. Compliance Copilot (Initial Score)
	var complianceScore int
	err = workflow.ExecuteActivity(ctx, CalculateInitialComplianceScoreActivity, phoneNumber).Get(ctx, &complianceScore)
	if err != nil {
		return "", err
	}

	// 4. Subscription Prompt
	var subResult string
	err = workflow.ExecuteActivity(ctx, PromptForSubscriptionActivity, phoneNumber, complianceScore).Get(ctx, &subResult)
	if err != nil {
		return "", err
	}

	return "Onboarding completed successfully: " + subResult, nil
}
