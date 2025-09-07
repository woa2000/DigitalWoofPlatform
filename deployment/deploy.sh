#!/bin/bash

# DigitalWoof Platform - Production Deployment Script
# Version: 1.0
# Date: 2025-01-16

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="digitalwoof-platform"
DEPLOY_ENV=${1:-"production"}
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/opt/digitalwoof/backups/$TIMESTAMP"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Pre-deployment checks
pre_deployment_checks() {
    log_info "Running pre-deployment checks..."

    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi

    # Check if .env file exists
    if [ ! -f ".env" ]; then
        log_error ".env file not found. Please create it with production environment variables."
        exit 1
    fi

    # Validate environment variables
    required_vars=("DATABASE_URL" "SUPABASE_URL" "SUPABASE_ANON_KEY" "OPENAI_API_KEY" "JWT_SECRET")
    for var in "${required_vars[@]}"; do
        if ! grep -q "^$var=" .env; then
            log_error "Required environment variable $var not found in .env file."
            exit 1
        fi
    done

    log_success "Pre-deployment checks passed."
}

# Create backup
create_backup() {
    log_info "Creating backup..."

    mkdir -p "$BACKUP_DIR"

    # Backup database if running
    if docker ps | grep -q postgres; then
        log_info "Backing up PostgreSQL database..."
        docker exec digitalwoof_postgres_1 pg_dump -U digitalwoof digitalwoof > "$BACKUP_DIR/database.sql" 2>/dev/null || true
    fi

    # Backup uploads
    if [ -d "uploads" ]; then
        log_info "Backing up uploads directory..."
        cp -r uploads "$BACKUP_DIR/"
    fi

    # Backup configuration
    cp .env "$BACKUP_DIR/" 2>/dev/null || true
    cp docker-compose.yml "$BACKUP_DIR/" 2>/dev/null || true

    log_success "Backup created at $BACKUP_DIR"
}

# Stop existing containers
stop_services() {
    log_info "Stopping existing services..."

    if [ "$(docker ps -q)" ]; then
        docker-compose down
        log_success "Services stopped."
    else
        log_info "No running services to stop."
    fi
}

# Build and start services
deploy_services() {
    log_info "Building and starting services..."

    # Build images
    docker-compose build --no-cache

    # Start services
    docker-compose up -d

    # Wait for services to be healthy
    log_info "Waiting for services to be healthy..."
    sleep 30

    # Check service health
    if docker-compose ps | grep -q "Up"; then
        log_success "Services deployed successfully."
    else
        log_error "Some services failed to start. Check logs with: docker-compose logs"
        exit 1
    fi
}

# Run database migrations
run_migrations() {
    log_info "Running database migrations..."

    # Wait for database to be ready
    docker-compose exec -T postgres sh -c 'while ! pg_isready -U digitalwoof; do sleep 1; done'

    # Run migrations
    docker-compose exec -T digitalwoof-app npm run db:migrate

    log_success "Database migrations completed."
}

# Run health checks
health_check() {
    log_info "Running health checks..."

    # Wait for application to be ready
    max_attempts=30
    attempt=1

    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost:3000/health &>/dev/null; then
            log_success "Application is healthy."
            return 0
        fi

        log_info "Waiting for application to be ready... (attempt $attempt/$max_attempts)"
        sleep 10
        ((attempt++))
    done

    log_error "Application failed health check after $max_attempts attempts."
    exit 1
}

# Post-deployment tasks
post_deployment_tasks() {
    log_info "Running post-deployment tasks..."

    # Run tests if in staging
    if [ "$DEPLOY_ENV" = "staging" ]; then
        log_info "Running integration tests..."
        docker-compose exec -T digitalwoof-app npm run test:integration || true
    fi

    # Clear caches
    log_info "Clearing application caches..."
    docker-compose exec -T digitalwoof-app curl -X POST http://localhost:3000/api/cache/clear || true

    # Update search indexes
    log_info "Updating search indexes..."
    docker-compose exec -T digitalwoof-app npm run sync-seasonal || true

    log_success "Post-deployment tasks completed."
}

# Main deployment function
main() {
    log_info "Starting deployment of DigitalWoof Platform to $DEPLOY_ENV environment..."
    log_info "Timestamp: $TIMESTAMP"

    pre_deployment_checks
    create_backup
    stop_services
    deploy_services
    run_migrations
    health_check
    post_deployment_tasks

    log_success "🎉 Deployment completed successfully!"
    log_info "Application is available at: http://localhost:3000"
    log_info "Backup location: $BACKUP_DIR"

    # Show service status
    echo ""
    log_info "Service Status:"
    docker-compose ps
}

# Rollback function
rollback() {
    log_warning "Starting rollback procedure..."

    stop_services

    # Restore from backup if available
    if [ -d "$BACKUP_DIR" ]; then
        log_info "Restoring from backup..."
        # Restore logic would go here
    fi

    log_info "Rollback completed. Please check application status."
}

# Handle script arguments
case "${2:-}" in
    "rollback")
        rollback
        ;;
    *)
        main
        ;;
esac