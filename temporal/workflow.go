package temporal

import (
	"time"

	"go.temporal.io/sdk/workflow"
)

func CountingWorkflow(ctx workflow.Context, count int) (int, error) {
	logger := workflow.GetLogger(ctx)
	logger.Info("CountingWorkflow started", "count", count)

	if count >= 10 {
		logger.Info("Workflow completed.")
		return count, nil
	}

	// Simulate some work
	if err := workflow.Sleep(ctx, 2*time.Second); err != nil {
		return 0, err
	}

	// Continue as new with incremented count
	return 0, workflow.ContinueAsNew(ctx, CountingWorkflow, count+1)
}
