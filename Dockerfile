# Use a multi-stage build to create a lean final image

# 1. Builder Stage: Compile TypeScript to JavaScript
FROM node:18-alpine AS builder
WORKDIR /app

# Copy all package.json and lock files
COPY package.json package-lock.json* ./

# Copy project-specific package files
COPY client/package.json ./client/
COPY server/package.json ./server/

# Install all dependencies
RUN npm install

# Copy the rest of the source code
COPY . .

# Compile the TypeScript server code
RUN cd server && npm install && ../node_modules/.bin/tsc

# 2. Production Stage: Create the final, lightweight image
FROM node:18-alpine
WORKDIR /app

# Create a non-root user for security
RUN addgroup -S app && adduser -S app -G app
USER app

# Copy compiled code and production dependencies from the builder stage
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server/package.json ./server/
COPY --from=builder /app/server/index.js ./server/

# Expose the application port
EXPOSE 3000

# Set the command to run the application
CMD ["node", "server/dist/index.js"]
