# Trading System Test Automation Makefile

.PHONY: help install test test-frontend test-backend test-e2e test-all coverage lint format clean setup

# Default target
help:
	@echo "Available targets:"
	@echo "  install       - Install all dependencies"
	@echo "  test          - Run all tests"
	@echo "  test-frontend - Run frontend tests only"
	@echo "  test-backend  - Run backend tests only"
	@echo "  test-e2e      - Run end-to-end tests only"
	@echo "  test-all      - Run all tests including e2e"
	@echo "  coverage      - Generate test coverage reports"
	@echo "  lint          - Run linting on all code"
	@echo "  format        - Format all code"
	@echo "  clean         - Clean build artifacts and dependencies"
	@echo "  setup         - Initial project setup"

# Installation
install:
	@echo "Installing frontend dependencies..."
	cd frontend && npm install
	@echo "Installing backend dependencies..."
	cd backend && pip install -r requirements.txt
	@echo "Installing pre-commit hooks..."
	pre-commit install

# Frontend tests
test-frontend:
	@echo "Running frontend tests..."
	cd frontend && npm test -- --coverage --watchAll=false

test-frontend-watch:
	@echo "Running frontend tests in watch mode..."
	cd frontend && npm test

# Backend tests
test-backend:
	@echo "Running backend tests..."
	cd backend && python -m pytest tests/ -v --cov=app --cov-report=html --cov-report=term-missing

test-backend-unit:
	@echo "Running backend unit tests..."
	cd backend && python -m pytest tests/ -v -m "unit"

test-backend-integration:
	@echo "Running backend integration tests..."
	cd backend && python -m pytest tests/ -v -m "integration"

# E2E tests
test-e2e:
	@echo "Building Detox for e2e tests..."
	cd frontend && npx detox build
	@echo "Running e2e tests..."
	cd frontend && npx detox test

test-e2e-ios:
	@echo "Running e2e tests on iOS..."
	cd frontend && npx detox test --configuration ios.sim.debug

test-e2e-android:
	@echo "Running e2e tests on Android..."
	cd frontend && npx detox test --configuration android.emu.debug

# All tests
test: test-frontend test-backend

test-all: test-frontend test-backend test-e2e

# Coverage
coverage:
	@echo "Generating frontend coverage..."
	cd frontend && npm test -- --coverage --watchAll=false
	@echo "Generating backend coverage..."
	cd backend && python -m pytest tests/ --cov=app --cov-report=html --cov-report=term-missing
	@echo "Coverage reports generated in frontend/coverage/ and backend/htmlcov/"

# Linting
lint:
	@echo "Linting frontend code..."
	cd frontend && npm run lint
	@echo "Linting backend code..."
	cd backend && flake8 app/ tests/
	cd backend && mypy app/

lint-fix:
	@echo "Fixing frontend linting issues..."
	cd frontend && npm run lint:fix
	@echo "Fixing backend linting issues..."
	cd backend && black app/ tests/
	cd backend && isort app/ tests/

# Formatting
format:
	@echo "Formatting frontend code..."
	cd frontend && npm run format
	@echo "Formatting backend code..."
	cd backend && black app/ tests/
	cd backend && isort app/ tests/

# Clean
clean:
	@echo "Cleaning frontend..."
	cd frontend && rm -rf node_modules coverage .jest-cache
	@echo "Cleaning backend..."
	cd backend && rm -rf __pycache__ .pytest_cache htmlcov .coverage
	@echo "Cleaning completed"

# Setup
setup: install
	@echo "Setting up pre-commit hooks..."
	pre-commit install
	@echo "Setting up test databases..."
	cd backend && python -c "from app.db.database import engine; import asyncio; asyncio.run(engine.connect())"
	@echo "Setup completed"

# CI/CD
ci-test:
	@echo "Running CI test suite..."
	$(MAKE) test-frontend
	$(MAKE) test-backend
	@echo "CI tests completed"

ci-coverage:
	@echo "Running CI with coverage..."
	$(MAKE) coverage
	@echo "Coverage check completed"

# Development
dev-frontend:
	@echo "Starting frontend development server..."
	cd frontend && npm start

dev-backend:
	@echo "Starting backend development server..."
	cd backend && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Database
db-migrate:
	@echo "Running database migrations..."
	cd backend && alembic upgrade head

db-reset:
	@echo "Resetting database..."
	cd backend && alembic downgrade base
	cd backend && alembic upgrade head

# Security
security-check:
	@echo "Running security checks..."
	cd frontend && npm audit
	cd backend && safety check

# Performance
perf-test:
	@echo "Running performance tests..."
	cd backend && python -m pytest tests/performance/ -v

# Documentation
docs:
	@echo "Generating API documentation..."
	cd backend && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
	@echo "API docs available at http://localhost:8000/docs"