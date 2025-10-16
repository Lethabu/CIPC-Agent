package main

import (
	"time"
	"go.temporal.io/sdk/workflow"
)

type OnboardingRequest struct {
	UserID    string `json:"user_id"`
	CompanyID string `json:"company_id"`
	Data      map[string]interface{} `json:"data"`
}

type FilingRequest struct {
	CompanyID string `json:"company_id"`
	Type      string `json:"type"`
	Data      map[string]interface{} `json:"data"`
}

func OnboardingWorkflow(ctx workflow.Context, req OnboardingRequest) error {
	ao := workflow.ActivityOptions{
		StartToCloseTimeout: 10 * time.Minute,
	}
	ctx = workflow.WithActivityOptions(ctx, ao)

	err := workflow.ExecuteActivity(ctx, ProcessOnboarding, req).Get(ctx, nil)
	if err != nil {
		return err
	}

	return nil
}

func FilingWorkflow(ctx workflow.Context, req FilingRequest) error {
	ao := workflow.ActivityOptions{
		StartToCloseTimeout: 30 * time.Minute,
	}
	ctx = workflow.WithActivityOptions(ctx, ao)

	err := workflow.ExecuteActivity(ctx, SubmitFiling, req).Get(ctx, nil)
	if err != nil {
		return err
	}

	return nil
}

func ComplianceWorkflow(ctx workflow.Context, companyID string) error {
	ao := workflow.ActivityOptions{
		StartToCloseTimeout: 5 * time.Minute,
	}
	ctx = workflow.WithActivityOptions(ctx, ao)

	err := workflow.ExecuteActivity(ctx, CheckCompliance, companyID).Get(ctx, nil)
	if err != nil {
		return err
	}

	return nil
}

func DeadlineWorkflow(ctx workflow.Context, companyID string) error {
	ao := workflow.ActivityOptions{
		StartToCloseTimeout: 2 * time.Minute,
	}
	ctx = workflow.WithActivityOptions(ctx, ao)

	err := workflow.ExecuteActivity(ctx, SendReminder, companyID).Get(ctx, nil)
	if err != nil {
		return err
	}

	return nil
}