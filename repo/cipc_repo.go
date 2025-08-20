package repo

import (
    "context"
    "github.com/google/uuid"
    "github.com/jackc/pgx/v5/pgxpool"
)

type Repo struct{ Db *pgxpool.Pool }

func (r *Repo) SaveFiling(ctx context.Context, filingID uuid.UUID, status string) error {
    _, err := r.db.Exec(ctx,
        `INSERT INTO filings (id, status, created_at) 
         VALUES ($1, $2, now()) ON CONFLICT (id) DO UPDATE SET status=$2`,
        filingID, status)
    return err
}