package temporal

import (
	"bytes"
	"context"
	"crypto/hmac"
	"crypto/md5"
	"crypto/sha512"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"sort"
	"time"

	"go.temporal.io/sdk/activity"
)

// PayFastPaymentRequest defines the structure for a payment request to PayFast.
// It's exported so it can be used in other packages.
type PayFastPaymentRequest struct {
	MerchantID   string
	MerchantKey  string
	ReturnURL    string
	CancelURL    string
	NotifyURL    string
	NameFirst    string
	NameLast     string
	EmailAddress string
	CellNumber   string
	MPaymentID   string
	Amount       string
	ItemName     string
	ItemDesc     string
}

// PayFastPaymentResponse defines the structure for a payment response from PayFast.
// It's exported for use in other packages.
type PayFastPaymentResponse struct {
	Success     bool   `json:"success"`
	PaymentID   string `json:"paymentId,omitempty"`
	CheckoutURL string `json:"checkoutUrl,omitempty"`
	Reference   string `json:"reference,omitempty"`
	Error       string `json:"error,omitempty"`
	Provider    string `json:"provider"`
}

// PayStackPaymentRequest defines the structure for a payment request to PayStack.
type PayStackPaymentRequest struct {
	Email    string                 `json:"email"`
	Amount   int                    `json:"amount"` // in kobo
	Currency string                 `json:"currency"`
	Reference string                 `json:"reference"`
	Callback string                 `json:"callback_url"`
	Metadata map[string]interface{} `json:"metadata"`
}

// PayStackPaymentResponse defines the structure for a payment response from PayStack.
type PayStackPaymentResponse struct {
	Success     bool   `json:"success"`
	PaymentID   string `json:"paymentId,omitempty"`
	CheckoutURL string `json:"checkoutUrl,omitempty"`
	Reference   string `json:"reference,omitempty"`
	Error       string `json:"error,omitempty"`
	Provider    string `json:"provider"`
}

// YocoPaymentRequest defines the structure for a payment request to Yoco.
type YocoPaymentRequest struct {
	Amount     int                    `json:"amount"` // in cents
	Currency   string                 `json:"currency"`
	SuccessURL string                 `json:"successUrl"`
	CancelURL  string                 `json:"cancelUrl"`
	FailureURL string                 `json:"failureUrl"`
	Metadata   map[string]interface{} `json:"metadata"`
}

// YocoPaymentResponse defines the structure for a payment response from Yoco.
type YocoPaymentResponse struct {
	Success     bool   `json:"success"`
	PaymentID   string `json:"paymentId,omitempty"`
	CheckoutURL string `json:"checkoutUrl,omitempty"`
	Reference   string `json:"reference,omitempty"`
	Error       string `json:"error,omitempty"`
	Provider    string `json:"provider"`
}

// PaymentVerificationRequest defines the structure for a payment verification request.
type PaymentVerificationRequest struct {
	Provider  string `json:"provider"`
	PaymentID string `json:"paymentId"`
}

// PaymentVerificationResponse defines the structure for a payment verification response.
type PaymentVerificationResponse struct {
	ID            string    `json:"id"`
	Status        string    `json:"status"`
	Amount        int       `json:"amount"`
	Currency      string    `json:"currency"`
	Reference     string    `json:"reference"`
	Provider      string    `json:"provider"`
	PaidAt        time.Time `json:"paidAt,omitempty"`
	FailureReason string    `json:"failureReason,omitempty"`
}

// WebhookProcessingRequest defines the structure for a webhook processing request.
type WebhookProcessingRequest struct {
	Provider  string          `json:"provider"`
	Body      json.RawMessage `json:"body"`
	Signature string          `json:"signature"`
}

// WebhookProcessingResponse defines the structure for a webhook processing response.
type WebhookProcessingResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message,omitempty"`
}


// generatePayFastSignature creates an MD5 hash for the payment request as required by PayFast.
func generatePayFastSignature(data url.Values, passphrase string) string {
	// PayFast requires the parameters to be sorted by key.
	keys := make([]string, 0, len(data))
	for k := range data {
		keys = append(keys, k)
	}
	sort.Strings(keys)

	var signatureStr string
	for _, k := range keys {
		signatureStr += fmt.Sprintf("%s=%s&", k, data.Get(k))
	}
	signatureStr = signatureStr[:len(signatureStr)-1] // Remove trailing '&'

	if passphrase != "" {
		signatureStr += "&passphrase=" + url.QueryEscape(passphrase)
	}

	return fmt.Sprintf("%x", md5.Sum([]byte(signatureStr)))
}

// CreatePayFastPaymentActivity is a Temporal activity that creates a payment link for PayFast.
func CreatePayFastPaymentActivity(ctx context.Context, request PayFastPaymentRequest, passphrase string) (*PayFastPaymentResponse, error) {
	logger := activity.GetLogger(ctx)
	logger.Info("Creating PayFast payment", "reference", request.MPaymentID)

	// In a real-world scenario, you would pull your Merchant ID, Key, and Passphrase
	// from a secure configuration store or environment variables.
	// For this example, we'll assume they are passed in or configured on the worker.

	// Convert the struct to URL-encoded values.
	paymentData := url.Values{
		"merchant_id":      {request.MerchantID},
		"merchant_key":       {request.MerchantKey},
		"return_url":       {request.ReturnURL},
		"cancel_url":       {request.CancelURL},
		"notify_url":       {request.NotifyURL},
		"name_first":       {request.NameFirst},
		"name_last":        {request.NameLast},
		"email_address":    {request.EmailAddress},
		"cell_number":      {request.CellNumber},
		"m_payment_id":     {request.MPaymentID},
		"amount":           {request.Amount},
		"item_name":        {request.ItemName},
		"item_description": {request.ItemDesc},
	}

	signature := generatePayFastSignature(paymentData, passphrase)
	paymentData.Set("signature", signature)

	checkoutURL := fmt.Sprintf("https://www.payfast.co.za/eng/process?%s", paymentData.Encode())

	return &PayFastPaymentResponse{
		Success:     true,
		PaymentID:   request.MPaymentID,
		CheckoutURL: checkoutURL,
		Reference:   request.MPaymentID,
		Provider:    "payfast",
	}, nil
}


// CreatePayStackPaymentActivity is a Temporal activity that creates a payment link for PayStack.
func CreatePayStackPaymentActivity(ctx context.Context, request PayStackPaymentRequest, secretKey string) (*PayStackPaymentResponse, error) {
	logger := activity.GetLogger(ctx)
	logger.Info("Creating PayStack payment", "reference", request.Reference)

	requestBody, err := json.Marshal(request)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", "https://api.paystack.co/transaction/initialize", bytes.NewBuffer(requestBody))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+secretKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("PayStack API request failed with status: %s", resp.Status)
	}

	var paystackResponse struct {
		Status  bool   `json:"status"`
		Message string `json:"message"`
		Data    struct {
			AuthorizationURL string `json:"authorization_url"`
			AccessCode       string `json:"access_code"`
			Reference        string `json:"reference"`
		} `json:"data"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&paystackResponse); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	if !paystackResponse.Status {
		return &PayStackPaymentResponse{
			Success:  false,
			Error:    paystackResponse.Message,
			Provider: "paystack",
		}, nil
	}

	return &PayStackPaymentResponse{
		Success:     true,
		PaymentID:   paystackResponse.Data.Reference,
		CheckoutURL: paystackResponse.Data.AuthorizationURL,
		Reference:   paystackResponse.Data.Reference,
		Provider:    "paystack",
	}, nil
}

// CreateYocoPaymentActivity is a Temporal activity that creates a payment link for Yoco.
func CreateYocoPaymentActivity(ctx context.Context, request YocoPaymentRequest, secretKey string) (*YocoPaymentResponse, error) {
	logger := activity.GetLogger(ctx)
	logger.Info("Creating Yoco payment", "amount", request.Amount)

	requestBody, err := json.Marshal(request)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", "https://online.yoco.com/v1/checkout/", bytes.NewBuffer(requestBody))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+secretKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated {
		return nil, fmt.Errorf("Yoco API request failed with status: %s", resp.Status)
	}

	var yocoResponse struct {
		ID          string `json:"id"`
		RedirectURL string `json:"redirectUrl"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&yocoResponse); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	return &YocoPaymentResponse{
		Success:     true,
		PaymentID:   yocoResponse.ID,
		CheckoutURL: yocoResponse.RedirectURL,
		Reference:   yocoResponse.ID, // Yoco uses its own ID as the reference
		Provider:    "yoco",
	}, nil
}

func getSecretKey(provider string) string {
	// In a real app, you would fetch these from a secure config store
	secrets := map[string]string{
		"paystack": "your-paystack-secret-key",
		"yoco":     "your-yoco-secret-key",
		// PayFast does not use a secret key for verification in the same way
	}
	return secrets[provider]
}


// VerifyPaymentActivity is a Temporal activity that verifies a payment with the specified provider.
func VerifyPaymentActivity(ctx context.Context, request PaymentVerificationRequest) (*PaymentVerificationResponse, error) {
	logger := activity.GetLogger(ctx)
	logger.Info("Verifying payment", "provider", request.Provider, "paymentId", request.PaymentID)

	var verificationURL string
	var secretKey string

	switch request.Provider {
	case "paystack":
		verificationURL = fmt.Sprintf("https://api.paystack.co/transaction/verify/%s", request.PaymentID)
		secretKey = getSecretKey(request.Provider)
	case "yoco":
		// Yoco verification is a bit different, it uses a charge ID
		verificationURL = fmt.Sprintf("https://online.yoco.com/v1/charges/%s", request.PaymentID)
		secretKey = getSecretKey(request.Provider)
	default:
		return nil, fmt.Errorf("verification not supported for provider: %s", request.Provider)
	}

	req, err := http.NewRequestWithContext(ctx, "GET", verificationURL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create verification request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+secretKey)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send verification request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("payment verification failed with status: %s", resp.Status)
	}

	// We need a flexible way to parse different response structures
	var data map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		return nil, fmt.Errorf("failed to decode verification response: %w", err)
	}

	// Normalize the response from each provider
	return normalizeVerificationResponse(request.Provider, data)
}

func normalizeVerificationResponse(provider string, data map[string]interface{}) (*PaymentVerificationResponse, error) {
	var response PaymentVerificationResponse
	response.Provider = provider

	switch provider {
	case "paystack":
		responseData := data["data"].(map[string]interface{})
		response.ID = responseData["id"].(string)
		response.Status = responseData["status"].(string)
		response.Amount = int(responseData["amount"].(float64))
		response.Currency = responseData["currency"].(string)
		response.Reference = responseData["reference"].(string)
		if paidAt, err := time.Parse(time.RFC3339, responseData["paid_at"].(string)); err == nil {
			response.PaidAt = paidAt
		}
	case "yoco":
		response.ID = data["id"].(string)
		response.Status = data["status"].(string) // e.g., "succeeded", "failed"
		response.Amount = int(data["amount"].(float64))
		response.Currency = data["currency"].(string)
		// Yoco doesn't provide a reference in the same way, so we use the ID
		response.Reference = data["id"].(string)
		if errorMessage, ok := data["errorMessage"].(string); ok {
			response.FailureReason = errorMessage
		}
		if createdAt, err := time.Parse(time.RFC3339, data["created"].(string)); err == nil {
			response.PaidAt = createdAt // Assuming created time is close enough to paid time
		}
	default:
		return nil, fmt.Errorf("normalization not supported for provider: %s", provider)
	}

	return &response, nil
}

// ProcessWebhookActivity is a Temporal activity that processes an incoming webhook.
func ProcessWebhookActivity(ctx context.Context, request WebhookProcessingRequest) (*WebhookProcessingResponse, error) {
	logger := activity.GetLogger(ctx)
	logger.Info("Processing webhook", "provider", request.Provider)

	switch request.Provider {
	case "paystack":
		// PayStack uses HMAC-SHA512 to sign webhooks
		secretKey := getSecretKey(request.Provider)
		mac := hmac.New(sha512.New, []byte(secretKey))
		mac.Write(request.Body)
		expectedMAC := mac.Sum(nil)

		if !hmac.Equal([]byte(request.Signature), expectedMAC) {
			return &WebhookProcessingResponse{Success: false, Message: "Invalid signature"}, nil
		}

		// The webhook is valid, so now we can process the event.
		// In a real application, you would have a more sophisticated event handling system.
		var event map[string]interface{}
		if err := json.Unmarshal(request.Body, &event); err != nil {
			return &WebhookProcessingResponse{Success: false, Message: "Failed to parse webhook body"}, nil
		}

		// Example: Log the event type
		if eventType, ok := event["event"].(string); ok {
			logger.Info("Received PayStack event", "eventType", eventType)
		}

	case "yoco":
		// Yoco webhooks don't have a signature, but they should be sent over HTTPS.
		// You should also verify the source IP address if possible.
		var event map[string]interface{}
		if err := json.Unmarshal(request.Body, &event); err != nil {
			return &WebhookProcessingResponse{Success: false, Message: "Failed to parse webhook body"}, nil
		}

		// Example: Log the event type
		if eventType, ok := event["type"].(string); ok {
			logger.Info("Received Yoco event", "eventType", eventType)
		}

	default:
		return &WebhookProcessingResponse{Success: false, Message: fmt.Sprintf("Webhook processing not supported for provider: %s", request.Provider)}, nil
	}

	return &WebhookProcessingResponse{Success: true, Message: "Webhook processed successfully"}, nil
}
