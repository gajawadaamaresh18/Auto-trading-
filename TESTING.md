# Auto Trading App - Comprehensive Test Suite Documentation

## Overview

This document provides comprehensive documentation for the automated test suite of the Auto Trading App, covering both frontend (React Native) and backend (FastAPI) testing strategies.

## Test Architecture

### Frontend Testing Stack
- **Jest**: JavaScript testing framework
- **React Native Testing Library**: Component testing utilities
- **Detox**: End-to-end testing framework
- **Coverage**: Istanbul for code coverage reporting

### Backend Testing Stack
- **Pytest**: Python testing framework
- **FastAPI TestClient**: API endpoint testing
- **SQLAlchemy**: Database testing utilities
- **Coverage.py**: Python code coverage reporting

## Test Categories

### 1. Unit Tests
- **Purpose**: Test individual components/functions in isolation
- **Coverage**: All pure functions, components, and service methods
- **Mocking**: External dependencies and API calls

### 2. Integration Tests
- **Purpose**: Test component interactions and API endpoints
- **Coverage**: Service layer integration, database operations
- **Mocking**: External services only

### 3. End-to-End Tests
- **Purpose**: Test complete user workflows
- **Coverage**: Critical user journeys and edge cases
- **Mocking**: Minimal mocking, real app behavior

## Frontend Test Structure

```
frontend/
├── src/
│   ├── __tests__/
│   │   ├── setup.ts                 # Test setup and mocks
│   │   ├── components/              # Component unit tests
│   │   │   ├── FormulaCard.test.tsx
│   │   │   ├── RiskWidget.test.tsx
│   │   │   ├── BlockEditor.test.tsx
│   │   │   └── ...
│   │   ├── screens/                 # Screen integration tests
│   │   │   ├── MarketplaceScreen.test.tsx
│   │   │   ├── FormulaStudio.test.tsx
│   │   │   └── ...
│   │   ├── services/                # Service unit tests
│   │   │   ├── api.test.ts
│   │   │   ├── auth.test.ts
│   │   │   └── ...
│   │   └── hooks/                   # Custom hook tests
│   │       ├── useAuth.test.ts
│   │       ├── useTrading.test.ts
│   │       └── ...
│   └── ...
├── e2e/
│   ├── tests/
│   │   └── app.e2e.js              # E2E test suite
│   ├── config.json                 # Detox configuration
│   └── path-builder.js             # Artifact path builder
├── jest.config.js                  # Jest configuration
└── .detoxrc.js                     # Detox configuration
```

## Backend Test Structure

```
backend/
├── tests/
│   ├── conftest.py                 # Pytest fixtures and configuration
│   ├── test_api/                   # API endpoint tests
│   │   ├── test_endpoints.py
│   │   ├── test_auth.py
│   │   └── ...
│   ├── test_services/              # Service layer tests
│   │   ├── test_formula_engine.py
│   │   ├── test_broker_service.py
│   │   └── ...
│   ├── test_models/                 # Model tests
│   │   ├── test_user.py
│   │   ├── test_formula.py
│   │   └── ...
│   ├── test_integrations/           # Integration tests
│   │   ├── test_broker_integration.py
│   │   └── ...
│   └── test_performance/           # Performance tests
│       ├── test_formula_engine_performance.py
│       └── ...
├── pytest.ini                     # Pytest configuration
└── ...
```

## Test Execution

### Frontend Tests

#### Unit Tests
```bash
# Run all unit tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- FormulaCard.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="RiskWidget"
```

#### E2E Tests
```bash
# Run E2E tests on iOS simulator
npm run test:e2e:ios

# Run E2E tests on Android emulator
npm run test:e2e:android

# Run E2E tests in CI mode
npm run test:e2e:ci

# Build and run E2E tests
npm run test:e2e:build
```

### Backend Tests

#### Unit Tests
```bash
# Run all tests
pytest

# Run tests with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_services/test_formula_engine.py

# Run tests matching pattern
pytest -k "test_formula_engine"

# Run tests in parallel
pytest -n auto

# Run tests with verbose output
pytest -v
```

#### Integration Tests
```bash
# Run API tests
pytest tests/test_api/

# Run integration tests
pytest tests/test_integrations/

# Run with database
pytest tests/test_api/ --cov=app
```

## Test Coverage Requirements

### Frontend Coverage Thresholds
- **Global**: 80% (branches, functions, lines, statements)
- **Components**: 85% (critical UI components)
- **Services**: 90% (API and business logic)

### Backend Coverage Thresholds
- **Global**: 80% (branches, functions, lines, statements)
- **Services**: 90% (business logic and API endpoints)
- **Models**: 85% (data models and validation)

## Key Test Scenarios

### Frontend Test Scenarios

#### Component Tests
1. **FormulaCard Component**
   - Renders formula information correctly
   - Handles subscription states
   - Shows performance metrics
   - Handles edge cases (missing data, long names)
   - Accessibility compliance

2. **RiskWidget Component**
   - Calculates risk metrics correctly
   - Shows risk warnings
   - Handles user interactions
   - Validates input values
   - Supports different risk profiles

3. **BlockEditor Component**
   - Renders drag-and-drop interface
   - Handles block connections
   - Validates formula logic
   - Serializes to JSON
   - Generates pseudocode

#### Screen Tests
1. **MarketplaceScreen**
   - Loads and displays formulas
   - Handles filtering and sorting
   - Manages pagination
   - Handles search functionality
   - Shows loading and error states

2. **FormulaStudioScreen**
   - Renders visual builder
   - Handles block creation and editing
   - Manages formula saving
   - Shows preview functionality
   - Handles validation errors

#### E2E Test Scenarios
1. **User Onboarding**
   - Complete onboarding flow
   - Skip onboarding option
   - Progress tracking

2. **Authentication**
   - User registration
   - User login
   - Error handling

3. **Broker Connection**
   - Connect Zerodha broker
   - Handle connection errors
   - Disconnect broker

4. **Formula Management**
   - Browse and filter formulas
   - Subscribe to formulas
   - Create custom formulas
   - Edit existing formulas

5. **Trade Execution**
   - Auto execution mode
   - Manual approval mode
   - Paper vs live trading
   - Risk management

### Backend Test Scenarios

#### Service Tests
1. **FormulaEngine Service**
   - Formula evaluation
   - Signal generation
   - Trade execution
   - Risk management
   - Error handling

2. **BrokerValidationService**
   - Credential validation
   - Connection testing
   - Error handling
   - Caching

3. **MarketDataService**
   - Real-time data fetching
   - Historical data retrieval
   - Technical indicator calculation
   - Data source management

#### API Tests
1. **Authentication Endpoints**
   - User registration
   - User login
   - Token validation
   - Logout

2. **Formula Endpoints**
   - CRUD operations
   - Filtering and sorting
   - Search functionality
   - Authorization

3. **Subscription Endpoints**
   - Create subscription
   - Update settings
   - Cancel subscription
   - Access control

4. **Trade Endpoints**
   - Trade creation
   - Approval workflow
   - Status updates
   - Risk validation

#### Integration Tests
1. **Broker Integration**
   - Zerodha API integration
   - Angel One API integration
   - Upstox API integration
   - Error handling

2. **Database Integration**
   - CRUD operations
   - Relationship management
   - Transaction handling
   - Migration testing

## Test Data Management

### Frontend Test Data
- Mock API responses
- Sample user data
- Test formulas and subscriptions
- Mock broker data

### Backend Test Data
- Database fixtures
- Mock broker responses
- Sample market data
- Test user accounts

## Performance Testing

### Frontend Performance
- Component render time
- List scrolling performance
- Memory usage
- Bundle size analysis

### Backend Performance
- API response times
- Database query performance
- Formula evaluation speed
- Memory usage

## Error Handling Tests

### Frontend Error Handling
- Network errors
- API failures
- Component crashes
- User input validation

### Backend Error Handling
- Database errors
- Broker API failures
- Validation errors
- System exceptions

## Security Testing

### Frontend Security
- Input sanitization
- XSS prevention
- CSRF protection
- Secure storage

### Backend Security
- SQL injection prevention
- Authentication bypass
- Authorization checks
- Data encryption

## CI/CD Integration

### GitHub Actions Pipeline
1. **Frontend Tests**
   - Linting and type checking
   - Unit tests with coverage
   - E2E tests
   - Build verification

2. **Backend Tests**
   - Linting and type checking
   - Unit tests with coverage
   - Integration tests
   - Security scanning

3. **Deployment**
   - Docker image building
   - Container registry push
   - Staging deployment
   - Production deployment

## Test Maintenance

### Regular Updates
- Update test data
- Refresh mocks
- Update coverage thresholds
- Review test performance

### Test Review Process
- Code review for new tests
- Test coverage analysis
- Performance impact assessment
- Documentation updates

## Troubleshooting

### Common Issues
1. **Test Flakiness**
   - Increase timeouts
   - Add retry logic
   - Improve test isolation

2. **Coverage Gaps**
   - Identify uncovered code
   - Add missing tests
   - Update coverage thresholds

3. **Performance Issues**
   - Optimize test execution
   - Parallel test running
   - Test data optimization

## Best Practices

### Test Writing
- Write clear, descriptive test names
- Use proper assertions
- Mock external dependencies
- Test edge cases
- Maintain test data

### Test Organization
- Group related tests
- Use proper fixtures
- Avoid test interdependencies
- Keep tests focused

### Test Execution
- Run tests frequently
- Monitor test performance
- Maintain test stability
- Update test documentation

## Conclusion

This comprehensive test suite ensures the Auto Trading App maintains high quality, reliability, and performance across all components and user workflows. The combination of unit, integration, and E2E tests provides complete coverage of the application's functionality while maintaining fast feedback loops for developers.
