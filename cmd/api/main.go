// cmd/api/main.go
package main

import (
	"context"
	"log"
	"os"

	_ "github.com/cockroachdb/cockroach-go/v2/crdb/crdbpgxv5"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv" // Import godotenv
	"go.temporal.io/sdk/client"

	"CIPC-Agent/repo"
	whatsapp_routes "CIPC-Agent/server/routes"
	payments_routes "CIPC-Agent/server/routes/payments"
)

func main() {
	// Load environment variables from .env.local
	err := godotenv.Load(".env.local")
	if err != nil {
		log.Printf("Error loading .env.local file, using system environment variables: %v", err)
	}

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
	whatsapp_routes.SetRepo(&cipcRepo) // Inject the repository into the whatsapp_routes package
	r.POST("/whatsapp", whatsapp_routes.WhatsAppHandler)
	r.POST("/payments", payments_routes.HandlePaymentRequest) // Add the new payments route
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
