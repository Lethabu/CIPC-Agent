package routes

import (
	"context" // Import context for database operations
	"log"     // Added for logging in dummy aisensy
	"net/http"
	"strings" // Import the strings package

	"github.com/gin-gonic/gin"

	"CIPC-Agent/repo"                   // Import the repo package
	"CIPC-Agent/server/routes/payments" // Import the payments package
)

// Global variable to hold the repository instance
var cipcRepo *repo.Repo

// SetRepo is a function to inject the repository dependency
func SetRepo(r *repo.Repo) {
	cipcRepo = r
}

// Dummy aisensy package for compilation
var aisensy struct {
	SendText func(to, message string)
}

func init() {
	aisensy.SendText = func(to, message string) {
		log.Printf("DUMMY AISENSY: Sending message to %s: %s\n", to, message)
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

	// Check for approval of PAYG filing
	if strings.Contains(normalizedBody, "yes") || strings.Contains(normalizedBody, "approve") {
		serviceType := "Annual Return Filing"
		amount := 199.00
		phoneNumber := msg.From

		// Increment PAYG filing count
		if cipcRepo != nil {
			err := cipcRepo.IncrementUserPaygFilingCount(context.Background(), phoneNumber)
			if err != nil {
				log.Printf("Error incrementing PAYG count for %s: %v\n", phoneNumber, err)
			} else {
				log.Printf("PAYG count incremented for %s\n", phoneNumber)
				// Check if it's their second filing to offer upgrade
				count, err := cipcRepo.GetUserPaygFilingCount(context.Background(), phoneNumber)
				if err != nil {
					log.Printf("Error getting PAYG count for %s: %v\n", phoneNumber, err)
				} else if count == 2 {
					aisensy.SendText(phoneNumber, "Congratulations on your second successful filing! Did you know you could save money with our Growth subscription (R899/mo) for unlimited filings? Reply 'upgrade' to learn more!")
				}
			}
		}

		payFastLink := payments.CreatePayFastLink(serviceType, amount, phoneNumber)
		aisensy.SendText(msg.From, "Great! Please use this link to complete your payment for the "+serviceType+" (R"+payments.Ftoa(amount)+"): "+payFastLink)
	} else if len(msg.Body) > 5 && len(msg.Body) < 15 {
		companyRegNo := msg.Body
		log.Printf("Attempting to get compliance score for company: %s\n", companyRegNo)

		complianceScore := "75%"
		isOverdue := true

		if isOverdue {
			aisensy.SendText(msg.From, "Your Annual Return is overdue. File it now for R199. Your CIPC Compliance Score is "+complianceScore+". Reply 'yes' to proceed with filing.")
		} else {
			aisensy.SendText(msg.From, "Your CIPC Compliance Score is "+complianceScore+". All good for now!")
		}
	} else {
		aisensy.SendText(msg.From, "Welcome to CIPC Agent! Reply with your company registration number to get your free score.")
	}

	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}
