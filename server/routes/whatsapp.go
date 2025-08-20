package routes

import (
    "net/http"
    "github.com/gin-gonic/gin"
    "log" // Added for logging in dummy aisensy
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
    // AISensy sends JSON like { "from": "2782...", "body": "Hi" }
    var msg struct{ From string `json:"from"` }
    if err := c.BindJSON(&msg); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // Send welcome via AISensy REST
    aisensy.SendText(msg.From, "Welcome to CIPC Agent! Reply with your company registration number to get your free score.")
    c.JSON(http.StatusOK, gin.H{"status": "ok"})
}