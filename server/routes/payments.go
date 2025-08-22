package routes

import (
	"net/http"
	"strconv" // Import the strconv package

	"github.com/gin-gonic/gin"
)

// PaymentRequest represents the structure for a payment request
type PaymentRequest struct {
	ServiceType string  `json:"service_type"`
	Amount      float64 `json:"amount"`
	PhoneNumber string  `json:"phone_number"`
	Provider    string  `json:"provider"`
}

// CreatePayFastLink is a dummy function to simulate PayFast link creation
func CreatePayFastLink(serviceType string, amount float64, phoneNumber string) string {
	// In a real application, this would integrate with the PayFast API
	// to generate a unique payment link based on serviceType, amount, and phoneNumber.
	// For now, we'll return a placeholder link.
	return "https://www.payfast.co.za/eng/process?amount=" + strconv.FormatFloat(amount, 'f', 2, 64) + "&item_name=" + serviceType + "&custom_str1=" + phoneNumber
}

// Ftoa converts a float64 to its string representation.
// This is a helper function for the dummy CreatePayFastLink.
func Ftoa(f float64) string {
	return strconv.FormatFloat(f, 'f', 2, 64)
}

// HandlePaymentRequest handles incoming payment requests
func HandlePaymentRequest(c *gin.Context) {
	var req PaymentRequest
	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Determine payment provider
	var paymentLink string
	switch req.Provider {
	case "payfast":
		paymentLink = CreatePayFastLink(req.ServiceType, req.Amount, req.PhoneNumber)
	case "yoco":
		// Placeholder for Yoco integration
		paymentLink = "https://yoco.com/pay?amount=" + Ftoa(req.Amount)
	case "paystack":
		// Placeholder for Paystack integration
		paymentLink = "https://paystack.com/pay?amount=" + Ftoa(req.Amount)
	case "ozow":
		// Placeholder for Ozow integration
		paymentLink = "https://ozow.co.za/pay?amount=" + Ftoa(req.Amount)
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payment provider"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "payment_link": paymentLink})
}
