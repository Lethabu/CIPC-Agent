package temporal

import (
	"context"
	"fmt"

	"go.temporal.io/sdk/activity"
)

// ChargeCardActivity attempts to charge the user's card.
func ChargeCardActivity(ctx context.Context, userPhone string, amount float64) (string, error) {
	logger := activity.GetLogger(ctx)
	logger.Info("Attempting to charge card", "userPhone", userPhone, "amount", amount)

	// In a real implementation, this would call a payment gateway like Stripe.
	// We'll simulate a failure for demonstration purposes.
	return "FAILURE", nil
}

// SendPaymentSuccessMessageActivity sends a message confirming successful payment.
func SendPaymentSuccessMessageActivity(ctx context.Context, userPhone string, amount float64) error {
	logger := activity.GetLogger(ctx)
	message := fmt.Sprintf("Thank you! Your payment of ZAR %.2f was successful.", amount)
	logger.Info("Sending payment success message", "userPhone", userPhone, "message", message)

	return SendWhatsAppActivity(ctx, userPhone, message)
}

// SendPaymentFailedMessageActivity sends a message about a failed payment.
func SendPaymentFailedMessageActivity(ctx context.Context, userPhone string, amount float64) error {
	logger := activity.GetLogger(ctx)
	message := fmt.Sprintf("Your payment of ZAR %.2f failed. Please update your payment method.", amount)
	logger.Info("Sending payment failed message", "userPhone", userPhone, "message", message)

	return SendWhatsAppActivity(ctx, userPhone, message)
}

// SuspendAccountActivity suspends the user's account in the database.
func SuspendAccountActivity(ctx context.Context, userPhone string) (string, error) {
	logger := activity.GetLogger(ctx)
	logger.Info("Suspending account", "userPhone", userPhone)

	// In a real implementation, this would update the user's status in your database.
	return "Account suspended", nil
}
