package temporal

import (
	"time"

	"go.temporal.io/sdk/workflow"
)

// CreatePayFastPaymentWorkflow executes the activity to create a PayFast payment.
func CreatePayFastPaymentWorkflow(ctx workflow.Context, request PayFastPaymentRequest, passphrase string) (*PayFastPaymentResponse, error) {
	ao := workflow.ActivityOptions{
		StartToCloseTimeout: 30 * time.Second, // Give the activity enough time to complete
	}
	ctx = workflow.WithActivityOptions(ctx, ao)

	var result PayFastPaymentResponse
	err := workflow.ExecuteActivity(ctx, CreatePayFastPaymentActivity, request, passphrase).Get(ctx, &result)
	if err != nil {
		return nil, err
	}

	return &result, nil
}

// CreatePayStackPaymentWorkflow executes the activity to create a PayStack payment.
func CreatePayStackPaymentWorkflow(ctx workflow.Context, request PayStackPaymentRequest, secretKey string) (*PayStackPaymentResponse, error) {
	ao := workflow.ActivityOptions{
		StartToCloseTimeout: 30 * time.Second, // Give the activity enough time to complete
	}
	ctx = workflow.WithActivityOptions(ctx, ao)

	var result PayStackPaymentResponse
	err := workflow.ExecuteActivity(ctx, CreatePayStackPaymentActivity, request, secretKey).Get(ctx, &result)
	if err != nil {
		return nil, err
	}

	return &result, nil
}

// CreateYocoPaymentWorkflow executes the activity to create a Yoco payment.
func CreateYocoPaymentWorkflow(ctx workflow.Context, request YocoPaymentRequest, secretKey string) (*YocoPaymentResponse, error) {
	ao := workflow.ActivityOptions{
		StartToCloseTimeout: 30 * time.Second, // Give the activity enough time to complete
	}
	ctx = workflow.WithActivityOptions(ctx, ao)

	var result YocoPaymentResponse
	err := workflow.ExecuteActivity(ctx, CreateYocoPaymentActivity, request, secretKey).Get(ctx, &result)
	if err != nil {
		return nil, err
	}

	return &result, nil
}

// VerifyPaymentWorkflow executes the activity to verify a payment.
func VerifyPaymentWorkflow(ctx workflow.Context, request PaymentVerificationRequest) (*PaymentVerificationResponse, error) {
	ao := workflow.ActivityOptions{
		StartToCloseTimeout: 30 * time.Second,
	}
	ctx = workflow.WithActivityOptions(ctx, ao)

	var result PaymentVerificationResponse
	err := workflow.ExecuteActivity(ctx, VerifyPaymentActivity, request).Get(ctx, &result)
	if err != nil {
		return nil, err
	}

	return &result, nil
}

// ProcessWebhookWorkflow executes the activity to process a webhook.
func ProcessWebhookWorkflow(ctx workflow.Context, request WebhookProcessingRequest) (*WebhookProcessingResponse, error) {
	ao := workflow.ActivityOptions{
		StartToCloseTimeout: 30 * time.Second,
	}
	ctx = workflow.WithActivityOptions(ctx, ao)

	var result WebhookProcessingResponse
	err := workflow.ExecuteActivity(ctx, ProcessWebhookActivity, request).Get(ctx, &result)
	if err != nil {
		return nil, err
	}

	return &result, nil
}
