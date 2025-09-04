package main

import (
	"context"
	"log"

	"go.temporal.io/api/enums/v1"
	"go.temporal.io/sdk/client"

	"CIPC-Agent/temporal"
)

func main() {
	c, err := client.Dial(client.Options{})
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
