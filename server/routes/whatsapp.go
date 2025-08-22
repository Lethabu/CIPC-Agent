package routes

import (
	"log" // Added for logging in dummy aisensy
	"net/http"
	"strings" // Import the strings package

	"github.com/gin-gonic/gin"

	"CIPC-Agent/server/routes/payments" // Import the payments package
)

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
		// This is a simplified example. In a real system, you'd need to store
		// the pending filing details (service type, amount) associated with the user's session.
		// For now, we'll hardcode an example.
		serviceType := "Annual Return Filing"
		amount := 199.00
		phoneNumber := msg.From // Use the sender's number as the phone number for PayFast

		payFastLink := payments.CreatePayFastLink(serviceType, amount, phoneNumber)
		aisensy.SendText(msg.From, "Great! Please use this link to complete your payment for the "+serviceType+" (R"+payments.Ftoa(amount)+"): "+payFastLink)
	} else if len(msg.Body) > 5 && len(msg.Body) < 15 { // Assuming a company registration number is between 6 and 14 characters
		// Placeholder for CIPC lookup and compliance score logic
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
