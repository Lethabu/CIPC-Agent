package temporal

import (
	"time"

	"go.temporal.io/sdk/workflow"
)

// PaymentRecoveryWorkflow handles failed subscription payments.
func PaymentRecoveryWorkflow(ctx workflow.Context, userPhone string, amount float64) (string, error) {
	ao := workflow.ActivityOptions{
		StartToCloseTimeout: time.Minute * 1,
	}
	ctx = workflow.WithActivityOptions(ctx, ao)

	// Try dunning for 3 days.
	for i := 0; i < 3; i++ {
		var chargeResult string
		err := workflow.ExecuteActivity(ctx, ChargeCardActivity, userPhone, amount).Get(ctx, &chargeResult)
		if err == nil && chargeResult == "SUCCESS" {
			workflow.ExecuteActivity(ctx, SendPaymentSuccessMessageActivity, userPhone, amount)
			return "Payment successful", nil
		}

		// If payment fails, wait a day before retrying.
		workflow.ExecuteActivity(ctx, SendPaymentFailedMessageActivity, userPhone, amount)
		awaitErr := workflow.Await(ctx, func() bool {
			// This is a simple timer. In a real-world scenario, you might
			// listen for a signal indicating the user has updated their card.
			return true
		})

		if awaitErr != nil {
			return "", awaitErr
		}

		workflow.NewTimer(ctx, time.Hour*24).Get(ctx, nil)
	}

	// If all retries fail, suspend the account.
	var suspensionResult string
	err := workflow.ExecuteActivity(ctx, SuspendAccountActivity, userPhone).Get(ctx, &suspensionResult)
	if err != nil {
		return "", err
	}

	return "Account suspended after multiple failed payments", nil
}
