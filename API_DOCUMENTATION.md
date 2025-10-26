# Auto Trading API Documentation

## Overview
This API provides endpoints for managing trade signals, formula subscriptions, and trade execution in an auto-trading platform.

## Base URL
```
http://localhost:3001/api
```

## Authentication
Currently, the API uses a simple User-ID header for identification. In production, implement proper JWT or OAuth authentication.

## Endpoints

### Trade Management

#### GET /trades
Retrieve all trade signals.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "trade-1",
      "symbol": "AAPL",
      "side": "BUY",
      "quantity": 100,
      "entryPrice": 150.25,
      "stopLoss": 147.25,
      "takeProfit": 156.25,
      "timestamp": "2024-01-15T10:30:00Z",
      "formulaId": "sub-1",
      "formulaName": "Momentum Strategy",
      "status": "PENDING",
      "executionMode": "MANUAL",
      "riskLevel": "MEDIUM",
      "confidence": 85,
      "marketCondition": "Bullish momentum",
      "notes": "Strong volume confirmation"
    }
  ],
  "message": "Trade signals retrieved successfully"
}
```

#### GET /trades/:id
Retrieve a specific trade signal by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "trade-1",
    "symbol": "AAPL",
    "side": "BUY",
    "quantity": 100,
    "entryPrice": 150.25,
    "stopLoss": 147.25,
    "takeProfit": 156.25,
    "timestamp": "2024-01-15T10:30:00Z",
    "formulaId": "sub-1",
    "formulaName": "Momentum Strategy",
    "status": "PENDING",
    "executionMode": "MANUAL",
    "riskLevel": "MEDIUM",
    "confidence": 85,
    "marketCondition": "Bullish momentum",
    "notes": "Strong volume confirmation"
  },
  "message": "Trade retrieved successfully"
}
```

#### PATCH /trades/:id/approve
Approve or reject a trade signal. This is the main endpoint for trade execution control.

**Headers:**
```
Content-Type: application/json
User-ID: user-123 (optional)
```

**Request Body:**
```json
{
  "action": "APPROVE" | "REJECT",
  "modifiedQuantity": 150,        // optional
  "modifiedStopLoss": 145.00,     // optional
  "modifiedTakeProfit": 160.00,   // optional
  "notes": "Adjusted position size" // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "trade-1",
    "symbol": "AAPL",
    "side": "BUY",
    "quantity": 150,
    "entryPrice": 150.25,
    "stopLoss": 145.00,
    "takeProfit": 160.00,
    "timestamp": "2024-01-15T10:30:00Z",
    "formulaId": "sub-1",
    "formulaName": "Momentum Strategy",
    "status": "APPROVED",
    "executionMode": "MANUAL",
    "riskLevel": "MEDIUM",
    "confidence": 85,
    "marketCondition": "Bullish momentum",
    "notes": "Adjusted position size"
  },
  "message": "Trade approved successfully"
}
```

**Usage Notes:**
- Only trades with status "PENDING" can be approved or rejected
- When approving, you can modify quantity, stop loss, and take profit values
- The trade status will change to "APPROVED" immediately
- For approved trades, execution will be simulated after a 2-second delay
- All actions are logged as trade events

### Subscription Management

#### GET /subscriptions
Retrieve all formula subscriptions.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "sub-1",
      "name": "Momentum Strategy",
      "description": "High-frequency momentum trading based on price action",
      "executionMode": "MANUAL",
      "isActive": true,
      "riskLevel": "MEDIUM",
      "maxPositionSize": 1000,
      "stopLossPercentage": 2.0,
      "takeProfitPercentage": 4.0,
      "createdAt": "2024-01-15T09:00:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "message": "Subscriptions retrieved successfully"
}
```

#### PATCH /subscriptions/:id
Update a formula subscription.

**Request Body:**
```json
{
  "executionMode": "AUTO" | "MANUAL" | "ALERT_ONLY",
  "isActive": true,
  "riskLevel": "LOW" | "MEDIUM" | "HIGH",
  "maxPositionSize": 1500,
  "stopLossPercentage": 2.5,
  "takeProfitPercentage": 5.0
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "sub-1",
    "name": "Momentum Strategy",
    "description": "High-frequency momentum trading based on price action",
    "executionMode": "AUTO",
    "isActive": true,
    "riskLevel": "MEDIUM",
    "maxPositionSize": 1500,
    "stopLossPercentage": 2.5,
    "takeProfitPercentage": 5.0,
    "createdAt": "2024-01-15T09:00:00Z",
    "updatedAt": "2024-01-15T11:00:00Z"
  },
  "message": "Subscription updated successfully"
}
```

### Event Logging

#### GET /trades/:id/events
Retrieve all events for a specific trade.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "event-1",
      "tradeId": "trade-1",
      "eventType": "SIGNAL_GENERATED",
      "timestamp": "2024-01-15T10:30:00Z",
      "details": {
        "symbol": "AAPL",
        "side": "BUY",
        "quantity": 100
      },
      "userId": "system"
    },
    {
      "id": "event-2",
      "tradeId": "trade-1",
      "eventType": "USER_APPROVED",
      "timestamp": "2024-01-15T10:35:00Z",
      "details": {
        "action": "APPROVE",
        "modifiedQuantity": 150
      },
      "userId": "user-123"
    }
  ],
  "message": "Trade events retrieved successfully"
}
```

#### GET /events
Retrieve all trade events across all trades.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "event-1",
      "tradeId": "trade-1",
      "eventType": "SIGNAL_GENERATED",
      "timestamp": "2024-01-15T10:30:00Z",
      "details": {
        "symbol": "AAPL",
        "side": "BUY",
        "quantity": 100
      },
      "userId": "system"
    }
  ],
  "message": "All trade events retrieved successfully"
}
```

### Health Check

#### GET /health
Check API health status.

**Response:**
```json
{
  "success": true,
  "message": "API is healthy",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error description"
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad Request (invalid data)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

## Trade Execution Modes

### AUTO
- Trades are executed immediately without user confirmation
- Suitable for high-frequency strategies
- Use with caution as there's no manual oversight

### MANUAL
- Trades require explicit user approval via the PATCH /trades/:id/approve endpoint
- Users can modify quantity, stop loss, and take profit before approval
- Provides full control over trade execution

### ALERT_ONLY
- Trades generate notifications but are not executed
- Useful for monitoring and analysis
- No actual trading occurs

## Event Types

- `SIGNAL_GENERATED` - New trade signal created
- `USER_APPROVED` - User approved a trade
- `USER_REJECTED` - User rejected a trade
- `EXECUTION_STARTED` - Trade execution began
- `EXECUTION_COMPLETED` - Trade execution finished successfully
- `EXECUTION_FAILED` - Trade execution failed

## Rate Limiting

Currently, no rate limiting is implemented. In production, implement appropriate rate limiting based on your requirements.

## Security Considerations

1. Implement proper authentication and authorization
2. Validate all input data
3. Use HTTPS in production
4. Implement rate limiting
5. Log all API access for audit purposes
6. Sanitize user inputs to prevent injection attacks

## Development Setup

1. Install dependencies: `npm install`
2. Start the server: `npm run server`
3. Start the frontend: `npm run dev`
4. API will be available at `http://localhost:3001/api`
5. Frontend will be available at `http://localhost:3000`
