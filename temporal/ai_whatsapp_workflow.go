package temporal

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"

	"go.temporal.io/sdk/activity"
	"go.temporal.io/sdk/workflow"
)

// AIWhatsAppWorkflow is a workflow that orchestrates the AI agent and WhatsApp communication.
func AIWhatsAppWorkflow(ctx workflow.Context, phoneNumber string, message string) (string, error) {
	ao := workflow.ActivityOptions{
		StartToCloseTimeout: 1 * time.Minute,
	}
	ctx = workflow.WithActivityOptions(ctx, ao)

	// 1. Call the AI orchestrator to get a response.
	var aiResponse string
	err := workflow.ExecuteActivity(ctx, CallAIActivity, message).Get(ctx, &aiResponse)
	if err != nil {
		return "", err
	}

	// 2. Send the AI's response back to the user via WhatsApp.
	err = workflow.ExecuteActivity(ctx, SendWhatsAppActivity, phoneNumber, aiResponse).Get(ctx, nil)
	if err != nil {
		return "", err
	}

	return "Workflow completed successfully", nil
}

// CallAIActivity is a placeholder for calling your AI orchestrator.
// In a real application, this would make an HTTP call to your AI service.
func CallAIActivity(ctx context.Context, message string) (string, error) {
	logger := activity.GetLogger(ctx)
	logger.Info("Calling AI orchestrator with message", "message", message)

	// Simulate a call to the AI, which might involve some processing time.
	// In a real implementation, you would replace this with an HTTP call to your aiOrchestrator.
	// For now, we will just echo the message back.
	response := fmt.Sprintf("The AI says: %s", message)

	return response, nil
}

// SendWhatsAppActivity makes an HTTP call to the internal Node.js endpoint to send a message.
func SendWhatsAppActivity(ctx context.Context, to string, message string) error {
	logger := activity.GetLogger(ctx)
	logger.Info("Sending WhatsApp message", "to", to, "message", message)

	internalAPIKey := os.Getenv("INTERNAL_API_KEY")
	if internalAPIKey == "" {
		internalAPIKey = "your-secret-key" // Fallback for local development
	}

	nodeServerURL := "http://localhost:3000/api/_internal/whatsapp/send"

	requestBody, err := json.Marshal(map[string]string{
		"to":      to,
		"message": message,
	})
	if err != nil {
		return fmt.Errorf("failed to marshal request body: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", nodeServerURL, bytes.NewBuffer(requestBody))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Internal-API-Key", internalAPIKey)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("received non-200 response from internal API: %s", resp.Status)
	}

	return nil
}
