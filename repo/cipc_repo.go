package repo

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

// Add a new struct for User to hold user-related data
type User struct {
	WhatsappNumber  string
	PaygFilingCount int
}

type Repo struct{ Db *pgxpool.Pool }

func (r *Repo) SaveFiling(ctx context.Context, filingID uuid.UUID, status string) error {
	_, err := r.Db.Exec(ctx,
		`INSERT INTO filings (id, status, created_at) 
         VALUES ($1, $2, now()) ON CONFLICT (id) DO UPDATE SET status=$2`,
		filingID, status)
	return err
}

// IncrementUserPaygFilingCount increments the PAYG filing count for a given WhatsApp number.
// If the user doesn't exist, it creates a new entry with count 1.
func (r *Repo) IncrementUserPaygFilingCount(ctx context.Context, whatsappNumber string) error {
	_, err := r.Db.Exec(ctx,
		`INSERT INTO users (whatsapp_number, payg_filing_count, created_at)
         VALUES ($1, 1, now())
         ON CONFLICT (whatsapp_number) DO UPDATE SET payg_filing_count = users.payg_filing_count + 1`,
		whatsappNumber)
	return err
}

// GetUserPaygFilingCount retrieves the PAYG filing count for a given WhatsApp number.
// Returns 0 if the user is not found.
func (r *Repo) GetUserPaygFilingCount(ctx context.Context, whatsappNumber string) (int, error) {
	var count int
	err := r.Db.QueryRow(ctx,
		`SELECT payg_filing_count FROM users WHERE whatsapp_number = $1`,
		whatsappNumber).Scan(&count)
	if err != nil {
		// If no rows are found, it means the user doesn't exist yet, return 0
		if err.Error() == "no rows in result set" {
			return 0, nil
		}
		return 0, err
	}
	return count, nil
}
