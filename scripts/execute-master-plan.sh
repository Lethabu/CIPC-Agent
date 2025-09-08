#!/bin/bash

# CIPC Agent Master Plan Executor
# This script orchestrates the 12-month execution plan

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
CURRENT_MONTH=${1:-1}
PLAN_FILE="MASTER_EXECUTION_PLAN.md"
METRICS_ENDPOINT="http://localhost:3000/api/metrics/dashboard"

echo -e "${BLUE}🚀 CIPC Agent Master Plan Executor${NC}"
echo -e "${BLUE}====================================${NC}"
echo ""

# Function to display current status
show_status() {
    echo -e "${YELLOW}📊 Current Status (Month $CURRENT_MONTH):${NC}"
    
    # Check if metrics API is available
    if curl -s $METRICS_ENDPOINT > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Metrics API: Online${NC}"
        
        # Fetch current metrics
        METRICS=$(curl -s $METRICS_ENDPOINT)
        echo -e "${BLUE}📈 North Star Metrics:${NC}"
        echo "$METRICS" | jq -r '
            "  • Weekly Automated Filings: " + (.data.weeklyAutomatedFilings | tostring) +
            "\n  • LTV/CAC Ratio: " + (.data.ltvCacRatio | tostring) +
            "\n  • Monthly Recurring Revenue: R" + (.data.monthlyRecurringRevenue | tostring)
        ' 2>/dev/null || echo "  • Metrics parsing error"
    else
        echo -e "${RED}❌ Metrics API: Offline${NC}"
    fi
    
    echo ""
}

# Function to execute specific month
execute_month() {
    local month=$1
    local script_name="scripts/month${month}"
    
    echo -e "${BLUE}🎯 Executing Month $month Plan...${NC}"
    
    case $month in
        1)
            script_name="${script_name}-foundation.sh"
            echo -e "${YELLOW}Focus: Foundation & Metrics Infrastructure${NC}"
            ;;
        2)
            script_name="${script_name}-growth.sh"
            echo -e "${YELLOW}Focus: Lead Scout & Viral Growth Engine${NC}"
            ;;
        3)
            script_name="${script_name}-enterprise.sh"
            echo -e "${YELLOW}Focus: Enterprise Pilot & Subscription Optimization${NC}"
            ;;
        4)
            script_name="${script_name}-mobile.sh"
            echo -e "${YELLOW}Focus: Mobile App & User Experience${NC}"
            ;;
        5)
            script_name="${script_name}-ai-enhancement.sh"
            echo -e "${YELLOW}Focus: AI Compliance Copilot Enhancement${NC}"
            ;;
        6)
            script_name="${script_name}-partnerships.sh"
            echo -e "${YELLOW}Focus: Strategic Partnerships & Channel Development${NC}"
            ;;
        7)
            script_name="${script_name}-series-a.sh"
            echo -e "${YELLOW}Focus: Series A Fundraising (Part 1)${NC}"
            ;;
        8)
            script_name="${script_name}-series-a-close.sh"
            echo -e "${YELLOW}Focus: Series A Fundraising (Part 2)${NC}"
            ;;
        9)
            script_name="${script_name}-scaling.sh"
            echo -e "${YELLOW}Focus: Team Scaling & Product Expansion (Part 1)${NC}"
            ;;
        10)
            script_name="${script_name}-scaling-complete.sh"
            echo -e "${YELLOW}Focus: Team Scaling & Product Expansion (Part 2)${NC}"
            ;;
        11)
            script_name="${script_name}-expansion.sh"
            echo -e "${YELLOW}Focus: Pan-African Expansion (Part 1)${NC}"
            ;;
        12)
            script_name="${script_name}-dominance.sh"
            echo -e "${YELLOW}Focus: Market Dominance & Exit Preparation${NC}"
            ;;
        *)
            echo -e "${RED}❌ Invalid month: $month${NC}"
            return 1
            ;;
    esac
    
    if [ -f "$script_name" ]; then
        echo -e "${GREEN}✅ Found execution script: $script_name${NC}"
        chmod +x "$script_name"
        
        # Execute the month's script
        if ./"$script_name"; then
            echo -e "${GREEN}✅ Month $month execution completed successfully!${NC}"
            
            # Update progress tracking
            update_progress $month
        else
            echo -e "${RED}❌ Month $month execution failed!${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠️  Script not found: $script_name${NC}"
        echo -e "${BLUE}📋 Creating placeholder script...${NC}"
        create_month_script $month "$script_name"
    fi
}

# Function to create placeholder scripts for future months
create_month_script() {
    local month=$1
    local script_name=$2
    
    cat > "$script_name" << EOF
#!/bin/bash

# Month $month Execution Script
# Auto-generated placeholder - customize as needed

set -e

echo "🚀 Starting Month $month execution..."

# TODO: Implement Month $month specific tasks
echo "⚠️  Month $month script needs implementation"
echo "📋 Refer to MASTER_EXECUTION_PLAN.md for detailed requirements"

# Placeholder success
echo "✅ Month $month placeholder completed"
EOF
    
    chmod +x "$script_name"
    echo -e "${GREEN}✅ Created placeholder script: $script_name${NC}"
}

# Function to update progress tracking
update_progress() {
    local month=$1
    local progress_file="EXECUTION_PROGRESS.md"
    
    if [ ! -f "$progress_file" ]; then
        cat > "$progress_file" << 'EOF'
# CIPC Agent Execution Progress

## Monthly Completion Status
EOF
    fi
    
    # Add completion marker
    echo "- [x] Month $month: $(date '+%Y-%m-%d %H:%M:%S')" >> "$progress_file"
    
    echo -e "${GREEN}📝 Progress updated in $progress_file${NC}"
}

# Function to show help
show_help() {
    echo -e "${BLUE}CIPC Agent Master Plan Executor${NC}"
    echo ""
    echo "Usage: $0 [month_number] [options]"
    echo ""
    echo "Options:"
    echo "  1-12          Execute specific month (1-12)"
    echo "  status        Show current status and metrics"
    echo "  plan          Display the master execution plan"
    echo "  progress      Show execution progress"
    echo "  help          Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 1          # Execute Month 1 (Foundation)"
    echo "  $0 status     # Show current metrics and status"
    echo "  $0 plan       # Display master plan overview"
    echo ""
}

# Function to show master plan overview
show_plan() {
    if [ -f "$PLAN_FILE" ]; then
        echo -e "${BLUE}📋 Master Execution Plan Overview:${NC}"
        echo ""
        grep -E "^### \*\*Month|^**Objective**" "$PLAN_FILE" | head -24
    else
        echo -e "${RED}❌ Master plan file not found: $PLAN_FILE${NC}"
    fi
}

# Function to show progress
show_progress() {
    local progress_file="EXECUTION_PROGRESS.md"
    
    if [ -f "$progress_file" ]; then
        echo -e "${BLUE}📈 Execution Progress:${NC}"
        cat "$progress_file"
    else
        echo -e "${YELLOW}⚠️  No progress file found. Start executing months to track progress.${NC}"
    fi
}

# Main execution logic
case $CURRENT_MONTH in
    status)
        show_status
        ;;
    plan)
        show_plan
        ;;
    progress)
        show_progress
        ;;
    help|--help|-h)
        show_help
        ;;
    [1-9]|1[0-2])
        show_status
        execute_month $CURRENT_MONTH
        ;;
    *)
        echo -e "${RED}❌ Invalid option: $CURRENT_MONTH${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}🎯 Master Plan Executor completed!${NC}"
echo -e "${BLUE}📋 Next steps: Check MASTER_EXECUTION_PLAN.md for detailed requirements${NC}"