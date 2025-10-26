# Testing Guide

This document provides comprehensive guidance on testing the trading system, including setup, execution, and best practices.

## 🎯 Testing Philosophy

Our testing strategy follows the **Testing Pyramid** approach:
- **Unit Tests** (70%): Fast, isolated tests for individual components
- **Integration Tests** (20%): Tests for component interactions
- **E2E Tests** (10%): Full user workflow tests

## 🚀 Quick Start

### Prerequisites
```bash
# Install dependencies
make install

# Setup test databases
make setup
```

### Running Tests
```bash
# All tests
make test

# Frontend only
make test-frontend

# Backend only
make test-backend

# E2E tests
make test-e2e

# With coverage
make coverage
```

## 📱 Frontend Testing

### Component Testing

#### Example: FormulaCard Component
```typescript
describe('FormulaCard', () => {
  it('renders with correct props and data', () => {
    const { getByText } = render(
      <FormulaCard
        formula={mockFormula}
        onPress={mockOnPress}
        onSubscribe={mockOnSubscribe}
        onClone={mockOnClone}
      />
    );

    expect(getByText('Test Formula')).toBeTruthy();
    expect(getByText('MEDIUM')).toBeTruthy();
  });

  it('calls onPress when card is pressed', () => {
    const { getByText } = render(/* ... */);
    fireEvent.press(getByText('Test Formula'));
    expect(mockOnPress).toHaveBeenCalledWith(mockFormula);
  });
});
```

#### Testing User Interactions
```typescript
// Button presses
fireEvent.press(getByTestId('subscribe-button'));

// Text input
fireEvent.changeText(getByTestId('formula-name-input'), 'New Name');

// Scroll
fireEvent.scroll(getByTestId('scroll-view'), { y: 100 });

// Modal interactions
await waitFor(() => {
  expect(getByText('Modal Title')).toBeVisible();
});
```

#### Testing Navigation
```typescript
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

// Test navigation calls
expect(mockNavigation.navigate).toHaveBeenCalledWith('FormulaDetails', {
  formulaId: '123'
});
```

### Screen Testing

#### Example: Strategy Builder Screen
```typescript
describe('StrategyBuilderScreen', () => {
  it('navigates to formula studio when create button is pressed', async () => {
    const { getByTestId } = render(
      <StrategyBuilderScreen navigation={mockNavigation} />
    );

    fireEvent.press(getByTestId('create-formula-button'));
    
    expect(mockNavigation.navigate).toHaveBeenCalledWith('FormulaStudio');
  });

  it('displays error message when formula creation fails', async () => {
    // Mock API failure
    mockApi.createFormula.mockRejectedValue(new Error('Network error'));

    const { getByTestId, getByText } = render(/* ... */);
    
    fireEvent.press(getByTestId('save-formula-button'));
    
    await waitFor(() => {
      expect(getByText('Failed to create formula')).toBeVisible();
    });
  });
});
```

### E2E Testing with Detox

#### Example: Complete Trading Flow
```typescript
describe('Trading Flow E2E', () => {
  it('should complete full trading workflow', async () => {
    // Navigate to formula studio
    await element(by.id('formula-studio-button')).tap();
    
    // Add indicator block
    await element(by.id('add-block-button')).tap();
    await element(by.text('Indicator')).tap();
    await element(by.text('SMA')).tap();
    
    // Add condition block
    await element(by.id('add-block-button')).tap();
    await element(by.text('Condition')).tap();
    await element(by.text('Price > SMA')).tap();
    
    // Add action block
    await element(by.id('add-block-button')).tap();
    await element(by.text('Action')).tap();
    await element(by.text('Buy')).tap();
    
    // Save formula
    await element(by.id('save-formula-button')).tap();
    await element(by.id('formula-name-input')).typeText('Test Strategy');
    await element(by.id('confirm-save-button')).tap();
    
    // Execute trades
    await element(by.id('execute-trades-button')).tap();
    
    // Verify trades were created
    await expect(element(by.text('Trades executed successfully'))).toBeVisible();
  });
});
```

## 🖥️ Backend Testing

### API Testing

#### Example: Authentication API
```python
@pytest.mark.asyncio
class TestAuthAPI:
    async def test_register_user_success(self, client: AsyncClient):
        user_data = {
            "email": "newuser@example.com",
            "name": "New User",
            "password": "newpassword123"
        }
        
        response = await client.post("/api/v1/auth/register", json=user_data)
        
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == user_data["email"]
        assert "id" in data
        assert "hashed_password" not in data

    async def test_login_invalid_credentials(self, client: AsyncClient):
        login_data = {
            "username": "nonexistent@example.com",
            "password": "wrongpassword"
        }
        
        response = await client.post("/api/v1/auth/login", data=login_data)
        
        assert response.status_code == 401
        assert "incorrect email or password" in response.json()["detail"].lower()
```

#### Testing with Authentication
```python
async def test_protected_endpoint(self, client: AsyncClient, user_token: str):
    headers = {"Authorization": f"Bearer {user_token}"}
    response = await client.get("/api/v1/formulas/my", headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
```

### Service Testing

#### Example: Risk Management Service
```python
@pytest.mark.asyncio
class TestRiskManagementService:
    async def test_calculate_position_size_success(self, risk_service, mock_user, mock_formula):
        portfolio_value = 100000.0
        risk_percentage = 0.02
        current_price = 150.0
        
        position_size = await risk_service.calculate_position_size(
            user=mock_user,
            formula=mock_formula,
            portfolio_value=portfolio_value,
            risk_percentage=risk_percentage,
            current_price=current_price
        )
        
        expected_size = int((portfolio_value * risk_percentage) / current_price)
        assert position_size == expected_size

    async def test_check_risk_limits_exceeded(self, risk_service, mock_user):
        current_risk = 3000.0
        max_risk = 2000.0
        
        is_within_limits = await risk_service.check_risk_limits(
            user=mock_user,
            current_risk=current_risk,
            max_risk=max_risk
        )
        
        assert is_within_limits is False
```

### Database Testing

#### Example: Model Testing
```python
async def test_user_creation(self, db_session: AsyncSession):
    user = User(
        email="test@example.com",
        name="Test User",
        hashed_password=get_password_hash("password123")
    )
    
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    
    assert user.id is not None
    assert user.email == "test@example.com"
    assert user.is_admin is False
    assert user.is_banned is False
```

### E2E Testing

#### Example: Complete Trading Workflow
```python
@pytest.mark.e2e
async def test_complete_trading_flow(self, client: AsyncClient, user_token: str):
    # Create formula
    formula_data = {
        "name": "E2E Test Strategy",
        "description": "End-to-end test trading strategy",
        "blocks": [/* ... */],
        "risk_level": "medium",
        "is_public": True
    }
    
    response = await client.post("/api/v1/formulas", json=formula_data, 
                                headers={"Authorization": f"Bearer {user_token}"})
    assert response.status_code == 201
    formula = response.json()
    
    # Execute trades
    execution_data = {
        "formula_id": formula["id"],
        "broker_account_id": "test-broker-account-id",
        "symbols": ["AAPL", "GOOGL"]
    }
    
    response = await client.post("/api/v1/trades/execute", json=execution_data,
                                headers={"Authorization": f"Bearer {user_token}"})
    assert response.status_code == 200
    execution_result = response.json()
    
    # Verify trades were created
    assert execution_result["trades_created"] > 0
```

## 🧪 Test Data Management

### Frontend Test Data
```typescript
// Mock data factories
export const createMockFormula = (overrides = {}): Formula => ({
  id: '1',
  name: 'Test Formula',
  description: 'A test formula',
  blocks: [
    { id: '1', type: 'indicator', name: 'SMA', parameters: { period: 20 } }
  ],
  riskLevel: 'medium',
  isPublic: true,
  authorId: 'user1',
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
  ...overrides
});

// Mock API responses
export const mockApiResponses = {
  getFormulas: {
    data: [createMockFormula()],
    status: 200
  },
  createFormula: {
    data: createMockFormula({ id: '2' }),
    status: 201
  }
};
```

### Backend Test Data
```python
# Pytest fixtures
@pytest.fixture
async def test_user(db_session: AsyncSession) -> User:
    user = User(
        email="test@example.com",
        name="Test User",
        hashed_password=get_password_hash("testpassword")
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user

@pytest.fixture
async def test_formula(db_session: AsyncSession, test_user: User) -> Formula:
    formula = Formula(
        name="Test Formula",
        description="A test formula",
        blocks=[{"id": "1", "type": "indicator", "name": "SMA"}],
        risk_level="medium",
        author_id=test_user.id
    )
    db_session.add(formula)
    await db_session.commit()
    await db_session.refresh(formula)
    return formula
```

## 🔧 Test Configuration

### Jest Configuration
```javascript
// jest.config.js
module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testMatch: [
    '**/tests/**/*.test.{ts,tsx,js,jsx}',
    '**/__tests__/**/*.{ts,tsx,js,jsx}'
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx,js,jsx}',
    '!src/**/*.d.ts',
    '!src/**/index.{ts,tsx,js,jsx}'
  ],
  coverageThreshold: {
    global: {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95
    }
  }
};
```

### Pytest Configuration
```ini
# pytest.ini
[tool:pytest]
testpaths = tests
addopts = 
    --cov=app
    --cov-report=html:htmlcov
    --cov-report=term-missing
    --cov-fail-under=95
    --asyncio-mode=auto
    -v
    --tb=short
markers =
    unit: Unit tests
    integration: Integration tests
    e2e: End-to-end tests
    slow: Slow running tests
```

## 📊 Coverage Analysis

### Understanding Coverage Reports

#### Frontend Coverage
- **Statements**: 95%+ of code statements executed
- **Branches**: 95%+ of conditional branches tested
- **Functions**: 95%+ of functions called
- **Lines**: 95%+ of lines executed

#### Backend Coverage
- **API Endpoints**: All routes tested
- **Business Logic**: All service methods tested
- **Error Handling**: All error paths tested
- **Database Operations**: All CRUD operations tested

### Coverage Commands
```bash
# Generate coverage reports
make coverage

# View HTML coverage reports
open frontend/coverage/index.html
open backend/htmlcov/index.html

# Coverage for specific files
npm test -- --coverage --testPathPattern=FormulaCard
pytest tests/api/test_formulas.py --cov=app.api.formulas
```

## 🐛 Debugging Tests

### Frontend Debugging
```typescript
// Debug component rendering
const { debug } = render(<FormulaCard {...props} />);
debug(); // Prints component tree

// Debug specific elements
const { getByTestId } = render(<FormulaCard {...props} />);
console.log(getByTestId('formula-card').props);

// Debug async operations
await waitFor(() => {
  expect(getByText('Loading...')).not.toBeVisible();
}, { timeout: 5000 });
```

### Backend Debugging
```python
# Debug API responses
response = await client.post("/api/v1/formulas", json=data)
print(f"Status: {response.status_code}")
print(f"Response: {response.json()}")

# Debug database state
result = await db_session.execute(select(User).where(User.email == "test@example.com"))
user = result.scalar_one_or_none()
print(f"User: {user}")

# Debug async operations
import asyncio
await asyncio.sleep(0.1)  # Allow async operations to complete
```

## 🚀 Performance Testing

### Frontend Performance
```typescript
// Test component rendering performance
it('renders large list efficiently', () => {
  const largeFormulaList = Array(1000).fill(null).map((_, i) => 
    createMockFormula({ id: i.toString(), name: `Formula ${i}` })
  );

  const start = performance.now();
  render(<FormulaList formulas={largeFormulaList} />);
  const end = performance.now();

  expect(end - start).toBeLessThan(100); // Should render in <100ms
});
```

### Backend Performance
```python
# Test API response times
async def test_api_performance(self, client: AsyncClient):
    start_time = time.time()
    response = await client.get("/api/v1/formulas")
    end_time = time.time()
    
    assert response.status_code == 200
    assert (end_time - start_time) < 0.1  # Should respond in <100ms

# Test database query performance
async def test_database_performance(self, db_session: AsyncSession):
    start_time = time.time()
    result = await db_session.execute(select(Formula).limit(100))
    formulas = result.scalars().all()
    end_time = time.time()
    
    assert len(formulas) <= 100
    assert (end_time - start_time) < 0.05  # Should query in <50ms
```

## 🔒 Security Testing

### Authentication Testing
```python
# Test JWT token validation
async def test_invalid_token(self, client: AsyncClient):
    headers = {"Authorization": "Bearer invalid-token"}
    response = await client.get("/api/v1/formulas/my", headers=headers)
    assert response.status_code == 401

# Test password security
async def test_password_hashing(self):
    password = "testpassword123"
    hashed = get_password_hash(password)
    
    assert hashed != password
    assert verify_password(password, hashed)
    assert not verify_password("wrongpassword", hashed)
```

### Input Validation Testing
```python
# Test SQL injection prevention
async def test_sql_injection_prevention(self, client: AsyncClient, user_token: str):
    malicious_input = "'; DROP TABLE users; --"
    
    response = await client.post("/api/v1/formulas", 
        json={"name": malicious_input, "description": "test"},
        headers={"Authorization": f"Bearer {user_token}"})
    
    # Should either reject input or sanitize it
    assert response.status_code in [400, 201]
```

## 📝 Best Practices

### Test Organization
- **One test file per component/function**
- **Descriptive test names**
- **Group related tests with `describe`**
- **Use `beforeEach`/`afterEach` for setup/cleanup**

### Test Data
- **Use factories for test data**
- **Keep tests independent**
- **Clean up after tests**
- **Use realistic test data**

### Assertions
- **Test behavior, not implementation**
- **Use specific assertions**
- **Test edge cases**
- **Test error conditions**

### Mocking
- **Mock external dependencies**
- **Don't mock what you're testing**
- **Use realistic mock data**
- **Verify mock interactions**

## 🆘 Troubleshooting

### Common Issues

#### Frontend Tests
```bash
# Clear Jest cache
npm test -- --clearCache

# Reset Metro cache
npx react-native start --reset-cache

# Fix Detox build issues
npx detox clean-framework-cache
npx detox build-framework-cache
```

#### Backend Tests
```bash
# Reset test database
make db-reset

# Clear pytest cache
pytest --cache-clear

# Run specific test
pytest tests/api/test_formulas.py::TestFormulasAPI::test_create_formula_success -v
```

### Debug Commands
```bash
# Debug frontend tests
npm test -- --verbose --no-coverage

# Debug backend tests
pytest tests/ -v -s --tb=long

# Debug E2E tests
npx detox test --loglevel verbose
```

---

**Happy Testing! 🧪✨**