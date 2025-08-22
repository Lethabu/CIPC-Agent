// cmd/api/main.go
package main

import (
	"context"
	"log"
	"os"

	_ "github.com/cockroachdb/cockroach-go/v2/crdb/crdbpgxv5"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"go.temporal.io/sdk/client"

	"CIPC-Agent/repo"
	"CIPC-Agent/server/routes"
	"CIPC-Agent/server/routes/payments" // Import the payments routes package
)

func main() {
	// Initialize CockroachDB connection
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL environment variable not set")
	}

	dbpool, err := pgxpool.New(context.Background(), dbURL)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v\n", err)
	}
	defer dbpool.Close()

	// Ping the database to ensure connection is established
	err = dbpool.Ping(context.Background())
	if err != nil {
		log.Fatalf("Failed to ping database: %v\n", err)
	}
	log.Println("Successfully connected to CockroachDB!")

	// Initialize Temporal client
	temporalClient, err := client.Dial(client.Options{HostPort: "temporal:7233"})
	if err != nil {
		log.Fatalf("Unable to create Temporal client: %v", err)
	}
	defer temporalClient.Close()

	// Initialize repository
	cipcRepo := repo.Repo{Db: dbpool}

	r := gin.Default()
	r.POST("/whatsapp", routes.WhatsAppHandler)
	r.POST("/payments", payments.HandlePaymentRequest) // Add the new payments route
	r.GET("/healthz", func(c *gin.Context) { healthCheck(c, temporalClient, dbpool) })
	r.Run(":8080")
}

func healthCheck(c *gin.Context, temporalClient client.Client, dbpool *pgxpool.Pool) {
	// Check Temporal connectivity
	_, err := temporalClient.CheckHealth(context.Background(), &client.CheckHealthRequest{})
	if err != nil {
		c.JSON(500, gin.H{"status": "error", "temporal": "unreachable", "error": err.Error()})
		return
	}

	// Check CockroachDB connectivity
	err = dbpool.Ping(context.Background())
	if err != nil {
		c.JSON(500, gin.H{"status": "error", "cockroachdb": "unreachable", "error": err.Error()})
		return
	}

	c.JSON(200, gin.H{"status": "ok", "temporal": "reachable", "cockroachdb": "reachable"})
}
