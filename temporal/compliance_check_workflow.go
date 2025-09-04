package temporal

import (
	"time"

	"go.temporal.io/sdk/workflow"
)

// ComplianceCheckWorkflow is a child workflow that performs a compliance check.
func ComplianceCheckWorkflow(ctx workflow.Context, regNum string) (string, error) {
	ao := workflow.ActivityOptions{
		StartToCloseTimeout: time.Minute * 1,
	}
	ctx = workflow.WithActivityOptions(ctx, ao)

	var result string
	err := workflow.ExecuteActivity(ctx, PerformComplianceCheckActivity, regNum).Get(ctx, &result)
	if err != nil {
		return "", err
	}

	return result, nil
}
