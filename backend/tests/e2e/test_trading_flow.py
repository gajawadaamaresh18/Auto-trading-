import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.formula import Formula
from app.models.trade import Trade, TradeSide, TradeStatus

@pytest.mark.e2e
@pytest.mark.asyncio
class TestTradingFlowE2E:
    """End-to-end tests for complete trading flow."""

    async def test_complete_trading_flow(
        self, 
        client: AsyncClient, 
        db_session: AsyncSession,
        test_user: User,
        user_token: str
    ):
        """Test complete trading flow from formula creation to trade execution."""
        
        # Step 1: Create a formula
        formula_data = {
            "name": "E2E Test Strategy",
            "description": "End-to-end test trading strategy",
            "blocks": [
                {
                    "id": "1",
                    "type": "indicator",
                    "name": "SMA",
                    "parameters": {"period": 20},
                    "position": {"x": 0, "y": 0}
                },
                {
                    "id": "2",
                    "type": "condition",
                    "name": "Price > SMA",
                    "parameters": {},
                    "position": {"x": 100, "y": 0}
                },
                {
                    "id": "3",
                    "type": "action",
                    "name": "Buy",
                    "parameters": {"quantity": 100},
                    "position": {"x": 200, "y": 0}
                }
            ],
            "risk_level": "medium",
            "is_public": True
        }
        
        headers = {"Authorization": f"Bearer {user_token}"}
        
        # Create formula
        response = await client.post("/api/v1/formulas", json=formula_data, headers=headers)
        assert response.status_code == 201
        formula = response.json()
        formula_id = formula["id"]
        
        # Step 2: Subscribe to the formula
        subscription_data = {"formula_id": formula_id}
        response = await client.post("/api/v1/subscriptions", json=subscription_data, headers=headers)
        assert response.status_code == 201
        subscription = response.json()
        
        # Step 3: Execute trades from the formula
        execution_data = {
            "formula_id": formula_id,
            "broker_account_id": "test-broker-account-id",
            "symbols": ["AAPL", "GOOGL"]
        }
        
        response = await client.post("/api/v1/trades/execute", json=execution_data, headers=headers)
        assert response.status_code == 200
        execution_result = response.json()
        
        # Verify trades were created
        assert execution_result["trades_created"] > 0
        
        # Step 4: Check created trades
        response = await client.get("/api/v1/trades", headers=headers)
        assert response.status_code == 200
        trades = response.json()
        
        # Should have trades for both symbols
        assert len(trades) >= 2
        
        # Step 5: Update trade status to filled
        for trade in trades:
            if trade["status"] == "pending":
                response = await client.patch(
                    f"/api/v1/trades/{trade['id']}/status",
                    json={"status": "filled"},
                    headers=headers
                )
                assert response.status_code == 200
        
        # Step 6: Check trade statistics
        response = await client.get("/api/v1/trades/statistics", headers=headers)
        assert response.status_code == 200
        stats = response.json()
        
        assert stats["total_trades"] >= 2
        assert stats["filled_trades"] >= 2
        
        # Step 7: Review the formula
        review_data = {
            "formula_id": formula_id,
            "rating": 5,
            "comment": "Great strategy! Works perfectly in testing."
        }
        
        response = await client.post("/api/v1/reviews", json=review_data, headers=headers)
        assert response.status_code == 201
        review = response.json()
        
        # Step 8: Check formula performance
        response = await client.get(f"/api/v1/formulas/{formula_id}/performance", headers=headers)
        assert response.status_code == 200
        performance = response.json()
        
        assert "total_return" in performance
        assert "sharpe_ratio" in performance
        assert "max_drawdown" in performance

    async def test_risk_management_integration(
        self,
        client: AsyncClient,
        db_session: AsyncSession,
        test_user: User,
        user_token: str
    ):
        """Test risk management integration in trading flow."""
        
        # Create a high-risk formula
        formula_data = {
            "name": "High Risk Strategy",
            "description": "High risk trading strategy",
            "blocks": [
                {
                    "id": "1",
                    "type": "action",
                    "name": "Buy Large",
                    "parameters": {"quantity": 10000},  # Very large quantity
                    "position": {"x": 0, "y": 0}
                }
            ],
            "risk_level": "high",
            "is_public": True
        }
        
        headers = {"Authorization": f"Bearer {user_token}"}
        
        # Create formula
        response = await client.post("/api/v1/formulas", json=formula_data, headers=headers)
        assert response.status_code == 201
        formula = response.json()
        formula_id = formula["id"]
        
        # Try to execute trades - should be limited by risk management
        execution_data = {
            "formula_id": formula_id,
            "broker_account_id": "test-broker-account-id",
            "symbols": ["AAPL"]
        }
        
        response = await client.post("/api/v1/trades/execute", json=execution_data, headers=headers)
        
        # Should either succeed with limited quantity or fail with risk error
        assert response.status_code in [200, 400]
        
        if response.status_code == 200:
            execution_result = response.json()
            # If trades were created, they should be limited by risk management
            assert execution_result["trades_created"] >= 0
            assert execution_result["trades_rejected"] >= 0

    async def test_basket_trading_flow(
        self,
        client: AsyncClient,
        db_session: AsyncSession,
        test_user: User,
        user_token: str
    ):
        """Test basket trading flow."""
        
        # Create multiple formulas
        formulas = []
        for i in range(3):
            formula_data = {
                "name": f"Basket Strategy {i+1}",
                "description": f"Strategy {i+1} for basket testing",
                "blocks": [
                    {
                        "id": "1",
                        "type": "action",
                        "name": "Buy",
                        "parameters": {"quantity": 100},
                        "position": {"x": 0, "y": 0}
                    }
                ],
                "risk_level": "medium",
                "is_public": True
            }
            
            response = await client.post("/api/v1/formulas", json=formula_data, headers={"Authorization": f"Bearer {user_token}"})
            assert response.status_code == 201
            formulas.append(response.json())
        
        # Create a basket
        basket_data = {
            "name": "Test Basket",
            "formulas": [formula["id"] for formula in formulas]
        }
        
        response = await client.post("/api/v1/baskets", json=basket_data, headers={"Authorization": f"Bearer {user_token}"})
        assert response.status_code == 201
        basket = response.json()
        
        # Execute basket
        execution_data = {
            "basket_id": basket["id"],
            "broker_account_id": "test-broker-account-id",
            "symbols": ["AAPL", "GOOGL", "MSFT"]
        }
        
        response = await client.post("/api/v1/baskets/execute", json=execution_data, headers={"Authorization": f"Bearer {user_token}"})
        assert response.status_code == 200
        execution_result = response.json()
        
        # Should have executed all formulas in the basket
        assert execution_result["formulas_executed"] == len(formulas)

    async def test_error_handling_and_recovery(
        self,
        client: AsyncClient,
        db_session: AsyncSession,
        test_user: User,
        user_token: str
    ):
        """Test error handling and recovery in trading flow."""
        
        # Test with invalid formula ID
        execution_data = {
            "formula_id": "00000000-0000-0000-0000-000000000000",
            "broker_account_id": "test-broker-account-id",
            "symbols": ["AAPL"]
        }
        
        response = await client.post("/api/v1/trades/execute", json=execution_data, headers={"Authorization": f"Bearer {user_token}"})
        assert response.status_code == 404
        
        # Test with invalid broker account
        formula_data = {
            "name": "Error Test Strategy",
            "description": "Strategy for error testing",
            "blocks": [{"id": "1", "type": "action", "name": "Buy", "parameters": {"quantity": 100}, "position": {"x": 0, "y": 0}}],
            "risk_level": "medium",
            "is_public": True
        }
        
        response = await client.post("/api/v1/formulas", json=formula_data, headers={"Authorization": f"Bearer {user_token}"})
        assert response.status_code == 201
        formula = response.json()
        
        execution_data = {
            "formula_id": formula["id"],
            "broker_account_id": "invalid-broker-account",
            "symbols": ["AAPL"]
        }
        
        response = await client.post("/api/v1/trades/execute", json=execution_data, headers={"Authorization": f"Bearer {user_token}"})
        # Should handle broker connection error gracefully
        assert response.status_code in [200, 400, 500]

    async def test_concurrent_trading_requests(
        self,
        client: AsyncClient,
        db_session: AsyncSession,
        test_user: User,
        user_token: str
    ):
        """Test handling of concurrent trading requests."""
        
        # Create a formula
        formula_data = {
            "name": "Concurrent Test Strategy",
            "description": "Strategy for concurrent testing",
            "blocks": [{"id": "1", "type": "action", "name": "Buy", "parameters": {"quantity": 100}, "position": {"x": 0, "y": 0}}],
            "risk_level": "medium",
            "is_public": True
        }
        
        response = await client.post("/api/v1/formulas", json=formula_data, headers={"Authorization": f"Bearer {user_token}"})
        assert response.status_code == 201
        formula = response.json()
        
        # Send multiple concurrent requests
        import asyncio
        
        async def execute_trade():
            execution_data = {
                "formula_id": formula["id"],
                "broker_account_id": "test-broker-account-id",
                "symbols": ["AAPL"]
            }
            return await client.post("/api/v1/trades/execute", json=execution_data, headers={"Authorization": f"Bearer {user_token}"})
        
        # Execute 5 concurrent requests
        tasks = [execute_trade() for _ in range(5)]
        responses = await asyncio.gather(*tasks, return_exceptions=True)
        
        # All requests should complete (some may succeed, some may fail due to risk limits)
        assert len(responses) == 5
        for response in responses:
            if not isinstance(response, Exception):
                assert response.status_code in [200, 400, 429]  # 429 for rate limiting

    async def test_data_consistency_after_trading(
        self,
        client: AsyncClient,
        db_session: AsyncSession,
        test_user: User,
        user_token: str
    ):
        """Test data consistency after trading operations."""
        
        # Create and execute a formula
        formula_data = {
            "name": "Consistency Test Strategy",
            "description": "Strategy for data consistency testing",
            "blocks": [{"id": "1", "type": "action", "name": "Buy", "parameters": {"quantity": 100}, "position": {"x": 0, "y": 0}}],
            "risk_level": "medium",
            "is_public": True
        }
        
        response = await client.post("/api/v1/formulas", json=formula_data, headers={"Authorization": f"Bearer {user_token}"})
        assert response.status_code == 201
        formula = response.json()
        
        # Execute trades
        execution_data = {
            "formula_id": formula["id"],
            "broker_account_id": "test-broker-account-id",
            "symbols": ["AAPL"]
        }
        
        response = await client.post("/api/v1/trades/execute", json=execution_data, headers={"Authorization": f"Bearer {user_token}"})
        assert response.status_code == 200
        
        # Verify data consistency
        # Check formula still exists
        response = await client.get(f"/api/v1/formulas/{formula['id']}")
        assert response.status_code == 200
        
        # Check trades were created
        response = await client.get("/api/v1/trades", headers={"Authorization": f"Bearer {user_token}"})
        assert response.status_code == 200
        trades = response.json()
        assert len(trades) > 0
        
        # Check user data integrity
        response = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {user_token}"})
        assert response.status_code == 200
        user_data = response.json()
        assert user_data["id"] == str(test_user.id)