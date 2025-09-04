# Dockerfile for the Go Temporal Worker

# ---- Build Stage ----
# Use the official Golang image to create a build environment.
# Using alpine for a smaller base image.
FROM golang:1.21-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy go.mod and go.sum files to leverage Docker's layer caching.
# This will prevent re-downloading dependencies if they haven't changed.
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the application source code
COPY . .

# Build the worker binary.
# CGO_ENABLED=0 creates a static binary, which is important for running in a minimal alpine container.
# -o specifies the output path for the compiled binary.
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o ./out/worker ./worker/main.go


# ---- Final Stage ----
# Use a minimal alpine image for the final production container.
# This reduces the attack surface and image size.
FROM alpine:latest

# It's a good practice to run as a non-root user.
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Set the working directory
WORKDIR /app

# Copy only the compiled binary from the builder stage.
COPY --from=builder /app/out/worker .

# Set the command to run when the container starts.
CMD ["./worker"]
