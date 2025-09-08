package temporal

import (
	"time"

	"go.temporal.io/sdk/workflow"
)

// ComplianceCopilotWorkflow - The AI agent that monitors and manages compliance
func ComplianceCopilotWorkflow(ctx workflow.Context, userID string) (string, error) {
	ao := workflow.ActivityOptions{
		StartToCloseTimeout: time.Minute * 5,
		RetryPolicy: &workflow.RetryPolicy{
			InitialInterval:    time.Second * 10,
			BackoffCoefficient: 2.0,
			MaximumInterval:    time.Minute * 5,
			MaximumAttempts:    3,
		},
	}
	ctx = workflow.WithActivityOptions(ctx, ao)

	// 1. Calculate current compliance health score
	var complianceScore int
	err := workflow.ExecuteActivity(ctx, CalculateComplianceHealthScoreActivity, userID).Get(ctx, &complianceScore)
	if err != nil {
		return "", err
	}

	// 2. Check for upcoming deadlines
	var upcomingDeadlines []string
	err = workflow.ExecuteActivity(ctx, CheckUpcomingDeadlinesActivity, userID).Get(ctx, &upcomingDeadlines)
	if err != nil {
		return "", err
	}

	// 3. Send proactive compliance alerts if needed
	if complianceScore < 80 || len(upcomingDeadlines) > 0 {
		err = workflow.ExecuteActivity(ctx, SendComplianceAlertActivity, userID, complianceScore, upcomingDeadlines).Get(ctx, nil)
		if err != nil {
			return "", err
		}
	}

	// 4. Schedule automated filings for eligible deadlines
	for _, deadline := range upcomingDeadlines {
		var canAutomate bool
		err = workflow.ExecuteActivity(ctx, CheckAutomationEligibilityActivity, userID, deadline).Get(ctx, &canAutomate)
		if err != nil {
			continue // Skip this deadline if check fails
		}

		if canAutomate {
			// Start automated filing workflow
			cwo := workflow.ChildWorkflowOptions{
				WorkflowID: "automated-filing-" + userID + "-" + deadline,
			}
			ctx = workflow.WithChildOptions(ctx, cwo)
			workflow.ExecuteChildWorkflow(ctx, AutomatedFilingWorkflow, userID, deadline)
		}
	}

	// 5. Update metrics
	err = workflow.ExecuteActivity(ctx, UpdateComplianceMetricsActivity, userID, complianceScore).Get(ctx, nil)
	if err != nil {
		return "", err
	}

	return "Compliance check completed successfully", nil
}

// Schedule this workflow to run daily for all active users
func ScheduleComplianceCopilotWorkflow(ctx workflow.Context) error {
	// This would be called by a cron workflow to check all users
	var activeUsers []string
	ao := workflow.ActivityOptions{
		StartToCloseTimeout: time.Minute * 2,
	}
	ctx = workflow.WithActivityOptions(ctx, ao)

	err := workflow.ExecuteActivity(ctx, GetActiveUsersActivity).Get(ctx, &activeUsers)
	if err != nil {
		return err
	}

	// Start compliance check for each user
	for _, userID := range activeUsers {
		cwo := workflow.ChildWorkflowOptions{
			WorkflowID: "compliance-copilot-" + userID + "-" + time.Now().Format("2006-01-02"),
		}
		ctx = workflow.WithChildOptions(ctx, cwo)
		workflow.ExecuteChildWorkflow(ctx, ComplianceCopilotWorkflow, userID)
	}

	return nil
}