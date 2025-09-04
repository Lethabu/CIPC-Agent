package temporal

import (
	"context"
	"fmt"

	"go.temporal.io/sdk/activity"
)

// SendWelcomeAndConsentActivity sends the initial welcome message and asks for POPIA consent.
func SendWelcomeAndConsentActivity(ctx context.Context, phoneNumber string) error {
	logger := activity.GetLogger(ctx)
	logger.Info("Sending Welcome & Consent message", "phoneNumber", phoneNumber)

	message := "Welcome to the CIPC AI Commander! To get started, we need your consent to process your information as per POPIA. Reply 'YES' to continue."

	// This will call our internal Node.js service to send the WhatsApp message.
	return SendWhatsAppActivity(ctx, phoneNumber, message)
}

// SendConsentTimeoutMessageActivity sends a message when the user fails to consent in time.
func SendConsentTimeoutMessageActivity(ctx context.Context, phoneNumber string) error {
	logger := activity.GetLogger(ctx)
	logger.Info("User consent timed out", "phoneNumber", phoneNumber)

	message := "Your onboarding session has expired. Please send 'START' again if you wish to continue."

	return SendWhatsAppActivity(ctx, phoneNumber, message)
}

// CalculateInitialComplianceScoreActivity calculates a score based on available data.
// In a real implementation, this would involve more complex logic.
func CalculateInitialComplianceScoreActivity(ctx context.Context, phoneNumber string) (int, error) {
	logger := activity.GetLogger(ctx)
	logger.Info("Calculating initial compliance score", "phoneNumber", phoneNumber)

	// Placeholder: In a real app, you would query your DB for KYC results
	// and other data points to calculate a meaningful score.
	score := 75 // Mock score

	return score, nil
}

// PromptForSubscriptionActivity sends the compliance score and prompts the user to subscribe.
func PromptForSubscriptionActivity(ctx context.Context, phoneNumber string, score int) (string, error) {
	logger := activity.GetLogger(ctx)
	logger.Info("Prompting for subscription", "phoneNumber", phoneNumber, "score", score)

	message := fmt.Sprintf("Your initial compliance score is %d/100. To unlock automated filings and continuous monitoring, subscribe to our service. Reply 'SUBSCRIBE' to see our packages.", score)

	err := SendWhatsAppActivity(ctx, phoneNumber, message)
	if err != nil {
		return "", err
	}

	return "Subscription prompt sent", nil
}
