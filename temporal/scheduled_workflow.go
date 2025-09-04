package temporal

import (
	"go.temporal.io/sdk/workflow"
)

func ScheduledWorkflow(ctx workflow.Context, name string) (string, error) {
	logger := workflow.GetLogger(ctx)
	logger.Info("ScheduledWorkflow started", "name", name)
	return "Hello, " + name + " from a scheduled workflow!", nil
}
