#!/bin/bash

# Development Tools Script for Points Strategy Planner
# This script runs development tools inside Docker containers - no host dependencies required!

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if the development container is running
if ! docker compose -f docker-compose.dev.yml ps | grep -q "planner-dev.*Up"; then
    print_warning "Development container is not running. Starting it now..."
    docker compose -f docker-compose.dev.yml up -d
    # Wait a bit for the container to be ready
    sleep 5
fi

# Function to run command in container
run_in_container() {
    local command="$1"
    local description="$2"
    
    print_status "Running: $description"
    if docker compose -f docker-compose.dev.yml exec planner-dev sh -c "$command"; then
        print_success "$description completed successfully"
    else
        print_error "$description failed"
        exit 1
    fi
}

# Main script logic
case "${1:-help}" in
    "lint")
        run_in_container "npm run lint" "ESLint code linting"
        ;;
    "lint:fix")
        run_in_container "npm run lint:fix" "ESLint auto-fix"
        ;;
    "format")
        run_in_container "npm run format" "Prettier code formatting"
        ;;
    "format:check")
        run_in_container "npm run format:check" "Prettier format checking"
        ;;
    "test")
        run_in_container "npm run test" "Unit tests"
        ;;
    "test:ui")
        run_in_container "npm run test:ui" "Test UI (requires port forwarding)"
        ;;
    "test:coverage")
        run_in_container "npm run test:coverage" "Test coverage report"
        ;;
    "analyze")
        run_in_container "npm run analyze" "Bundle analysis"
        ;;
    "dev")
        print_status "Starting development server..."
        docker compose -f docker-compose.dev.yml up --build
        ;;
    "build")
        print_status "Building production version..."
        docker compose up --build
        ;;
    "help"|*)
        echo "Points Strategy Planner - Development Tools"
        echo ""
        echo "Usage: $0 <command>"
        echo ""
        echo "Commands:"
        echo "  lint          - Run ESLint code linting"
        echo "  lint:fix      - Run ESLint with auto-fix"
        echo "  format        - Run Prettier code formatting"
        echo "  format:check  - Check Prettier formatting"
        echo "  test          - Run unit tests"
        echo "  test:ui       - Run test UI (requires port forwarding)"
        echo "  test:coverage - Run tests with coverage report"
        echo "  analyze       - Run bundle analysis"
        echo "  dev           - Start development server"
        echo "  build         - Build production version"
        echo "  help          - Show this help message"
        echo ""
        echo "All commands run inside Docker containers - no host dependencies required!"
        ;;
esac
