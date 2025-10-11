package main

import (
	"crypto/tls"
	"log"
	"os"

	"go.temporal.io/sdk/client"
	"go.temporal.io/sdk/worker"

	"CIPC-Agent/temporal"
)

func main() {
	// The client and worker are heavyweight objects that should be created once per process.
	// Initialize client connection
	clientOptions := client.Options{
		HostPort:          "eu-west-1.aws.api.temporal.io:7233",
		Namespace:         "quickstart-cipc-agent-prod.jknwa",
		ConnectionOptions: client.ConnectionOptions{TLS: &tls.Config{}},
	}

	if apiKey := os.Getenv("TEMPORAL_API_KEY"); apiKey != "" {
		clientOptions.Credentials = client.NewAPIKeyStaticCredentials(apiKey)
	} else {
		log.Println("TEMPORAL_API_KEY not set. For local development, will attempt to connect without credentials.")
		// For local dev, you might want to change the HostPort and disable TLS, e.g.:
		// clientOptions.HostPort = "localhost:7233"
		// clientOptions.ConnectionOptions.TLS = nil
	}
	c, err := client.Dial(clientOptions)
	if err != nil {
		log.Fatalln("Unable to create client", err)
	}
	defer c.Close()

	w := worker.New(c, "CIPC_TASK_QUEUE", worker.Options{})

	// Register the Onboarding workflow and its activities
	w.RegisterWorkflow(temporal.OnboardingWorkflow)
	w.RegisterActivity(temporal.SendWelcomeAndConsentActivity)
	w.RegisterActivity(temporal.SendConsentTimeoutMessageActivity)
	w.RegisterActivity(temporal.CalculateInitialComplianceScoreActivity)
	w.RegisterActivity(temporal.PromptForSubscriptionActivity)

	// Register the NEW, CORRECTED Filing workflow and its activities
	w.RegisterWorkflow(temporal.CombinedFilingWorkflow) 
	w.RegisterActivity(temporal.ValidatePaymentActivity)
	w.RegisterActivity(temporal.ExtractDocumentDataActivity)
	w.RegisterActivity(temporal.RequestOTPActivity)
	w.RegisterActivity(temporal.SubmitToCIPCActivity)
	w.RegisterActivity(temporal.UpdateUserRecordsActivity)
	w.RegisterActivity(temporal.SendWhatsAppMessageActivity) // Generic message activity

	// Register the Payment Recovery workflow and its activities
	w.RegisterWorkflow(temporal.PaymentRecoveryWorkflow)
	w.RegisterActivity(temporal.ChargeCardActivity)
	w.RegisterActivity(temporal.SendPaymentSuccessMessageActivity)
	w.RegisterActivity(temporal.SendPaymentFailedMessageActivity)
	w.RegisterActivity(temporal.SuspendAccountActivity)

	// Register AI and other workflows
	w.RegisterWorkflow(temporal.AIWhatsAppWorkflow)
	w.RegisterActivity(temporal.CallAIActivity)
	w.RegisterWorkflow(temporal.ComplianceMonitoringWorkflow) 
	w.RegisterActivity(temporal.CheckUpcomingDeadlinesActivity)
	w.RegisterActivity(temporal.SendDeadlineNotificationActivity)

	log.Println("Worker starting...")
	err = w.Run(worker.InterruptCh())
	if err != nil {
		log.Fatalln("Unable to start worker", err)
	}
}
