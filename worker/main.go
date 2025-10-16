package main

import (
	"log"
	"os"

	"go.temporal.io/sdk/client"
	"go.temporal.io/sdk/worker"
	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load()

	c, err := client.Dial(client.Options{
		HostPort: os.Getenv("TEMPORAL_HOST_PORT"),
	})
	if err != nil {
		log.Fatalln("Unable to create client", err)
	}
	defer c.Close()

	// Start scheduled jobs
	err = StartScheduledJobs(c)
	if err != nil {
		log.Printf("Warning: Could not start scheduled jobs: %v", err)
	}

	w := worker.New(c, "CIPC_TASK_QUEUE", worker.Options{})

	// Register workflows
	w.RegisterWorkflow(OnboardingWorkflow)
	w.RegisterWorkflow(FilingWorkflow)
	w.RegisterWorkflow(ComplianceWorkflow)
	w.RegisterWorkflow(DeadlineWorkflow)
	w.RegisterWorkflow(LeadScoutWorkflow)
	w.RegisterWorkflow(MetricsWorkflow)

	// Register activities
	w.RegisterActivity(ProcessOnboarding)
	w.RegisterActivity(SubmitFiling)
	w.RegisterActivity(CheckCompliance)
	w.RegisterActivity(SendReminder)
	w.RegisterActivity(ScoutLeads)
	w.RegisterActivity(CalculateMetrics)

	log.Println("CIPC-Agent worker started successfully")
	err = w.Run(worker.InterruptCh())
	if err != nil {
		log.Fatalln("Unable to start worker", err)
	}
}