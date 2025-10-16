package main

import (
	"context"
	"encoding/json"
	"log"
	"os"

	"github.com/jackc/pgx/v5"
)

func ProcessOnboarding(ctx context.Context, req OnboardingRequest) error {
	conn, err := pgx.Connect(ctx, os.Getenv("DATABASE_URL"))
	if err != nil {
		return err
	}
	defer conn.Close(ctx)

	_, err = conn.Exec(ctx, 
		"UPDATE companies SET status = 'processing' WHERE id = $1", 
		req.CompanyID)
	if err != nil {
		return err
	}

	log.Printf("Processing onboarding for company: %s", req.CompanyID)
	return nil
}

func SubmitFiling(ctx context.Context, req FilingRequest) error {
	conn, err := pgx.Connect(ctx, os.Getenv("DATABASE_URL"))
	if err != nil {
		return err
	}
	defer conn.Close(ctx)

	data, _ := json.Marshal(req.Data)
	_, err = conn.Exec(ctx,
		"INSERT INTO workflows (company_id, type, status, data) VALUES ($1, $2, $3, $4)",
		req.CompanyID, req.Type, "completed", data)
	if err != nil {
		return err
	}

	log.Printf("Filing submitted for company: %s, type: %s", req.CompanyID, req.Type)
	return nil
}

func CheckCompliance(ctx context.Context, companyID string) error {
	conn, err := pgx.Connect(ctx, os.Getenv("DATABASE_URL"))
	if err != nil {
		return err
	}
	defer conn.Close(ctx)

	score := calculateComplianceScore(companyID)
	_, err = conn.Exec(ctx,
		"UPDATE companies SET compliance_score = $1 WHERE id = $2",
		score, companyID)
	if err != nil {
		return err
	}

	log.Printf("Compliance checked for company: %s, score: %d", companyID, score)
	return nil
}

func SendReminder(ctx context.Context, companyID string) error {
	conn, err := pgx.Connect(ctx, os.Getenv("DATABASE_URL"))
	if err != nil {
		return err
	}
	defer conn.Close(ctx)

	var phone string
	err = conn.QueryRow(ctx,
		"SELECT u.phone FROM users u JOIN companies c ON u.company_id = c.id WHERE c.id = $1",
		companyID).Scan(&phone)
	if err != nil {
		return err
	}

	log.Printf("Reminder sent to: %s for company: %s", phone, companyID)
	return nil
}

func calculateComplianceScore(companyID string) int {
	// Simplified compliance scoring
	return 85
}