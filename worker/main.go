package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"

	"github.com/google/uuid"
	"go.temporal.io/sdk/client"
	"go.temporal.io/sdk/worker"

	"cipc-agent/temporal"
)

// Define the struct for the start workflow request
type StartWorkflowRequest struct {
	UserPhone     string `json:"userPhone"`
	CompanyRegNum string `json:"companyRegNum"`
	CompanyName   string `json:"companyName"`
	ServiceType   string `json:"serviceType"`
}

// PaymentRequest defines the structure for a payment request
type PaymentRequest struct {
	Provider string          `json:"provider"`
	Request  json.RawMessage `json:"request"`
}

// PaymentVerificationRequest defines the structure for a payment verification request
type PaymentVerificationRequest struct {
	Provider  string `json:"provider"`
	PaymentID string `json:"paymentId"`
}

// Global Temporal client to be used by the HTTP handler
var temporalClient client.Client

func startFilingWorkflowHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Only POST method is allowed", http.StatusMethodNotAllowed)
		return
	}

	var req StartWorkflowRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	workflowOptions := client.StartWorkflowOptions{
		ID:        "filing_" + uuid.New().String(),
		TaskQueue: "CIPC_TASK_QUEUE",
	}

	params := temporal.FilingWorkflowParams{
		UserPhone:     req.UserPhone,
		CompanyRegNum: req.CompanyRegNum,
		CompanyName:   req.CompanyName,
		ServiceType:   req.ServiceType,
	}

	we, err := temporalClient.ExecuteWorkflow(r.Context(), workflowOptions, temporal.FilingWorkflow, params)
	if err != nil {
		http.Error(w, "Unable to start workflow", http.StatusInternalServerError)
		log.Printf("Error starting workflow: %s", err)
		return
	}

	response := map[string]string{"workflowID": we.GetID(), "runID": we.GetRunID()}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)

	log.Printf("Started workflow. WorkflowID: %s, RunID: %s", we.GetID(), we.GetRunID())
}

func createPaymentHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Only POST method is allowed", http.StatusMethodNotAllowed)
		return
	}

	var req PaymentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	workflowOptions := client.StartWorkflowOptions{
		ID:        "payment_" + uuid.New().String(),
		TaskQueue: "CIPC_TASK_QUEUE",
	}

	var we client.WorkflowRun
	var err error

	switch req.Provider {
	case "payfast":
		var payfastReq temporal.PayFastPaymentRequest
		if err = json.Unmarshal(req.Request, &payfastReq); err != nil {
			http.Error(w, "Invalid PayFast request", http.StatusBadRequest)
			return
		}
		// In a real app, you'd get this from a secure config
		passphrase := "your-payfast-passphrase"
		we, err = temporalClient.ExecuteWorkflow(r.Context(), workflowOptions, temporal.CreatePayFastPaymentWorkflow, payfastReq, passphrase)

	case "paystack":
		var paystackReq temporal.PayStackPaymentRequest
		if err = json.Unmarshal(req.Request, &paystackReq); err != nil {
			http.Error(w, "Invalid PayStack request", http.StatusBadRequest)
			return
		}
		// In a real app, you'd get this from a secure config
		secretKey := "your-paystack-secret-key"
		we, err = temporalClient.ExecuteWorkflow(r.Context(), workflowOptions, temporal.CreatePayStackPaymentWorkflow, paystackReq, secretKey)

	case "yoco":
		var yocoReq temporal.YocoPaymentRequest
		if err = json.Unmarshal(req.Request, &yocoReq); err != nil {
			http.Error(w, "Invalid Yoco request", http.StatusBadRequest)
			return
		}
		// In a real app, you'd get this from a secure config
		secretKey := "your-yoco-secret-key"
		we, err = temporalClient.ExecuteWorkflow(r.Context(), workflowOptions, temporal.CreateYocoPaymentWorkflow, yocoReq, secretKey)

	default:
		http.Error(w, fmt.Sprintf("Provider %s not supported", req.Provider), http.StatusBadRequest)
		return
	}

	if err != nil {
		http.Error(w, "Unable to start payment workflow", http.StatusInternalServerError)
		log.Printf("Error starting payment workflow: %s", err)
		return
	}

	response := map[string]string{"workflowID": we.GetID(), "runID": we.GetRunID()}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)

	log.Printf("Started payment workflow. WorkflowID: %s, RunID: %s", we.GetID(), we.GetRunID())
}

func verifyPaymentHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Only POST method is allowed", http.StatusMethodNotAllowed)
		return
	}

	var req PaymentVerificationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	workflowOptions := client.StartWorkflowOptions{
		ID:        "verify_payment_" + uuid.New().String(),
		TaskQueue: "CIPC_TASK_QUEUE",
	}

	we, err := temporalClient.ExecuteWorkflow(r.Context(), workflowOptions, temporal.VerifyPaymentWorkflow, req)
	if err != nil {
		http.Error(w, "Unable to start verification workflow", http.StatusInternalServerError)
		log.Printf("Error starting verification workflow: %s", err)
		return
	}

	// The result of the workflow is the verification response itself.
	var result temporal.PaymentVerificationResponse
	if err := we.Get(r.Context(), &result); err != nil {
		http.Error(w, "Unable to get verification workflow result", http.StatusInternalServerError)
		log.Printf("Error getting verification workflow result: %s", err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)

	log.Printf("Started and completed verification workflow. WorkflowID: %s, RunID: %s", we.GetID(), we.GetRunID())
}

func processWebhookHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Only POST method is allowed", http.StatusMethodNotAllowed)
		return
	}

	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Failed to read request body", http.StatusInternalServerError)
		return
	}

	provider := r.URL.Query().Get("provider")
	if provider == "" {
		http.Error(w, "Missing provider query parameter", http.StatusBadRequest)
		return
	}

	wfID := "webhook_" + provider + "_" + uuid.New().String()
	workflowOptions := client.StartWorkflowOptions{
		ID:        wfID,
		TaskQueue: "CIPC_TASK_QUEUE",
	}

	req := temporal.WebhookProcessingRequest{
		Provider:  provider,
		Body:      body,
		Signature: r.Header.Get("X-Paystack-Signature"), // For PayStack
	}

	we, err := temporalClient.ExecuteWorkflow(r.Context(), workflowOptions, temporal.ProcessWebhookWorkflow, req)
	if err != nil {
		http.Error(w, "Unable to start webhook processing workflow", http.StatusInternalServerError)
		log.Printf("Error starting webhook processing workflow: %s", err)
		return
	}

	var result temporal.WebhookProcessingResponse
	if err := we.Get(r.Context(), &result); err != nil {
		http.Error(w, "Unable to get webhook processing result", http.StatusInternalServerError)
		log.Printf("Error getting webhook processing result: %s", err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func main() {
	var err error
	temporalClient, err = client.Dial(client.Options{
		Namespace: "cipc-agent-ns", // As per your masterbuild
	})
	if err != nil {
		log.Fatalln("Unable to create client", err)
	}
	defer temporalClient.Close()

	// Start the HTTP server in a goroutine
	go func() {
		http.HandleFunc("/start-filing-workflow", startFilingWorkflowHandler)
		http.HandleFunc("/create-payment", createPaymentHandler)
		http.HandleFunc("/verify-payment", verifyPaymentHandler)
		http.HandleFunc("/webhook", processWebhookHandler)
		log.Println("HTTP server listening on :8081")
		if err := http.ListenAndServe(":8081", nil); err != nil {
			log.Fatalf("HTTP server failed: %s", err)
		}
	}()

	w := worker.New(temporalClient, "CIPC_TASK_QUEUE", worker.Options{})

	// Register Onboarding Workflow
	w.RegisterWorkflow(temporal.OnboardingWorkflow)
	w.RegisterActivity(temporal.SendWhatsAppWelcomeActivity)
	w.RegisterActivity(temporal.KYCOnboarderActivity)
	w.RegisterActivity(temporal.ComplianceCopilotActivity)
	w.RegisterActivity(temporal.PromptSubscriptionActivity)

	// Register Filing Workflow (with the new OTP activity)
	w.RegisterWorkflow(temporal.FilingWorkflow)
	w.RegisterActivity(temporal.ValidateFilingDataActivity)
	w.RegisterActivity(temporal.RequestOTPActivity) // <-- New activity registered
	w.RegisterActivity(temporal.SubmitFilingToCIPCActivity)
	w.RegisterActivity(temporal.SendWhatsAppConfirmationActivity)

	// Register Payment Workflows & Activities
	w.RegisterWorkflow(temporal.CreatePayFastPaymentWorkflow)
	w.RegisterWorkflow(temporal.CreatePayStackPaymentWorkflow)
	w.RegisterWorkflow(temporal.CreateYocoPaymentWorkflow)
	w.RegisterWorkflow(temporal.VerifyPaymentWorkflow)
	w.RegisterWorkflow(temporal.ProcessWebhookWorkflow)
	w.RegisterActivity(temporal.CreatePayFastPaymentActivity)
	w.RegisterActivity(temporal.CreatePayStackPaymentActivity)
	w.RegisterActivity(temporal.CreateYocoPaymentActivity)
	w.RegisterActivity(temporal.VerifyPaymentActivity)
	w.RegisterActivity(temporal.ProcessWebhookActivity)

	// Register Payment Recovery Workflow
	w.RegisterWorkflow(temporal.PaymentRecoveryWorkflow)
	w.RegisterActivity(temporal.TransactionScanActivity)
	w.RegisterActivity(temporal.ReconciliationActivity)
	w.RegisterActivity(temporal.CipcEscalationActivity)
	w.RegisterActivity(temporal.RefundActivity)

	// Register Compliance Monitoring Workflow
	w.RegisterWorkflow(temporal.ComplianceMonitoringWorkflow)
	w.RegisterActivity(temporal.DeadlineCheckActivity)
	w.RegisterActivity(temporal.AlertSenderActivity)

	log.Println("Starting worker with all workflows and activities registered...")
	err = w.Run(worker.InterruptCh())
	if err != nil {
		log.Fatalln("Unable to start worker", err)
	}
}
