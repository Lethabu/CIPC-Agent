package temporal

import (
	"context"
	"fmt"
	"time"

	"go.temporal.io/sdk/activity"
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

func PerformComplianceCheckActivity(ctx context.Context, regNum string) (string, error) {
	logger := activity.GetLogger(ctx)
	logger.Info("Performing compliance check for registration number", "regNum", regNum)
	// In a real implementation, this would check the compliance status of the company.
	time.Sleep(2 * time.Second)
	return fmt.Sprintf("Compliance check passed for %s", regNum), nil
}
