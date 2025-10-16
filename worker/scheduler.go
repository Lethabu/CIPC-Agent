package main

import (
	"context"
	"time"
	"go.temporal.io/sdk/client"
	"go.temporal.io/sdk/workflow"
)

func StartScheduledJobs(c client.Client) error {
	// Daily compliance check
	_, err := c.ScheduleClient().Create(context.Background(), client.ScheduleOptions{
		ID: "daily-compliance-check",
		Spec: client.ScheduleSpec{
			CronExpressions: []string{"0 9 * * *"}, // 9 AM daily
		},
		Action: &client.ScheduleWorkflowAction{
			ID:        "compliance-check-" + time.Now().Format("20060102"),
			Workflow:  ComplianceWorkflow,
			TaskQueue: "CIPC_TASK_QUEUE",
		},
	})
	if err != nil {
		return err
	}

	// Weekly lead scouting
	_, err = c.ScheduleClient().Create(context.Background(), client.ScheduleOptions{
		ID: "weekly-lead-scout",
		Spec: client.ScheduleSpec{
			CronExpressions: []string{"0 10 * * 1"}, // 10 AM Mondays
		},
		Action: &client.ScheduleWorkflowAction{
			ID:        "lead-scout-" + time.Now().Format("20060102"),
			Workflow:  LeadScoutWorkflow,
			TaskQueue: "CIPC_TASK_QUEUE",
		},
	})
	if err != nil {
		return err
	}

	// Monthly metrics calculation
	_, err = c.ScheduleClient().Create(context.Background(), client.ScheduleOptions{
		ID: "monthly-metrics",
		Spec: client.ScheduleSpec{
			CronExpressions: []string{"0 8 1 * *"}, // 8 AM on 1st of month
		},
		Action: &client.ScheduleWorkflowAction{
			ID:        "metrics-" + time.Now().Format("200601"),
			Workflow:  MetricsWorkflow,
			TaskQueue: "CIPC_TASK_QUEUE",
		},
	})

	return err
}

func LeadScoutWorkflow(ctx workflow.Context) error {
	ao := workflow.ActivityOptions{
		StartToCloseTimeout: 30 * time.Minute,
	}
	ctx = workflow.WithActivityOptions(ctx, ao)

	return workflow.ExecuteActivity(ctx, ScoutLeads).Get(ctx, nil)
}

func MetricsWorkflow(ctx workflow.Context) error {
	ao := workflow.ActivityOptions{
		StartToCloseTimeout: 15 * time.Minute,
	}
	ctx = workflow.WithActivityOptions(ctx, ao)

	return workflow.ExecuteActivity(ctx, CalculateMetrics).Get(ctx, nil)
}