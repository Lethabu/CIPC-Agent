package main

import (
	"crypto/tls"
	"log"

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
		Credentials:       client.NewAPIKeyStaticCredentials("eyJhbGciOiJFUzI1NiIsICJraWQiOiJXdnR3YUEifQ.eyJhY2NvdW50X2lkIjoiamtud2EiLCAiYXVkIjpbInRlbXBvcmFsLmlvIl0sICJleHAiOjE4MjAxMTI4MjQsICJpc3MiOiJ0ZW1wb3JhbC5pbyIsICJqdGkiOiIwdVVySUJZcGxTeWNLQW1ZYzJIVDA4cTQxRERObzhwcyIsICJrZXlfaWQiOiIwdVVySUJZcGxTeWNLQW1ZYzJIVDA4cTQxRERObzhwcyIsICJzdWIiOiI3M2NkZGY5Y2JiZjM0ZDBkYjZjNTE0YmQ1ZTMyZDJmNyJ9.V-lou5ue4EOlF4QYIazI6vaptTbIwDwJLRAAL-uDLGppDKxrNV2DpN8SDtd7MvLaaQmK24pVMIpQU0yqak1sDgeyJhbGciOiJFUzI1NiIsICJraWQiOiJXdnR3YUEifQ.eyJhY2NvdW50X2lkIjoiamtud2EiLCAiYXVkIjpbInRlbXBvcmFsLmlvIl0sICJleHAiOjE4MjAxMTI4MjQsICJpc3MiOiJ0ZW1wb3JhbC5pbyIsICJqdGkiOiIwdVVySUJZcGxTeWNLQW1ZYzJIVDA4cTQxRERObzhwcyIsICJrZXlfaWQiOiIwdVVySUJZcGxTeWNLQW1ZYzJIVDA4cTQxRERObzhwcyIsICJzdWIiOiI3M2NkZGY5Y2JiZjM0ZDBkYjZjNTE0YmQ1ZTMyZDJmNyJ9.V-lou5ue4EOlF4QYIazI6vaptTbIwDwJLRAAL-uDLGppDKxrNV2DpN8SDtd7MvLaaQmK24pVMIpQU0yqak1sDg"),
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
