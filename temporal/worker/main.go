package main

import (
	"log"

	"go.temporal.io/sdk/client"
	"go.temporal.io/sdk/worker"

	"CIPC-Agent/temporal"
)

func main() {
	// The client and worker are heavyweight objects that should be created once per process.
	c, err := client.Dial(client.Options{})
	if err != nil {
		log.Fatalln("Unable to create client", err)
	}
	defer c.Close()

	w := worker.New(c, "counting", worker.Options{})

	// Register all the workflows and activities
	w.RegisterWorkflow(temporal.CountingWorkflow)
	w.RegisterWorkflow(temporal.ScheduledWorkflow)
	w.RegisterWorkflow(temporal.AIWhatsAppWorkflow)
	w.RegisterActivity(temporal.CallAIActivity)
	w.RegisterActivity(temporal.SendWhatsAppActivity)
	w.RegisterWorkflow(temporal.CIPCCommanderWorkflow)
	w.RegisterWorkflow(temporal.KYCOnboarderWorkflow)
	w.RegisterWorkflow(temporal.FormAutopilotWorkflow)
	w.RegisterWorkflow(temporal.ComplianceCopilotWorkflow)
	w.RegisterActivity(temporal.PerformKYCCheckActivity)
	w.RegisterActivity(temporal.FillOutFormsActivity)
	w.RegisterActivity(temporal.PerformComplianceCheckActivity)
	w.RegisterActivity(temporal.CreateManualVerificationTaskActivity)

	// Register the Onboarding workflow and its activities
	w.RegisterWorkflow(temporal.OnboardingWorkflow)
	w.RegisterActivity(temporal.SendWelcomeAndConsentActivity)
	w.RegisterActivity(temporal.SendConsentTimeoutMessageActivity)
	w.RegisterActivity(temporal.CalculateInitialComplianceScoreActivity)
	w.RegisterActivity(temporal.PromptForSubscriptionActivity)

	// Register the Filing workflow and its components
	w.RegisterWorkflow(temporal.FilingWorkflow)
	w.RegisterWorkflow(temporal.ComplianceCheckWorkflow) // Child workflow
	w.RegisterActivity(temporal.ValidateDataActivity)
	w.RegisterActivity(temporal.SubmitFilingActivity)

	// Register the Payment Recovery workflow and its activities
	w.RegisterWorkflow(temporal.PaymentRecoveryWorkflow)
	w.RegisterActivity(temporal.ChargeCardActivity)
	w.RegisterActivity(temporal.SendPaymentSuccessMessageActivity)
	w.RegisterActivity(temporal.SendPaymentFailedMessageActivity)
	w.RegisterActivity(temporal.SuspendAccountActivity)


	err = w.Run(worker.InterruptCh())
	if err != nil {
		log.Fatalln("Unable to start worker", err)
	}
}
