# Trading Formula Platform API

A comprehensive FastAPI backend for a trading formula platform with user authentication, broker integration, formula management, portfolio tracking, and real-time notifications.

## Features

- **Authentication & User Management**: JWT-based auth, KYC upload, user profiles
- **Broker Integration**: Connect/disconnect brokers, sync portfolio data
- **Formula Management**: CRUD operations, filtering, search, pagination
- **Subscription System**: Subscribe to formulas, access control
- **Portfolio Management**: Track positions, history, statistics
- **Review System**: Rate and review formulas
- **Real-time Notifications**: WebSocket support, trading signals

## Quick Start

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set up environment variables:
```bash
export DATABASE_URL="postgresql://user:password@localhost/trading_app"
export SECRET_KEY="your-secret-key-here"
export REDIS_URL="redis://localhost:6379"
```

3. Run the application:
```bash
uvicorn app.main:app --reload
```

4. Access the API documentation at `http://localhost:8000/docs`

## Router Setup Snippets

### 1. Authentication Router (`/auth`)

```python
from fastapi import APIRouter
from app.routers import auth

# Include in main app
app.include_router(auth.router)
```

**Key Endpoints:**
- `POST /auth/register` - User registration
- `POST /auth/login` - User login (returns JWT)
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user info
- `POST /auth/kyc/upload` - Upload KYC documents
- `GET /auth/kyc/status` - Get KYC status

**Example Usage:**
```python
# Register new user
response = await client.post("/auth/register", json={
    "email": "user@example.com",
    "username": "trader123",
    "password": "securepassword"
})

# Login
response = await client.post("/auth/login", json={
    "email": "user@example.com",
    "password": "securepassword"
})
token = response.json()["access_token"]
```

### 2. Broker Connection Router (`/broker`)

```python
from app.routers import broker

app.include_router(broker.router)
```

**Key Endpoints:**
- `POST /broker/connect` - Connect broker account
- `GET /broker/connections` - Get all connections
- `PUT /broker/connections/{id}/disconnect` - Disconnect broker
- `POST /broker/connections/{id}/sync` - Sync data from broker

**Example Usage:**
```python
# Connect broker
response = await client.post("/broker/connect", json={
    "broker_name": "Interactive Brokers",
    "account_id": "U123456",
    "access_token": "broker_token_here"
})
```

### 3. Formula Management Router (`/formulas`)

```python
from app.routers import formulas

app.include_router(formulas.router)
```

**Key Endpoints:**
- `GET /formulas/` - Get all formulas (with filters)
- `POST /formulas/` - Create new formula
- `GET /formulas/{id}` - Get specific formula
- `PUT /formulas/{id}` - Update formula
- `DELETE /formulas/{id}` - Delete formula

**Example Usage:**
```python
# Get formulas with filters
response = await client.get("/formulas/?category=technical&search=RSI&page=1&size=20")

# Create formula
response = await client.post("/formulas/", json={
    "name": "RSI Strategy",
    "description": "RSI-based trading strategy",
    "formula_code": "if rsi < 30: buy()",
    "category": "technical",
    "tags": ["rsi", "oversold"],
    "is_public": True
})
```

### 4. Subscription Router (`/subscriptions`)

```python
from app.routers import subscriptions

app.include_router(subscriptions.router)
```

**Key Endpoints:**
- `POST /subscriptions/` - Subscribe to formula
- `GET /subscriptions/` - Get my subscriptions
- `DELETE /subscriptions/{formula_id}` - Unsubscribe
- `POST /subscriptions/{formula_id}/toggle` - Toggle subscription

**Example Usage:**
```python
# Subscribe to formula
response = await client.post("/subscriptions/", json={
    "formula_id": 123
})

# Get my subscriptions
response = await client.get("/subscriptions/")
```

### 5. Portfolio Router (`/portfolio`)

```python
from app.routers import portfolio

app.include_router(portfolio.router)
```

**Key Endpoints:**
- `GET /portfolio/current` - Get current positions
- `GET /portfolio/history` - Get portfolio history
- `GET /portfolio/stats` - Get portfolio statistics
- `POST /portfolio/positions` - Add position
- `POST /portfolio/sync` - Sync with brokers

**Example Usage:**
```python
# Get portfolio stats
response = await client.get("/portfolio/stats")

# Add position
response = await client.post("/portfolio/positions", json={
    "symbol": "AAPL",
    "quantity": 100,
    "average_price": 150.00,
    "formula_id": 123
})
```

### 6. Review Router (`/reviews`)

```python
from app.routers import reviews

app.include_router(reviews.router)
```

**Key Endpoints:**
- `POST /reviews/` - Create review
- `GET /reviews/formula/{id}` - Get formula reviews
- `PUT /reviews/{id}` - Update review
- `DELETE /reviews/{id}` - Delete review

**Example Usage:**
```python
# Create review
response = await client.post("/reviews/", json={
    "formula_id": 123,
    "rating": 5,
    "comment": "Great strategy, very profitable!"
})
```

### 7. Notification Router (`/notifications`)

```python
from app.routers import notifications

app.include_router(notifications.router)
```

**Key Endpoints:**
- `GET /notifications/` - Get notifications
- `PUT /notifications/{id}/read` - Mark as read
- `WebSocket /notifications/ws/{user_id}` - Real-time updates

**Example Usage:**
```python
# Get notifications
response = await client.get("/notifications/?page=1&size=20")

# WebSocket connection
import websockets
async with websockets.connect("ws://localhost:8000/notifications/ws/123") as websocket:
    async for message in websocket:
        data = json.loads(message)
        print(f"Received: {data}")
```

## Pydantic Schemas

### Authentication Schemas

```python
class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str = Field(..., min_length=8)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class KYCUpload(BaseModel):
    documents: List[KYCDocument]
```

### Formula Schemas

```python
class FormulaCreate(BaseModel):
    name: str
    description: Optional[str] = None
    formula_code: str
    category: Optional[str] = None
    tags: Optional[List[str]] = []
    is_public: bool = True

class FormulaResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    formula_code: str
    performance_score: float
    total_subscribers: int
    created_at: datetime
    # ... other fields
```

### Portfolio Schemas

```python
class PortfolioStats(BaseModel):
    total_value: float
    total_unrealized_pnl: float
    total_realized_pnl: float
    total_return_percentage: float
    positions_count: int

class PortfolioHistory(BaseModel):
    date: datetime
    total_value: float
    unrealized_pnl: float
    realized_pnl: float
```

## Database Models

The application uses SQLAlchemy models for:

- **User**: User accounts and profiles
- **BrokerConnection**: Connected broker accounts
- **Formula**: Trading formulas and strategies
- **Subscription**: User subscriptions to formulas
- **Portfolio**: Portfolio positions and history
- **Review**: Formula reviews and ratings
- **Notification**: User notifications

## WebSocket Support

Real-time notifications are supported via WebSocket connections:

```javascript
// Client-side WebSocket connection
const ws = new WebSocket('ws://localhost:8000/notifications/ws/123');

ws.onmessage = function(event) {
    const data = JSON.parse(event.data);
    if (data.type === 'trade_signal') {
        console.log('New trading signal:', data.data);
    }
};
```

## Environment Variables

Create a `.env` file with:

```env
DATABASE_URL=postgresql://user:password@localhost/trading_app
SECRET_KEY=your-secret-key-here
REDIS_URL=redis://localhost:6379
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
S3_BUCKET=trading-app-kyc
BROKER_API_BASE_URL=https://api.broker.com
```

## API Documentation

Once running, visit:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## Testing

```bash
# Run tests
pytest

# Run with coverage
pytest --cov=app
```

## Deployment

```bash
# Production deployment
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## License

MIT License