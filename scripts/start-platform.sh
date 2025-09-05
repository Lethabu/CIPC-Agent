#!/bin/bash

# CIPC Agent Platform Startup Script
echo "🚀 Starting CIPC Agent Platform..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "📋 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please update .env with your actual API keys and configuration"
fi

# Build and start all services
echo "🔨 Building and starting services..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Check service health
echo "🏥 Checking service health..."

# Check PostgreSQL
if docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
    echo "✅ PostgreSQL is ready"
else
    echo "❌ PostgreSQL is not ready"
fi

# Check Node server
if curl -s http://localhost:3000/healthz > /dev/null; then
    echo "✅ Node.js server is ready"
else
    echo "❌ Node.js server is not ready"
fi

# Check Temporal UI
if curl -s http://localhost:8233 > /dev/null; then
    echo "✅ Temporal UI is ready"
else
    echo "❌ Temporal UI is not ready"
fi

echo ""
echo "🎉 CIPC Agent Platform is starting up!"
echo ""
echo "📊 Access Points:"
echo "   • API Server: http://localhost:3000"
echo "   • Health Check: http://localhost:3000/healthz"
echo "   • Temporal UI: http://localhost:8233"
echo ""
echo "🧪 Test the WhatsApp bot:"
echo "   curl -X POST http://localhost:3000/api/whatsapp/inbound \\"
echo "   -H \"Content-Type: application/json\" \\"
echo "   -d '{\"from\": \"+27123456789\", \"message\": \"hi\"}'"
echo ""
echo "📱 WhatsApp Integration:"
echo "   • Configure your webhook URL: http://your-domain.com/api/whatsapp/inbound"
echo "   • Update AISENSY_API_KEY in .env file"
echo ""
echo "💳 Payment Integration:"
echo "   • Update PayFast credentials in .env file"
echo "   • Test webhook: http://your-domain.com/api/payments/payfast/webhook"
echo ""
echo "🔍 Monitoring:"
echo "   • View logs: docker-compose logs -f"
echo "   • Stop platform: docker-compose down"
echo ""

# Show running containers
echo "🐳 Running containers:"
docker-compose ps