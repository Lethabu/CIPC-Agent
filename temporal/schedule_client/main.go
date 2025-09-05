package main

import (
	"context"
	"crypto/tls"
	"log"

	"go.temporal.io/api/enums/v1"
	"go.temporal.io/sdk/client"

	"CIPC-Agent/temporal"
)

func main() {
	// Initialize client connection
	clientOptions := client.Options{
		HostPort:          "eu-west-1.aws.api.temporal.io:7233",
		Namespace:         "quickstart-cipc-agent-prod.jknwa",
		ConnectionOptions: client.ConnectionOptions{TLS: &tls.Config{}},
		Credentials:       client.NewAPIKeyStaticCredentials("eyJhbGciOiJFUzI1NiIsICJraWQiOiJXdnR3YUEifQ.eyJhY2NvdW50X2lkIjoiamtud2EiLCAiYXVkIjpbInRlbXBvcmFsLmlvIl0sICJleHAiOjE4MjAxMTI4MjQsICJpc3MiOiJ0ZW1wb3JhbC5pbyIsICJqdGkiOiIwdVVySUJZcGxTeWNLQW1ZYzJIVDA4cTQxRERObzhwcyIsICJrZXlfaWQiOiIwdVVySUJZcGxTeWNLQW1ZYzJIVDA4cTQxRERObzhwcyIsICJzdWIiOiI3M2NkZGY5Y2JiZjM0ZDBkYjZjNTE0YmQ1ZTMyZDJmNyJ9.V-lou5ue4EOlF4QYIazI6vaptTbIwDwJLRAAL-uDLGppDKxrNV2DpN8SDtd7MvLaaQmK24pVMIpQU0yqak1sDgeyJhbGciOiJFUzI1NiIsICJraWQiOiJXdnR3YUEifQ.eyJhY291bnRfaWQiOiJqam53YSIsICJhdWQiOlsidGVtcG9yYWwuaW8iXSwgImV4cCI6MTgyMDExMjgyNCwgImlzcyI6InRlbXBvcmFsLmlvIiwgImp0aSI6IjB1VXJJQllwbFN5Y0tBbVljMkhUMDhwczIsICJrZXlfaWQiOiIwdVVySUJZcGxTeWNLQW1ZYzJIVDA4cTQxRERObzhwcyIsICJzdWIiOiI3M2NkZGY5Y2JiZjM0ZDBkYjZjNTE0YmQ1ZTMyZDJmNyJ9.V-lou5ue4EOlF4QYIazI6vaptTbIwDwJLRAAL-uDLGppDKxrNV2DpN8SDtd7MvLaaQmK24pVMIpQU0yqak1sDg"),
	}
	c, err := client.Dial(clientOptions)
	if err != nil {
		log.Fatalln("Unable to create client", err)
	}
	defer c.Close()

	// Create a schedule
	scheduleID := "my-structured-schedule"
	workflowID := "scheduled-workflow-structured"

	scheduleHandle, err := c.ScheduleClient().Create(context.Background(), client.ScheduleOptions{
		ID: scheduleID,
		Spec: client.ScheduleSpec{
			// Using a structured calendar spec to run at 30 seconds past every minute.
			Calendars: []client.CalendarSpec{
				{
					Second: client.ScheduleRange{Start: 30},
				},
			},
			// We can also add jitter to distribute the load on the system
			Jitter: client.ScheduleJitter{Seconds: 5},
		},
		Action: &client.ScheduleWorkflowAction{
			ID:        workflowID,
			Workflow:  temporal.ScheduledWorkflow,
			Args:      []interface{}{"World"},
			TaskQueue: "counting",
		},
		// We can define what happens when an action is taken on a schedule that overlaps
		// with another scheduled time.
		Policy: &client.SchedulePolicies{
			Overlap: enums.SCHEDULE_OVERLAP_POLICY_SKIP,
		},
	})
	if err != nil {
		log.Fatalln("Unable to create schedule", err)
	}

	log.Println("Schedule created", "ScheduleID", scheduleHandle.GetID())
}
