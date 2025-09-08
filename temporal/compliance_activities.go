package temporal

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	_ "github.com/jackc/pgx/v5/stdlib"
)

// CalculateComplianceHealthScoreActivity calculates the compliance health score for a user
func CalculateComplianceHealthScoreActivity(ctx context.Context, userID string) (int, error) {
	db, err := sql.Open("pgx", getDatabaseURL())
	if err != nil {
		return 0, err
	}
	defer db.Close()

	// Get user's compliance deadlines and their status
	query := `
		SELECT deadline_type, status, due_date 
		FROM compliance_deadlines 
		WHERE user_id = $1
	`
	rows, err := db.QueryContext(ctx, query, userID)
	if err != nil {
		return 0, err
	}
	defer rows.Close()

	score := 100
	for rows.Next() {
		var deadlineType, status string
		var dueDate time.Time
		
		err := rows.Scan(&deadlineType, &status, &dueDate)
		if err != nil {
			continue
		}

		// Reduce score based on overdue items
		if status == "overdue" {
			switch deadlineType {
			case "annual_return":
				score -= 30
			case "beneficial_ownership":
				score -= 20
			case "afs_submission":
				score -= 25
			case "tax_clearance":
				score -= 35
			}
		}

		// Reduce score for items due soon (within 30 days) that aren't completed
		if status == "pending" && time.Until(dueDate) < 30*24*time.Hour {
			score -= 10
		}
	}

	// Ensure score doesn't go below 0
	if score < 0 {
		score = 0
	}

	// Store the calculated score
	_, err = db.ExecContext(ctx, `
		INSERT INTO compliance_scores (user_id, overall_score, last_calculated)
		VALUES ($1, $2, NOW())
		ON CONFLICT (user_id) 
		DO UPDATE SET overall_score = $2, last_calculated = NOW()
	`, userID, score)

	return score, err
}

// CheckUpcomingDeadlinesActivity checks for deadlines in the next 30 days
func CheckUpcomingDeadlinesActivity(ctx context.Context, userID string) ([]string, error) {
	db, err := sql.Open("pgx", getDatabaseURL())
	if err != nil {
		return nil, err
	}
	defer db.Close()

	query := `
		SELECT deadline_type, due_date 
		FROM compliance_deadlines 
		WHERE user_id = $1 
		AND status = 'pending'
		AND due_date BETWEEN NOW() AND NOW() + INTERVAL '30 days'
		ORDER BY due_date ASC
	`
	
	rows, err := db.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var deadlines []string
	for rows.Next() {
		var deadlineType string
		var dueDate time.Time
		
		err := rows.Scan(&deadlineType, &dueDate)
		if err != nil {
			continue
		}
		
		deadlines = append(deadlines, fmt.Sprintf("%s:%s", deadlineType, dueDate.Format("2006-01-02")))
	}

	return deadlines, nil
}

// SendComplianceAlertActivity sends WhatsApp alerts for compliance issues
func SendComplianceAlertActivity(ctx context.Context, userID string, score int, deadlines []string) error {
	// Get user's phone number
	db, err := sql.Open("pgx", getDatabaseURL())
	if err != nil {
		return err
	}
	defer db.Close()

	var phoneNumber string
	err = db.QueryRowContext(ctx, "SELECT phone_number FROM users WHERE id = $1", userID).Scan(&phoneNumber)
	if err != nil {
		return err
	}

	// Construct alert message
	message := fmt.Sprintf("🚨 *Compliance Alert*\n\nYour compliance health score: *%d/100*", score)
	
	if len(deadlines) > 0 {
		message += "\n\n📅 *Upcoming Deadlines:*"
		for _, deadline := range deadlines {
			message += fmt.Sprintf("\n• %s", deadline)
		}
		message += "\n\nReply 'AUTOMATE' to enable automatic filing for eligible items."
	}

	// Send via WhatsApp API
	return sendWhatsAppMessage(phoneNumber, message)
}

// CheckAutomationEligibilityActivity checks if a deadline can be automated
func CheckAutomationEligibilityActivity(ctx context.Context, userID, deadline string) (bool, error) {
	db, err := sql.Open("pgx", getDatabaseURL())
	if err != nil {
		return false, err
	}
	defer db.Close()

	// Check user's subscription tier and automation preferences
	var subscriptionTier string
	err = db.QueryRowContext(ctx, "SELECT subscription_tier FROM users WHERE id = $1", userID).Scan(&subscriptionTier)
	if err != nil {
		return false, err
	}

	// Only Growth and Enterprise tiers get automation
	if subscriptionTier != "growth" && subscriptionTier != "enterprise" {
		return false, nil
	}

	// Check if user has required documents and information
	// This would integrate with document verification system
	return true, nil
}

// UpdateComplianceMetricsActivity updates business metrics
func UpdateComplianceMetricsActivity(ctx context.Context, userID string, score int) error {
	// Call metrics service API
	metricsData := map[string]interface{}{
		"userId": userID,
		"featureName": "compliance_check",
		"sessionDuration": 30,
	}

	jsonData, _ := json.Marshal(metricsData)
	
	req, err := http.NewRequestWithContext(ctx, "POST", getNodeServerURL()+"/api/metrics/usage", 
		bytes.NewBuffer(jsonData))
	if err != nil {
		return err
	}
	
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+getInternalAPIKey())

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("Failed to update metrics: %v", err)
		return nil // Don't fail the workflow for metrics
	}
	defer resp.Body.Close()

	return nil
}

// GetActiveUsersActivity gets all active users for scheduled compliance checks
func GetActiveUsersActivity(ctx context.Context) ([]string, error) {
	db, err := sql.Open("pgx", getDatabaseURL())
	if err != nil {
		return nil, err
	}
	defer db.Close()

	query := `
		SELECT id FROM users 
		WHERE subscription_status = 'active'
		AND consent_given = true
	`
	
	rows, err := db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []string
	for rows.Next() {
		var userID string
		if err := rows.Scan(&userID); err != nil {
			continue
		}
		users = append(users, userID)
	}

	return users, nil
}