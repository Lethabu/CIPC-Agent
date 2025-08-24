package routes

import (
	"bytes"
	"context" // Import context for database operations
	"encoding/json"
	"log"      // Added for logging in dummy aisensy
	"net/http" // Import os to get environment variables
	"strings"  // Import the strings package

	"github.com/gin-gonic/gin"

	"CIPC-Agent/repo" // Import the repo package
	payments "CIPC-Agent/server/routes/payments"
)

// Global variable to hold the repository instance
var cipcRepo *repo.Repo

// NOTE: Functions like CreatePayFastLink and Ftoa are part of the same 'routes' package
// and do not need to be imported as a separate sub-package.

// SetRepo is a function to inject the repository dependency
func SetRepo(r *repo.Repo) {
	cipcRepo = r
}

// NOTE: This 'aisensy' implementation is a DUMMY for development purposes in the Go backend.
// The actual WhatsApp message sending is handled by the TypeScript service located at `server/services/whatsappService.ts`.
// For production, a proper integration strategy (e.g., internal API calls to the TypeScript service or a message queue)
// should be implemented to ensure messages are actually sent to users.
var aisensy struct {
	SendText func(to, message string)
}

func init() {
	aisensy.SendText = func(to, message string) {
		payload := map[string]string{
			"to":      to,
			"message": message,
		}
		jsonPayload, err := json.Marshal(payload)
		if err != nil {
			log.Printf("Error marshalling WhatsApp message payload: %v\n", err)
			return
		}

		// TODO: Make this URL configurable via environment variable
		resp, err := http.Post("http://localhost:5000/api/whatsapp/send", "application/json", bytes.NewBuffer(jsonPayload))
		if err != nil {
			log.Printf("Error sending message to TypeScript service: %v\n", err)
			return
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			log.Printf("TypeScript service returned non-OK status: %d\n", resp.StatusCode)
			return
		}

		log.Printf("Message successfully sent to TypeScript service for %s\n", to)
	}
}

func WhatsAppHandler(c *gin.Context) {
	var msg struct {
		From string `json:"from"`
		Body string `json:"body"` // Added to capture the message body
	}
	if err := c.BindJSON(&msg); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Log the incoming message for debugging
	log.Printf("Received message from %s: %s\n", msg.From, msg.Body)

	// Normalize the message body for easier comparison
	normalizedBody := strings.ToLower(strings.TrimSpace(msg.Body))

	// Constants for WhatsApp messages and logic
	const (
		AnnualReturnServiceType = "Annual Return Filing"
		AnnualReturnAmount      = 199.00
		GrowthSubscriptionCost  = 899.00
		MinCompanyRegNoLength   = 5
		MaxCompanyRegNoLength   = 15
		ComplianceScoreDefault  = "75%"
	)

	// Check for approval of PAYG filing
	if strings.Contains(normalizedBody, "yes") || strings.Contains(normalizedBody, "approve") {
		serviceType := AnnualReturnServiceType
		amount := AnnualReturnAmount
		phoneNumber := msg.From

		// Increment PAYG filing count
		if cipcRepo != nil {
			err := cipcRepo.IncrementUserPaygFilingCount(context.Background(), phoneNumber)
			if err != nil {
				log.Printf("Error incrementing PAYG count for %s: %v\n", phoneNumber, err)
				aisensy.SendText(msg.From, "Apologies, there was an issue processing your request. Please try again later.")
				c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Failed to update PAYG count"})
				return
			}
			log.Printf("PAYG count incremented for %s\n", phoneNumber)

			// Check if it's their second filing to offer upgrade
			count, err := cipcRepo.GetUserPaygFilingCount(context.Background(), phoneNumber)
			if err != nil {
				log.Printf("Error getting PAYG count for %s: %v\n", phoneNumber, err)
				aisensy.SendText(msg.From, "Apologies, there was an issue retrieving your filing count. Please try again later.")
				c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Failed to retrieve PAYG count"})
				return
			} else if count == 2 {
				aisensy.SendText(phoneNumber, "Congratulations on your second successful filing! Did you know you could save money with our Growth subscription (R"+payments.Ftoa(GrowthSubscriptionCost)+"/mo) for unlimited filings? Reply 'upgrade' to learn more!")
			}
		}

		payFastLink := payments.CreatePayFastLink(serviceType, amount, phoneNumber)
		aisensy.SendText(msg.From, "Great! Please use this link to complete your payment for the "+serviceType+" (R"+payments.Ftoa(amount)+"): "+payFastLink)
	} else if len(msg.Body) > MinCompanyRegNoLength && len(msg.Body) < MaxCompanyRegNoLength {
		companyRegNo := msg.Body
		log.Printf("Attempting to get compliance score for company: %s\n", companyRegNo)

		complianceScore := ComplianceScoreDefault
		isOverdue := true // This should ideally come from a real compliance check

		if isOverdue {
			aisensy.SendText(msg.From, "Your Annual Return is overdue. File it now for R"+payments.Ftoa(AnnualReturnAmount)+". Your CIPC Compliance Score is "+complianceScore+". Reply 'yes' to proceed with filing.")
		} else {
			aisensy.SendText(msg.From, "Your CIPC Compliance Score is "+complianceScore+". All good for now!")
		}
	} else {
		aisensy.SendText(msg.From, "Welcome to CIPC Agent! Reply with your company registration number to get your free score.")
	}

	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}
