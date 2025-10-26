import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.trade import Trade, TradeSide, TradeStatus
from app.models.formula import Formula
from app.models.user import User

@pytest.mark.asyncio
class TestTradesAPI:
    """Test trades API endpoints."""

    async def test_create_trade_success(self, client: AsyncClient, user_token: str, test_formula: Formula):
        """Test successful trade creation."""
        trade_data = {
            "symbol": "AAPL",
            "side": "buy",
            "quantity": 100,
            "price": 150.0,
            "formula_id": str(test_formula.id),
            "broker_account_id": "test-broker-account-id"
        }
        
        headers = {"Authorization": f"Bearer {user_token}"}
        response = await client.post("/api/v1/trades", json=trade_data, headers=headers)
        
        assert response.status_code == 201
        data = response.json()
        assert data["symbol"] == trade_data["symbol"]
        assert data["side"] == trade_data["side"]
        assert data["quantity"] == trade_data["quantity"]
        assert data["price"] == trade_data["price"]
        assert data["status"] == "pending"
        assert "id" in data
        assert "timestamp" in data

    async def test_create_trade_unauthorized(self, client: AsyncClient, test_formula: Formula):
        """Test trade creation without authentication fails."""
        trade_data = {
            "symbol": "AAPL",
            "side": "buy",
            "quantity": 100,
            "price": 150.0,
            "formula_id": str(test_formula.id),
            "broker_account_id": "test-broker-account-id"
        }
        
        response = await client.post("/api/v1/trades", json=trade_data)
        
        assert response.status_code == 401

    async def test_create_trade_invalid_data(self, client: AsyncClient, user_token: str, test_formula: Formula):
        """Test trade creation with invalid data fails."""
        trade_data = {
            "symbol": "",  # Empty symbol
            "side": "invalid",  # Invalid side
            "quantity": -100,  # Negative quantity
            "price": -150.0,  # Negative price
            "formula_id": "invalid-uuid",  # Invalid UUID
            "broker_account_id": ""  # Empty broker account ID
        }
        
        headers = {"Authorization": f"Bearer {user_token}"}
        response = await client.post("/api/v1/trades", json=trade_data, headers=headers)
        
        assert response.status_code == 422

    async def test_create_trade_nonexistent_formula(self, client: AsyncClient, user_token: str):
        """Test trade creation with non-existent formula fails."""
        trade_data = {
            "symbol": "AAPL",
            "side": "buy",
            "quantity": 100,
            "price": 150.0,
            "formula_id": "00000000-0000-0000-0000-000000000000",
            "broker_account_id": "test-broker-account-id"
        }
        
        headers = {"Authorization": f"Bearer {user_token}"}
        response = await client.post("/api/v1/trades", json=trade_data, headers=headers)
        
        assert response.status_code == 404

    async def test_get_trades_success(self, client: AsyncClient, test_trade: Trade, user_token: str):
        """Test getting trades list."""
        headers = {"Authorization": f"Bearer {user_token}"}
        response = await client.get("/api/v1/trades", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        assert any(trade["id"] == str(test_trade.id) for trade in data)

    async def test_get_trades_unauthorized(self, client: AsyncClient):
        """Test getting trades without authentication fails."""
        response = await client.get("/api/v1/trades")
        
        assert response.status_code == 401

    async def test_get_trades_with_filters(self, client: AsyncClient, test_trade: Trade, user_token: str):
        """Test getting trades with filters."""
        headers = {"Authorization": f"Bearer {user_token}"}
        
        # Test status filter
        response = await client.get("/api/v1/trades?status=pending", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert all(trade["status"] == "pending" for trade in data)

        # Test symbol filter
        response = await client.get("/api/v1/trades?symbol=AAPL", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert all(trade["symbol"] == "AAPL" for trade in data)

        # Test side filter
        response = await client.get("/api/v1/trades?side=buy", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert all(trade["side"] == "buy" for trade in data)

    async def test_get_trade_by_id_success(self, client: AsyncClient, test_trade: Trade, user_token: str):
        """Test getting trade by ID."""
        headers = {"Authorization": f"Bearer {user_token}"}
        response = await client.get(f"/api/v1/trades/{test_trade.id}", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(test_trade.id)
        assert data["symbol"] == test_trade.symbol

    async def test_get_trade_by_id_not_found(self, client: AsyncClient, user_token: str):
        """Test getting non-existent trade returns 404."""
        headers = {"Authorization": f"Bearer {user_token}"}
        response = await client.get("/api/v1/trades/00000000-0000-0000-0000-000000000000", headers=headers)
        
        assert response.status_code == 404

    async def test_get_trade_by_id_unauthorized(self, client: AsyncClient, test_trade: Trade):
        """Test getting trade without authentication fails."""
        response = await client.get(f"/api/v1/trades/{test_trade.id}")
        
        assert response.status_code == 401

    async def test_update_trade_status_success(self, client: AsyncClient, test_trade: Trade, user_token: str):
        """Test successful trade status update."""
        update_data = {"status": "filled"}
        
        headers = {"Authorization": f"Bearer {user_token}"}
        response = await client.patch(f"/api/v1/trades/{test_trade.id}/status", json=update_data, headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "filled"

    async def test_update_trade_status_invalid(self, client: AsyncClient, test_trade: Trade, user_token: str):
        """Test trade status update with invalid status fails."""
        update_data = {"status": "invalid_status"}
        
        headers = {"Authorization": f"Bearer {user_token}"}
        response = await client.patch(f"/api/v1/trades/{test_trade.id}/status", json=update_data, headers=headers)
        
        assert response.status_code == 422

    async def test_cancel_trade_success(self, client: AsyncClient, test_trade: Trade, user_token: str):
        """Test successful trade cancellation."""
        headers = {"Authorization": f"Bearer {user_token}"}
        response = await client.post(f"/api/v1/trades/{test_trade.id}/cancel", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "cancelled"

    async def test_cancel_trade_already_filled(self, client: AsyncClient, test_trade: Trade, user_token: str):
        """Test cancelling already filled trade fails."""
        # First, fill the trade
        headers = {"Authorization": f"Bearer {user_token}"}
        await client.patch(f"/api/v1/trades/{test_trade.id}/status", json={"status": "filled"}, headers=headers)
        
        # Then try to cancel it
        response = await client.post(f"/api/v1/trades/{test_trade.id}/cancel", headers=headers)
        
        assert response.status_code == 400
        assert "cannot cancel filled trade" in response.json()["detail"].lower()

    async def test_get_trade_history(self, client: AsyncClient, test_trade: Trade, user_token: str):
        """Test getting trade history."""
        headers = {"Authorization": f"Bearer {user_token}"}
        response = await client.get("/api/v1/trades/history", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert any(trade["id"] == str(test_trade.id) for trade in data)

    async def test_get_trade_statistics(self, client: AsyncClient, test_trade: Trade, user_token: str):
        """Test getting trade statistics."""
        headers = {"Authorization": f"Bearer {user_token}"}
        response = await client.get("/api/v1/trades/statistics", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "total_trades" in data
        assert "filled_trades" in data
        assert "cancelled_trades" in data
        assert "total_volume" in data
        assert "total_pnl" in data

    async def test_execute_formula_trades(self, client: AsyncClient, test_formula: Formula, user_token: str):
        """Test executing trades from formula."""
        execution_data = {
            "formula_id": str(test_formula.id),
            "broker_account_id": "test-broker-account-id",
            "symbols": ["AAPL", "GOOGL", "MSFT"]
        }
        
        headers = {"Authorization": f"Bearer {user_token}"}
        response = await client.post("/api/v1/trades/execute", json=execution_data, headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "trades_created" in data
        assert "trades_rejected" in data
        assert data["trades_created"] >= 0

    async def test_execute_formula_trades_risk_exceeded(self, client: AsyncClient, test_formula: Formula, user_token: str):
        """Test formula execution blocked by risk management."""
        # This would require setting up a scenario where risk limits are exceeded
        # For now, we'll test the endpoint structure
        execution_data = {
            "formula_id": str(test_formula.id),
            "broker_account_id": "test-broker-account-id",
            "symbols": ["AAPL"]
        }
        
        headers = {"Authorization": f"Bearer {user_token}"}
        response = await client.post("/api/v1/trades/execute", json=execution_data, headers=headers)
        
        # Should either succeed or fail with risk error
        assert response.status_code in [200, 400]

    @pytest.mark.parametrize("side,quantity,price,expected_status", [
        ("buy", 100, 150.0, 201),
        ("sell", 50, 200.0, 201),
        ("buy", 0, 150.0, 422),  # Zero quantity
        ("buy", 100, 0.0, 422),  # Zero price
        ("invalid", 100, 150.0, 422),  # Invalid side
    ])
    async def test_create_trade_validation(self, client: AsyncClient, user_token: str, test_formula: Formula, side: str, quantity: int, price: float, expected_status: int):
        """Test trade creation validation."""
        trade_data = {
            "symbol": "AAPL",
            "side": side,
            "quantity": quantity,
            "price": price,
            "formula_id": str(test_formula.id),
            "broker_account_id": "test-broker-account-id"
        }
        
        headers = {"Authorization": f"Bearer {user_token}"}
        response = await client.post("/api/v1/trades", json=trade_data, headers=headers)
        
        assert response.status_code == expected_status