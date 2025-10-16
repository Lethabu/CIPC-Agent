package main

import (
	"context"
	"log"
	"os"
	"github.com/jackc/pgx/v5"
)

func ScoutLeads(ctx context.Context) error {
	conn, err := pgx.Connect(ctx, os.Getenv("DATABASE_URL"))
	if err != nil {
		return err
	}
	defer conn.Close(ctx)

	// Mock lead scouting
	leads := []struct {
		Name   string
		RegNum string
		Phone  string
	}{
		{"New Tech PTY", "2024/111111/07", "+27123456789"},
		{"Innovation Co", "2024/222222/07", "+27987654321"},
	}

	for _, lead := range leads {
		_, err = conn.Exec(ctx,
			"INSERT INTO companies (name, registration_number, status) VALUES ($1, $2, $3)",
			lead.Name, lead.RegNum, "prospect")
		if err != nil {
			log.Printf("Error inserting lead: %v", err)
			continue
		}

		log.Printf("New lead scouted: %s (%s)", lead.Name, lead.RegNum)
	}

	return nil
}

func CalculateMetrics(ctx context.Context) error {
	conn, err := pgx.Connect(ctx, os.Getenv("DATABASE_URL"))
	if err != nil {
		return err
	}
	defer conn.Close(ctx)

	// Calculate platform metrics
	var totalCompanies, activeCompanies, avgScore int
	
	err = conn.QueryRow(ctx, "SELECT COUNT(*) FROM companies").Scan(&totalCompanies)
	if err != nil {
		return err
	}

	err = conn.QueryRow(ctx, "SELECT COUNT(*) FROM companies WHERE status = 'active'").Scan(&activeCompanies)
	if err != nil {
		return err
	}

	err = conn.QueryRow(ctx, "SELECT COALESCE(AVG(compliance_score), 0) FROM companies").Scan(&avgScore)
	if err != nil {
		return err
	}

	log.Printf("Platform Metrics - Total: %d, Active: %d, Avg Score: %d", 
		totalCompanies, activeCompanies, avgScore)

	return nil
}